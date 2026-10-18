"""
Pydantic schemas for Repository resources and ingestion results.
"""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class RepositoryCreate(BaseModel):
    """Payload to register a local repository."""

    local_path: str = Field(
        ...,
        description="Absolute filesystem path to the local Git repository",
        examples=["/repos/my-project", "C:/Projects/my-project"],
    )
    name: str | None = Field(
        None,
        description="Optional display name. Defaults to the repository directory name.",
        examples=["my-project"],
    )


class SnapshotSummary(BaseModel):
    """Summary of an analysis snapshot for a commit."""

    id: uuid.UUID
    commit_sha: str
    commit_message: str | None = None
    author: str | None = None
    authored_at: datetime | None = None
    node_count: int = 0
    edge_count: int = 0
    analysis_completed_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class CommitSummary(BaseModel):
    """Summary of a Git commit stored in the repository history."""

    sha: str
    message: str | None = None
    author_name: str | None = None
    author_email: str | None = None
    authored_at: datetime | None = None
    files_changed_count: int = 0
    insertions: int = 0
    deletions: int = 0
    is_merge: bool = False

    model_config = ConfigDict(from_attributes=True)


class RepositoryResponse(BaseModel):
    """Standard repository representation returned by endpoints."""

    id: uuid.UUID
    name: str
    local_path: str
    remote_url: str | None = None
    default_branch: str
    head_commit_sha: str | None = None
    status: str
    status_message: str | None = None
    ingested_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    commit_count: int = 0
    file_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class RepositoryListResponse(BaseModel):
    """Paginated list of registered repositories."""

    items: list[RepositoryResponse]
    total: int


class RepositoryDetailResponse(RepositoryResponse):
    """Detailed repository view including latest snapshot and recent commits."""

    latest_snapshot: SnapshotSummary | None = None
    recent_commits: list[CommitSummary] = []
