"""
Comprehensive tests for Stage 2: Repository Registration and Git Ingestion.

Tests verify:
- Path validation, canonicalization, allowed roots, and path traversal prevention.
- Empty repository handling.
- Real Git commit and file tree ingestion using Pygit2 and temporary repositories.
- Database persistence and integrity (inspecting actual DB records).
- Idempotency on duplicate registration and re-syncing.
- Listing and detail API endpoints with proper error codes and schemas.
"""
from __future__ import annotations

import time
import uuid
from pathlib import Path

import pygit2
import pytest
from httpx import AsyncClient
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.commit import Commit
from app.models.file_node import FileNode
from app.models.repository import Repository
from app.models.snapshot import Snapshot


# ── Test Git Helpers ───────────────────────────────────────────────────────────
def make_git_repo(path: Path) -> tuple[pygit2.Repository, list[str]]:
    """Create a real temporary Git repository with multiple commits and file types."""
    repo = pygit2.init_repository(str(path), False)
    author = pygit2.Signature("Test Committer", "committer@commitscope.org", int(time.time()), 0)

    # Commit 1
    (path / "README.md").write_text("# Test Repo\nFirst line.\n", encoding="utf-8")
    (path / "src").mkdir(parents=True, exist_ok=True)
    (path / "src" / "main.py").write_text("import sys\nprint('hello')\n", encoding="utf-8")

    repo.index.add_all()
    repo.index.write()
    t1 = repo.index.write_tree()
    c1 = repo.create_commit("refs/heads/main", author, author, "feat: initial commit", t1, [])

    # Commit 2 (churns src/main.py, adds src/calc.py)
    (path / "src" / "main.py").write_text(
        "import sys\nprint('hello')\nprint('world')\n", encoding="utf-8"
    )
    (path / "src" / "calc.py").write_text(
        "def add(a: int, b: int) -> int:\n    return a + b\n", encoding="utf-8"
    )
    repo.index.add_all()
    repo.index.write()
    t2 = repo.index.write_tree()
    c2 = repo.create_commit("refs/heads/main", author, author, "feat: add calc and update main", t2, [c1])

    # Commit 3 (adds a binary file)
    (path / "binary.dat").write_bytes(b"\x00\x01\x02\x03\x00commitscope")
    repo.index.add_all()
    repo.index.write()
    t3 = repo.index.write_tree()
    c3 = repo.create_commit("refs/heads/main", author, author, "chore: add binary file", t3, [c2])

    repo.set_head("refs/heads/main")
    return repo, [str(c1), str(c2), str(c3)]


