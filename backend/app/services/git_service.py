"""
Git extraction service using Pygit2 (libgit2).

Extracts actual commit logs, diff stats, per-file churn, and repository trees.
Never fabricates data. Computes metrics deterministically from real Git objects.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import TYPE_CHECKING

import pygit2

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)

# Standard language detection by file extension
LANGUAGE_EXTENSIONS: dict[str, str] = {
    ".py": "python",
    ".pyw": "python",
    ".js": "javascript",
    ".mjs": "javascript",
    ".cjs": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".mts": "typescript",
    ".cts": "typescript",
    ".tsx": "typescript",
    ".json": "json",
    ".html": "html",
    ".htm": "html",
    ".css": "css",
    ".scss": "scss",
    ".sass": "sass",
    ".less": "less",
    ".md": "markdown",
    ".markdown": "markdown",
    ".rs": "rust",
    ".go": "go",
    ".java": "java",
    ".c": "c",
    ".h": "c",
    ".cpp": "cpp",
    ".hpp": "cpp",
    ".cc": "cpp",
    ".cxx": "cpp",
    ".cs": "csharp",
    ".rb": "ruby",
    ".php": "php",
    ".sh": "shell",
    ".bash": "shell",
    ".zsh": "shell",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".toml": "toml",
    ".sql": "sql",
    ".xml": "xml",
}

# Entry point detection heuristics
ENTRY_POINT_FILENAMES: set[str] = {
    "__main__.py",
    "main.py",
    "app.py",
    "index.js",
    "index.ts",
    "index.jsx",
    "index.tsx",
    "server.js",
    "server.ts",
    "main.go",
    "main.rs",
    "index.html",
}


@dataclass(frozen=True)
class GitCommitData:
    """Extracted metadata for a single Git commit."""

    sha: str
    message: str | None
    author_name: str | None
    author_email: str | None
    authored_at: datetime | None
    files_changed_count: int
    insertions: int
    deletions: int
    is_merge: bool


@dataclass(frozen=True)
class GitFileData:
    """Extracted file/directory node at a specific tree snapshot."""

    path: str
    node_type: str  # "file" or "directory"
    language: str | None
    size_bytes: int
    line_count: int | None
    churn_count: int
    last_modified_sha: str | None
    is_entry_point: bool


@dataclass(frozen=True)
class GitRepoMetadata:
    """Summary of repository identity, HEAD ref, and remote."""

    is_empty: bool
    default_branch: str
    head_commit_sha: str | None
    remote_url: str | None
    head_message: str | None = None
    head_author: str | None = None
    head_authored_at: datetime | None = None


class GitService:
    """Pygit2 wrapper for inspecting and ingesting real Git repositories."""

    @staticmethod
    def open_repository(path: Path | str) -> pygit2.Repository:
        """
        Open a Git repository from filesystem path.

        Raises:
            pygit2.GitError: If the path is not a valid Git repository.
        """
        return pygit2.Repository(str(path))

    @staticmethod
    def extract_metadata(repo: pygit2.Repository) -> GitRepoMetadata:
        """Extract high-level repository metadata (HEAD, branch, origin URL)."""
        # Determine remote URL if origin is configured
        remote_url: str | None = None
        if "origin" in repo.remotes:
            remote_url = repo.remotes["origin"].url

        # Check for empty repository or unborn HEAD
        if repo.is_empty or repo.head_is_unborn:
            default_branch = "main"
            head_ref = repo.references.get("HEAD")
            if head_ref and hasattr(head_ref, "target") and isinstance(head_ref.target, str):
                default_branch = head_ref.target.replace("refs/heads/", "")

            return GitRepoMetadata(
                is_empty=True,
                default_branch=default_branch,
                head_commit_sha=None,
                remote_url=remote_url,
            )

        # HEAD commit exists
        head_commit = repo[repo.head.target]
        head_sha = str(head_commit.id)

        if repo.head_is_detached:
            default_branch = "HEAD"
        else:
            default_branch = repo.head.shorthand

        authored_at = datetime.fromtimestamp(head_commit.author.time, tz=timezone.utc)

        return GitRepoMetadata(
            is_empty=False,
            default_branch=default_branch,
            head_commit_sha=head_sha,
            remote_url=remote_url,
            head_message=head_commit.message.strip() if head_commit.message else None,
            head_author=head_commit.author.name,
            head_authored_at=authored_at,
        )

    @staticmethod
    def extract_commits_and_churn(
        repo: pygit2.Repository,
        max_commits: int | None = None,
    ) -> tuple[list[GitCommitData], dict[str, int], dict[str, str]]:
        """
        Walk commit history starting from HEAD.

        Computes:
            1. List of GitCommitData (SHAs, author, timestamp, diff stats).
            2. Churn map: relative path -> count of commits touching it.
            3. Last modified map: relative path -> most recent commit SHA touching it.

        Returns:
            (commits, churn_counts, last_modified)
        """
        if repo.is_empty or repo.head_is_unborn:
            return [], {}, {}

        commits: list[GitCommitData] = []
        churn_counts: dict[str, int] = {}
        last_modified: dict[str, str] = {}

        walker = repo.walk(
            repo.head.target,
            pygit2.enums.SortMode.TOPOLOGICAL | pygit2.enums.SortMode.TIME,
        )

        count = 0
        for commit in walker:
            if max_commits and count >= max_commits:
                break
            count += 1

            sha = str(commit.id)
            is_merge = len(commit.parents) > 1
            authored_at = datetime.fromtimestamp(commit.author.time, tz=timezone.utc)

            # Compute diff stats against primary parent or empty tree
            try:
                if commit.parents:
                    diff = repo.diff(commit.parents[0], commit)
                else:
                    # Initial commit diffed against empty tree
                    diff = commit.tree.diff_to_tree(flags=pygit2.enums.DiffOption.REVERSE)

                files_changed = diff.stats.files_changed
                insertions = diff.stats.insertions
                deletions = diff.stats.deletions

                for patch in diff:
                    new_path = patch.delta.new_file.path
                    if new_path:
                        churn_counts[new_path] = churn_counts.get(new_path, 0) + 1
                        if new_path not in last_modified:
                            last_modified[new_path] = sha

                    old_path = patch.delta.old_file.path
                    if old_path and old_path != new_path:
                        churn_counts[old_path] = churn_counts.get(old_path, 0) + 1
                        if old_path not in last_modified:
                            last_modified[old_path] = sha

            except Exception as e:
                logger.warning("Failed to compute diff for commit %s: %s", sha, e)
                files_changed, insertions, deletions = 0, 0, 0

            commits.append(
                GitCommitData(
                    sha=sha,
                    message=commit.message.strip() if commit.message else None,
                    author_name=commit.author.name,
                    author_email=commit.author.email,
                    authored_at=authored_at,
                    files_changed_count=files_changed,
                    insertions=insertions,
                    deletions=deletions,
                    is_merge=is_merge,
                )
            )

        return commits, churn_counts, last_modified

    @staticmethod
    def extract_head_tree_nodes(
        repo: pygit2.Repository,
        churn_counts: dict[str, int],
        last_modified: dict[str, str],
    ) -> list[GitFileData]:
        """
        Recursively extract files and directories from the HEAD commit tree.

        Assigns exact calculated churn count, last modified SHA, detected language,
        and line count for text files.
        """
        if repo.is_empty or repo.head_is_unborn:
            return []

        head_commit = repo[repo.head.target]
        root_tree = head_commit.tree
        nodes: list[GitFileData] = []

        def _walk_tree(tree: pygit2.Tree, prefix: str = "") -> None:
            for entry in tree:
                rel_path = f"{prefix}/{entry.name}" if prefix else entry.name
                try:
                    obj = repo[entry.id]
                except KeyError:
                    continue

                if isinstance(obj, pygit2.Tree):
                    # Directory node
                    nodes.append(
                        GitFileData(
                            path=rel_path,
                            node_type="directory",
                            language=None,
                            size_bytes=0,
                            line_count=None,
                            churn_count=churn_counts.get(rel_path, 0),
                            last_modified_sha=last_modified.get(rel_path),
                            is_entry_point=False,
                        )
                    )
                    _walk_tree(obj, rel_path)

                elif isinstance(obj, pygit2.Blob):
                    # File node
                    ext = Path(entry.name).suffix.lower()
                    lang = LANGUAGE_EXTENSIONS.get(ext)

                    # Binary check (first 8KB contains null byte)
                    raw_data = obj.data
                    is_binary = b"\x00" in raw_data[:8000]

                    if is_binary:
                        line_count = None
                    else:
                        line_count = raw_data.count(b"\n")
                        if raw_data and not raw_data.endswith(b"\n"):
                            line_count += 1

                    is_entry = entry.name.lower() in ENTRY_POINT_FILENAMES

                    nodes.append(
                        GitFileData(
                            path=rel_path,
                            node_type="file",
                            language=lang,
                            size_bytes=len(raw_data),
                            line_count=line_count,
                            churn_count=churn_counts.get(rel_path, 0),
                            last_modified_sha=last_modified.get(rel_path),
                            is_entry_point=is_entry,
                        )
                    )

        _walk_tree(root_tree)
        return nodes
