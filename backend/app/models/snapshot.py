"""
Snapshot ORM model.

A Snapshot is an immutable, versioned analysis run for a specific commit in a
repository. Each time analysis is triggered (manually or on HEAD change), a new
Snapshot is created. Historical comparisons query two Snapshot records.

Snapshots are never mutated after analysis_completed_at is set — all analysis
data (FileNode, DependencyEdge) references a snapshot_id, so multiple snapshots
for the same repository coexist safely.
"""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Snapshot(Base):
    __tablename__ = "snapshots"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    repository_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False, index=True
    )
    commit_sha: Mapped[str] = mapped_column(String(40), nullable=False)
    commit_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    author: Mapped[str | None] = mapped_column(String(255), nullable=True)
    authored_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    analysis_started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    # NULL while analysis is in progress.
    analysis_completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    # Cached summary counts, updated when analysis completes.
    node_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    edge_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # Populated only when analysis failed; NULL on success.
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:
        return (
            f"<Snapshot id={self.id!s:.8} "
            f"repo={self.repository_id!s:.8} "
            f"sha={self.commit_sha[:8]!r}>"
        )