# ── 1. Path Security & Validation ──────────────────────────────────────────────
class TestPathSecurityAndValidation:
    async def test_nonexistent_path_returns_400(self, client: AsyncClient, monkeypatch, tmp_path: Path):
        monkeypatch.setattr(settings, "allowed_repo_roots", [str(tmp_path)])
        non_existent = tmp_path / "does_not_exist"

        resp = await client.post("/api/v1/repositories", json={"local_path": str(non_existent)})
        assert resp.status_code == 400
        data = resp.json()
        assert data["code"] == "PATH_NOT_FOUND"
        assert "Path does not exist" in data["message"]

    async def test_file_instead_of_dir_returns_400(self, client: AsyncClient, monkeypatch, tmp_path: Path):
        monkeypatch.setattr(settings, "allowed_repo_roots", [str(tmp_path)])
        file_path = tmp_path / "regular_file.txt"
        file_path.write_text("not a directory")

        resp = await client.post("/api/v1/repositories", json={"local_path": str(file_path)})
        assert resp.status_code == 400
        data = resp.json()
        assert data["code"] == "NOT_A_DIRECTORY"

    async def test_outside_allowed_roots_returns_403(self, client: AsyncClient, monkeypatch, tmp_path: Path):
        allowed_dir = tmp_path / "allowed"
        allowed_dir.mkdir()
        unallowed_dir = tmp_path / "forbidden"
        unallowed_dir.mkdir()
        pygit2.init_repository(str(unallowed_dir), False)

        monkeypatch.setattr(settings, "allowed_repo_roots", [str(allowed_dir)])

        resp = await client.post("/api/v1/repositories", json={"local_path": str(unallowed_dir)})
        assert resp.status_code == 403
        data = resp.json()
        assert data["code"] == "ACCESS_DENIED"

    async def test_empty_allowed_roots_rejects_all_with_403(
        self, client: AsyncClient, monkeypatch, tmp_path: Path
    ):
        repo_dir = tmp_path / "repo"
        repo_dir.mkdir()
        pygit2.init_repository(str(repo_dir), False)

        monkeypatch.setattr(settings, "allowed_repo_roots", [])

        resp = await client.post("/api/v1/repositories", json={"local_path": str(repo_dir)})
        assert resp.status_code == 403
        assert resp.json()["code"] == "ACCESS_DENIED"

    async def test_path_traversal_attack_blocked(
        self, client: AsyncClient, monkeypatch, tmp_path: Path
    ):
        allowed_dir = tmp_path / "allowed"
        allowed_dir.mkdir()
        outside_dir = tmp_path / "outside_secret"
        outside_dir.mkdir()
        pygit2.init_repository(str(outside_dir), False)

        monkeypatch.setattr(settings, "allowed_repo_roots", [str(allowed_dir)])

        # Attempt ../ traversal out of allowed_dir
        traversal_path = str(allowed_dir / ".." / "outside_secret")
        resp = await client.post("/api/v1/repositories", json={"local_path": traversal_path})
        assert resp.status_code == 403
        assert resp.json()["code"] == "ACCESS_DENIED"

    async def test_symlink_outside_allowed_roots_blocked(
        self, client: AsyncClient, monkeypatch, tmp_path: Path
    ):
        import os
        allowed_dir = tmp_path / "allowed"
        allowed_dir.mkdir()
        outside_dir = tmp_path / "secret_repo"
        outside_dir.mkdir()
        pygit2.init_repository(str(outside_dir), False)

        symlink_path = allowed_dir / "symlink_repo"
        try:
            os.symlink(outside_dir, symlink_path, target_is_directory=True)
        except OSError:
            pytest.skip("Symlink creation not permitted on this host OS without privileges")

        monkeypatch.setattr(settings, "allowed_repo_roots", [str(allowed_dir)])
        resp = await client.post("/api/v1/repositories", json={"local_path": str(symlink_path)})
        assert resp.status_code == 403
        assert resp.json()["code"] == "ACCESS_DENIED"

    async def test_symlink_mocked_escape_blocked(
        self, client: AsyncClient, monkeypatch, tmp_path: Path
    ):
        allowed_dir = tmp_path / "allowed"
        allowed_dir.mkdir()
        fake_symlink = allowed_dir / "link_to_external"
        fake_symlink.mkdir()
        pygit2.init_repository(str(fake_symlink), False)

        monkeypatch.setattr(settings, "allowed_repo_roots", [str(allowed_dir)])

        outside_target = (tmp_path / "outside_target").resolve()
        outside_target.mkdir()
        original_resolve = Path.resolve

        def mock_resolve(self_path, strict=False):
            if self_path.name == "link_to_external":
                return outside_target
            return original_resolve(self_path, strict=strict)

        monkeypatch.setattr(Path, "resolve", mock_resolve)
        resp = await client.post("/api/v1/repositories", json={"local_path": str(fake_symlink)})
        assert resp.status_code == 403
        assert resp.json()["code"] == "ACCESS_DENIED"

    async def test_non_git_directory_returns_400(
        self, client: AsyncClient, monkeypatch, tmp_path: Path
    ):
        regular_dir = tmp_path / "not_git"
        regular_dir.mkdir()

        monkeypatch.setattr(settings, "allowed_repo_roots", [str(tmp_path)])

        resp = await client.post("/api/v1/repositories", json={"local_path": str(regular_dir)})
        assert resp.status_code == 400
        data = resp.json()
        assert data["code"] == "NOT_A_GIT_REPOSITORY"


# ── 2. Empty Repository Handling ───────────────────────────────────────────────
class TestEmptyRepository:
    async def test_register_empty_git_repository(
        self, client: AsyncClient, db_session: AsyncSession, monkeypatch, tmp_path: Path
    ):
        repo_dir = tmp_path / "empty_repo"
        pygit2.init_repository(str(repo_dir), False)

        monkeypatch.setattr(settings, "allowed_repo_roots", [str(tmp_path)])

        resp = await client.post("/api/v1/repositories", json={"local_path": str(repo_dir)})
        assert resp.status_code == 201
        data = resp.json()

        assert data["name"] == "empty_repo"
        assert data["status"] == "ready"
        assert "Empty repository" in data["status_message"]
        assert data["head_commit_sha"] is None
        assert data["commit_count"] == 0
        assert data["file_count"] == 0

        # Verify DB directly
        db_repos = (await db_session.scalars(select(Repository))).all()
        assert len(db_repos) == 1
        assert db_repos[0].name == "empty_repo"

        db_commits = (await db_session.scalars(select(Commit))).all()
        assert len(db_commits) == 0

        db_nodes = (await db_session.scalars(select(FileNode))).all()
        assert len(db_nodes) == 0


