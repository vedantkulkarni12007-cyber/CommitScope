"""
Repository ORM model.

A Repository represents a single git repository that has been registered with
CommitScope. It holds the registration metadata and the current analysis status.
The actual analysis results live in Snapshot, FileNode, DependencyEdge, and
Commit records linked by repository_id / snapshot_id foreign keys.

Security note
─────────────
local_path is validated at the service layer before any filesystem access.
Only paths that fall under an explicitly configured ALLOWED_REPO_ROOTS entry
are accepted. This value is never passed to a shell.
"""
from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class RepositoryStatus(str, enum.Enum):
    """Lifecycle states for a registered repository."""

    PENDING = "pending"      # Registered, not yet analysed
    ANALYZING = "analyzing"  # Background analysis in progress
    READY = "ready"          # Analysis complete; data is queryable
    ERROR = "error"          # Last analysis attempt failed


_VALID_STATUSES = tuple(s.value for s in RepositoryStatus)


class Repository(Base):
    __tablename__ = "repositories"
    __table_args__ = (
        CheckConstraint(
            f"status IN {_VALID_STATUSES}",
            name="ck_repository_status",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    local_path: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    remote_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    default_branch: Mapped[str] = mapped_column(
        String(255), nullable=False, server_default="main"
    )
    head_commit_sha: Mapped[str | None] = mapped_column(String(40), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default=RepositoryStatus.PENDING.value
    )
    # Progress message surfaced to the frontend during or after analysis.
    status_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    ingested_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Repository id={self.id!s:.8} name={self.name!r} status={self.status!r}>"
