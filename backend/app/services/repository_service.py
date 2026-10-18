"""
Repository service handling validation, lifecycle, and Git ingestion orchestration.
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path

import pygit2
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.commit import Commit
from app.models.file_node import FileNode
from app.models.repository import Repository, RepositoryStatus
from app.models.snapshot import Snapshot
from app.schemas.repository import CommitSummary, RepositoryDetailResponse, RepositoryResponse, SnapshotSummary
from app.services.git_service import GitService

logger = logging.getLogger(__name__)


# ── Exceptions ─────────────────────────────────────────────────────────────────
class RepositoryServiceError(Exception):
    """Base exception for all repository service errors."""

    def __init__(
        self,
        message: str,
        code: str = "REPOSITORY_ERROR",
        status_code: int = 400,
        detail: str | None = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.detail = detail


class PathNotFoundError(RepositoryServiceError):
    def __init__(self, path: str):
        super().__init__(
            message=f"Path does not exist: {path}",
            code="PATH_NOT_FOUND",
            status_code=400,
        )


class NotADirectoryError(RepositoryServiceError):
    def __init__(self, path: str):
        super().__init__(
            message=f"Path is not a directory: {path}",
            code="NOT_A_DIRECTORY",
            status_code=400,
        )


class AccessDeniedError(RepositoryServiceError):
    def __init__(self, detail: str):
        super().__init__(
            message="Access denied: path is outside allowed repository roots",
            code="ACCESS_DENIED",
            status_code=403,
            detail=detail,
        )


class NotAGitRepositoryError(RepositoryServiceError):
    def __init__(self, path: str):
        super().__init__(
            message=f"Directory is not a valid Git repository: {path}",
            code="NOT_A_GIT_REPOSITORY",
            status_code=400,
        )


class RepositoryNotFoundError(RepositoryServiceError):
    def __init__(self, repo_id: str):
        super().__init__(
            message=f"Repository not found: {repo_id}",
            code="REPOSITORY_NOT_FOUND",
            status_code=404,
        )


class RepositoryService:
    """Service orchestrating path validation, database persistence, and Git ingestion."""

    @staticmethod
    def validate_and_canonicalize_path(
        local_path: str,
        allowed_roots: list[str] | None = None,
    ) -> Path:
        """
        Validate that local_path exists, is a directory, is inside ALLOWED_REPO_ROOTS,
        and is a valid Git repository.

        Canonicalizes paths using Path.resolve(strict=True) to prevent symlink bypasses
        and path traversal attacks.
        """
        if not local_path or not local_path.strip():
            raise PathNotFoundError("Path cannot be empty.")

        cleaned_path = local_path.strip()

        # Canonicalize path and verify existence
        try:
            target_path = Path(cleaned_path).resolve(strict=True)
        except (FileNotFoundError, RuntimeError) as exc:
            raise PathNotFoundError(cleaned_path) from exc
        except PermissionError as exc:
            raise AccessDeniedError(f"Filesystem permission denied: {cleaned_path}") from exc

        if not target_path.is_dir():
            raise NotADirectoryError(str(target_path))

        # Check ALLOWED_REPO_ROOTS
        roots_config = allowed_roots if allowed_roots is not None else settings.allowed_repo_roots
        roots = [Path(r).resolve() for r in roots_config if r.strip()]

        if not roots:
            raise AccessDeniedError(
                "ALLOWED_REPO_ROOTS is not configured or empty. "
                "Local repository registration is restricted for security."
            )

        is_allowed = False
        for root in roots:
            try:
                target_path.relative_to(root)
                is_allowed = True
                break
            except ValueError:
                continue

        if not is_allowed:
            raise AccessDeniedError(
                f"Path '{target_path}' is outside all configured repository roots."
            )

        # Validate that it is a valid Git repository
        try:
            pygit_repo = GitService.open_repository(target_path)
        except pygit2.GitError as exc:
            raise NotAGitRepositoryError(str(target_path)) from exc

        # If it has a workdir, ensure target_path matches repository root
        if pygit_repo.workdir:
            workdir_path = Path(pygit_repo.workdir).resolve()
            if target_path != workdir_path:
                # User specified a subfolder inside a repository
                target_path = workdir_path

        return target_path

    @classmethod
    async def register_repository(
        cls,
        db: AsyncSession,
        local_path: str,
        name: str | None = None,
        allowed_roots: list[str] | None = None,
    ) -> tuple[Repository, bool]:
        """
        Register a repository by path and immediately run ingestion.

        Returns:
            (Repository, created: bool)
        """
        canonical_path = cls.validate_and_canonicalize_path(local_path, allowed_roots)
        path_str = str(canonical_path)

        # Check if already registered
        stmt = select(Repository).where(Repository.local_path == path_str)
        existing = (await db.execute(stmt)).scalar_one_or_none()

        if existing:
            # If previously registered and ready, return existing record
            if existing.status == RepositoryStatus.READY.value:
                return existing, False
            repo = existing
            created = False
        else:
            repo_name = name.strip() if name and name.strip() else canonical_path.name
            repo = Repository(
                id=uuid.uuid4(),
                name=repo_name,
                local_path=path_str,
                status=RepositoryStatus.PENDING.value,
            )
            db.add(repo)
            await db.flush()
            created = True

        # Perform ingestion
        await cls._ingest_repository(db, repo, canonical_path)
        return repo, created

    @classmethod
    async def _ingest_repository(
        cls,
        db: AsyncSession,
        repo: Repository,
        canonical_path: Path,
    ) -> None:
        """Execute full Git ingestion pipeline for a registered repository."""
        pygit_repo = GitService.open_repository(canonical_path)
        metadata = GitService.extract_metadata(pygit_repo)

        repo.default_branch = metadata.default_branch
        repo.remote_url = metadata.remote_url

        # Handle empty repository
        if metadata.is_empty:
            repo.head_commit_sha = None
            repo.status = RepositoryStatus.READY.value
            repo.status_message = "Empty repository with no commits"
            repo.ingested_at = datetime.now(timezone.utc)
            await db.commit()
            await db.refresh(repo)
            return

        # Repository with commits
        repo.status = RepositoryStatus.ANALYZING.value
        repo.head_commit_sha = metadata.head_commit_sha
        await db.flush()

        try:
            commits_data, churn_counts, last_modified = GitService.extract_commits_and_churn(
                pygit_repo
            )

            # Ingest commits idempotently
            existing_shas_stmt = select(Commit.sha).where(Commit.repository_id == repo.id)
            existing_shas = set((await db.scalars(existing_shas_stmt)).all())

            new_commits = [
                Commit(
                    id=uuid.uuid4(),
                    repository_id=repo.id,
                    sha=c.sha,
                    message=c.message,
                    author_name=c.author_name,
                    author_email=c.author_email,
                    authored_at=c.authored_at,
                    files_changed_count=c.files_changed_count,
                    insertions=c.insertions,
                    deletions=c.deletions,
                    is_merge=c.is_merge,
                )
                for c in commits_data
                if c.sha not in existing_shas
            ]
            if new_commits:
                db.add_all(new_commits)

            # Create or reuse Snapshot for current HEAD
            assert metadata.head_commit_sha is not None
            snap_stmt = select(Snapshot).where(
                Snapshot.repository_id == repo.id,
                Snapshot.commit_sha == metadata.head_commit_sha,
            )
            snapshot = (await db.execute(snap_stmt)).scalar_one_or_none()

            if not snapshot:
                snapshot = Snapshot(
                    id=uuid.uuid4(),
                    repository_id=repo.id,
                    commit_sha=metadata.head_commit_sha,
                    commit_message=metadata.head_message,
                    author=metadata.head_author,
                    authored_at=metadata.head_authored_at,
                    analysis_started_at=datetime.now(timezone.utc),
                )
                db.add(snapshot)
                await db.flush()

            # Enumerate and store file nodes for this snapshot
            nodes_count_stmt = select(func.count(FileNode.id)).where(
                FileNode.snapshot_id == snapshot.id
            )
            existing_nodes_count = (await db.scalar(nodes_count_stmt)) or 0

            if existing_nodes_count == 0:
                file_nodes_data = GitService.extract_head_tree_nodes(
                    pygit_repo, churn_counts, last_modified
                )
                file_node_entities = [
                    FileNode(
                        id=uuid.uuid4(),
                        snapshot_id=snapshot.id,
                        path=fn.path,
                        node_type=fn.node_type,
                        language=fn.language,
                        size_bytes=fn.size_bytes,
                        line_count=fn.line_count,
                        churn_count=fn.churn_count,
                        last_modified_sha=fn.last_modified_sha,
                        is_entry_point=fn.is_entry_point,
                        in_degree=0,
                        out_degree=0,
                        pagerank=None,
                    )
                    for fn in file_nodes_data
                ]
                if file_node_entities:
                    db.add_all(file_node_entities)
                snapshot.node_count = len(file_node_entities)

            snapshot.analysis_completed_at = datetime.now(timezone.utc)
            snapshot.error_message = None

            repo.status = RepositoryStatus.READY.value
            repo.status_message = (
                f"Ingested {len(commits_data)} commits and {snapshot.node_count} file nodes "
                f"at HEAD ({metadata.head_commit_sha[:8]})"
            )
            repo.ingested_at = datetime.now(timezone.utc)

            await db.commit()
            await db.refresh(repo)

        except Exception as exc:
            logger.exception("Ingestion failed for repository %s", repo.id)
            await db.rollback()

            repo.status = RepositoryStatus.ERROR.value
            repo.status_message = f"Ingestion error: {exc}"
            db.add(repo)
            await db.commit()
            await db.refresh(repo)
            raise

    @classmethod
    async def get_repository(cls, db: AsyncSession, repo_id: uuid.UUID) -> Repository:
        """Fetch a single repository by UUID."""
        stmt = select(Repository).where(Repository.id == repo_id)
        repo = (await db.execute(stmt)).scalar_one_or_none()
        if not repo:
            raise RepositoryNotFoundError(str(repo_id))
        return repo

    @classmethod
    async def list_repositories(
        cls, db: AsyncSession, skip: int = 0, limit: int = 50
    ) -> tuple[list[RepositoryResponse], int]:
        """Fetch paginated list of repositories with summary counts."""
        total_stmt = select(func.count(Repository.id))
        total = (await db.scalar(total_stmt)) or 0

        repos_stmt = (
            select(Repository)
            .order_by(Repository.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        repos = (await db.scalars(repos_stmt)).all()

        items: list[RepositoryResponse] = []
        for repo in repos:
            counts = await cls.get_repository_counts(db, repo.id)
            resp = RepositoryResponse.model_validate(repo)
            resp.commit_count = counts["commit_count"]
            resp.file_count = counts["file_count"]
            items.append(resp)

        return items, total

    @classmethod
    async def get_repository_counts(
        cls, db: AsyncSession, repo_id: uuid.UUID
    ) -> dict[str, int]:
        """Get total commits and file nodes at the latest snapshot."""
        commit_count_stmt = select(func.count(Commit.id)).where(Commit.repository_id == repo_id)
        commit_count = (await db.scalar(commit_count_stmt)) or 0

        # File count at latest snapshot
        latest_snap_stmt = (
            select(Snapshot)
            .where(Snapshot.repository_id == repo_id)
            .order_by(Snapshot.analysis_started_at.desc())
            .limit(1)
        )
        latest_snap = (await db.execute(latest_snap_stmt)).scalar_one_or_none()
        file_count = latest_snap.node_count if latest_snap else 0

        return {"commit_count": commit_count, "file_count": file_count}

    @classmethod
    async def get_repository_detail(
        cls, db: AsyncSession, repo_id: uuid.UUID
    ) -> RepositoryDetailResponse:
        """Fetch full repository details, counts, latest snapshot, and recent commits."""
        repo = await cls.get_repository(db, repo_id)
        counts = await cls.get_repository_counts(db, repo_id)

        # Latest snapshot
        snap_stmt = (
            select(Snapshot)
            .where(Snapshot.repository_id == repo_id)
            .order_by(Snapshot.analysis_started_at.desc())
            .limit(1)
        )
        snap = (await db.execute(snap_stmt)).scalar_one_or_none()
        snap_summary = SnapshotSummary.model_validate(snap) if snap else None

        # Recent 10 commits
        commits_stmt = (
            select(Commit)
            .where(Commit.repository_id == repo_id)
            .order_by(Commit.authored_at.desc().nulls_last())
            .limit(10)
        )
        recent_commits = (await db.scalars(commits_stmt)).all()
        commit_summaries = [CommitSummary.model_validate(c) for c in recent_commits]

        detail = RepositoryDetailResponse.model_validate(repo)
        detail.commit_count = counts["commit_count"]
        detail.file_count = counts["file_count"]
        detail.latest_snapshot = snap_summary
        detail.recent_commits = commit_summaries
        return detail

    @classmethod
    async def sync_repository(
        cls, db: AsyncSession, repo_id: uuid.UUID
    ) -> RepositoryResponse:
        """Re-sync and re-ingest an existing repository from its local filesystem path."""
        repo = await cls.get_repository(db, repo_id)
        canonical_path = Path(repo.local_path)
        await cls._ingest_repository(db, repo, canonical_path)

        counts = await cls.get_repository_counts(db, repo_id)
        resp = RepositoryResponse.model_validate(repo)
        resp.commit_count = counts["commit_count"]
        resp.file_count = counts["file_count"]
        return resp