# ── 3. Real Git Commit & File Ingestion ─────────────────────────────────────────
class TestRealGitIngestion:
    async def test_register_and_ingest_commits_and_files(
        self, client: AsyncClient, db_session: AsyncSession, monkeypatch, tmp_path: Path
    ):
        repo_dir = tmp_path / "my_project"
        _, shas = make_git_repo(repo_dir)

        monkeypatch.setattr(settings, "allowed_repo_roots", [str(tmp_path)])

        resp = await client.post(
            "/api/v1/repositories",
            json={"local_path": str(repo_dir), "name": "Custom Project Name"},
        )
        assert resp.status_code == 201
        data = resp.json()

        assert data["name"] == "Custom Project Name"
        assert data["status"] == "ready"
        assert data["default_branch"] == "main"
        assert data["head_commit_sha"] == shas[-1]
        assert data["commit_count"] == 3
        assert data["file_count"] >= 4

        repo_id = uuid.UUID(data["id"])

        # ── Verify Commits in DB ──────────────────────────────────────────────
        commits_stmt = select(Commit).where(Commit.repository_id == repo_id).order_by(Commit.authored_at)
        db_commits = (await db_session.scalars(commits_stmt)).all()
        assert len(db_commits) == 3

        persisted_shas = [c.sha for c in db_commits]
        assert set(persisted_shas) == set(shas)

        # Check commit stats populated
        initial_commit = [c for c in db_commits if c.sha == shas[0]][0]
        assert initial_commit.message == "feat: initial commit"
        assert initial_commit.author_name == "Test Committer"
        assert initial_commit.files_changed_count == 2
        assert initial_commit.insertions > 0
        assert initial_commit.is_merge is False

        # ── Verify Snapshot in DB ─────────────────────────────────────────────
        snap_stmt = select(Snapshot).where(Snapshot.repository_id == repo_id)
        db_snap = (await db_session.execute(snap_stmt)).scalar_one_or_none()
        assert db_snap is not None
        assert db_snap.commit_sha == shas[-1]
        assert db_snap.analysis_completed_at is not None
        assert db_snap.error_message is None

        # ── Verify File Nodes in DB ───────────────────────────────────────────
        nodes_stmt = select(FileNode).where(FileNode.snapshot_id == db_snap.id)
        db_nodes = (await db_session.scalars(nodes_stmt)).all()
        node_paths = {n.path: n for n in db_nodes}

        # Check file nodes exist
        assert "src/main.py" in node_paths
        assert "src/calc.py" in node_paths
        assert "README.md" in node_paths
        assert "binary.dat" in node_paths
        assert "src" in node_paths  # directory node

        # Check src/main.py attributes
        main_node = node_paths["src/main.py"]
        assert main_node.node_type == "file"
        assert main_node.language == "python"
        assert main_node.is_entry_point is True  # main.py is recognized as entry point
        assert main_node.line_count == 3
        # churn: modified in commit 1 and commit 2 -> churn == 2!
        assert main_node.churn_count == 2

        # Check binary file
        bin_node = node_paths["binary.dat"]
        assert bin_node.node_type == "file"
        assert bin_node.line_count is None  # binary files have None line_count
        assert bin_node.churn_count == 1

        # Check directory node
        src_dir = node_paths["src"]
        assert src_dir.node_type == "directory"
        assert src_dir.language is None

    async def test_detached_head_handled_cleanly(
        self, client: AsyncClient, monkeypatch, tmp_path: Path
    ):
        repo_dir = tmp_path / "detached_repo"
        repo, shas = make_git_repo(repo_dir)

        # Detach HEAD to c1
        repo.set_head(pygit2.Oid(hex=shas[0]))
        assert repo.head_is_detached

        monkeypatch.setattr(settings, "allowed_repo_roots", [str(tmp_path)])

        resp = await client.post("/api/v1/repositories", json={"local_path": str(repo_dir)})
        assert resp.status_code == 201
        data = resp.json()
        assert data["status"] == "ready"
        assert data["default_branch"] == "HEAD"
        assert data["head_commit_sha"] == shas[0]


# ── 4. Idempotency & Re-sync ───────────────────────────────────────────────────
class TestIdempotencyAndSync:
    async def test_duplicate_registration_returns_200_without_duplicates(
        self, client: AsyncClient, db_session: AsyncSession, monkeypatch, tmp_path: Path
    ):
        repo_dir = tmp_path / "idempotent_repo"
        make_git_repo(repo_dir)

        monkeypatch.setattr(settings, "allowed_repo_roots", [str(tmp_path)])

        # First registration -> 201 Created
        resp1 = await client.post("/api/v1/repositories", json={"local_path": str(repo_dir)})
        assert resp1.status_code == 201
        repo_id = resp1.json()["id"]

        # Second registration -> 200 OK
        resp2 = await client.post("/api/v1/repositories", json={"local_path": str(repo_dir)})
        assert resp2.status_code == 200
        assert resp2.json()["id"] == repo_id

        # Verify DB has no duplicates
        repo_count = (await db_session.scalar(select(func.count(Repository.id)))) or 0
        assert repo_count == 1

        commit_count = (await db_session.scalar(select(func.count(Commit.id)))) or 0
        assert commit_count == 3

    async def test_sync_repository_picks_up_new_commit(
        self, client: AsyncClient, db_session: AsyncSession, monkeypatch, tmp_path: Path
    ):
        repo_dir = tmp_path / "sync_repo"
        repo, shas = make_git_repo(repo_dir)

        monkeypatch.setattr(settings, "allowed_repo_roots", [str(tmp_path)])

        # Register
        resp = await client.post("/api/v1/repositories", json={"local_path": str(repo_dir)})
        assert resp.status_code == 201
        repo_id = resp.json()["id"]
        assert resp.json()["commit_count"] == 3

        # Add a 4th commit
        author = pygit2.Signature("New Author", "new@commitscope.org", int(time.time()), 0)
        (repo_dir / "new_feature.py").write_text("print('stage 2')\n", encoding="utf-8")
        repo.index.add_all()
        repo.index.write()
        t4 = repo.index.write_tree()
        c4 = repo.create_commit("refs/heads/main", author, author, "feat: fourth commit", t4, [pygit2.Oid(hex=shas[-1])])

        # Trigger sync
        sync_resp = await client.post(f"/api/v1/repositories/{repo_id}/sync")
        assert sync_resp.status_code == 200
        data = sync_resp.json()
        assert data["head_commit_sha"] == str(c4)
        assert data["commit_count"] == 4


# ── 5. Repository Listing & Details ────────────────────────────────────────────
class TestRepositoryEndpoints:
    async def test_list_and_get_details(
        self, client: AsyncClient, monkeypatch, tmp_path: Path
    ):
        monkeypatch.setattr(settings, "allowed_repo_roots", [str(tmp_path)])

        repo1 = tmp_path / "repo1"
        make_git_repo(repo1)
        repo2 = tmp_path / "repo2"
        make_git_repo(repo2)

        r1 = await client.post("/api/v1/repositories", json={"local_path": str(repo1)})
        r2 = await client.post("/api/v1/repositories", json={"local_path": str(repo2)})
        assert r1.status_code == 201
        assert r2.status_code == 201

        # List
        list_resp = await client.get("/api/v1/repositories")
        assert list_resp.status_code == 200
        list_data = list_resp.json()
        assert list_data["total"] == 2
        assert len(list_data["items"]) == 2

        # Get Detail
        repo1_id = r1.json()["id"]
        detail_resp = await client.get(f"/api/v1/repositories/{repo1_id}")
        assert detail_resp.status_code == 200
        detail_data = detail_resp.json()
        assert detail_data["id"] == repo1_id
        assert detail_data["latest_snapshot"] is not None
        assert len(detail_data["recent_commits"]) == 3

    async def test_get_nonexistent_repository_returns_404(self, client: AsyncClient):
        random_id = uuid.uuid4()
        resp = await client.get(f"/api/v1/repositories/{random_id}")
        assert resp.status_code == 404
        assert resp.json()["code"] == "REPOSITORY_NOT_FOUND"
