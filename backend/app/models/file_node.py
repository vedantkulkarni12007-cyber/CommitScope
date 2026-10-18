"""
FileNode ORM model.

A FileNode represents a single file or directory in the repository tree at a
specific Snapshot. Graph metrics (in_degree, out_degree, pagerank) are computed
by the GraphBuilder and stored here after dependency analysis completes.

The churn_count is populated from the Git commit history during ingestion and
drives the heatmap overlay in the architecture graph view.
"""
from __future__ import annotations

import enum
import uuid

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class NodeType(str, enum.Enum):
    FILE = "file"
    DIRECTORY = "directory"


_VALID_NODE_TYPES = tuple(t.value for t in NodeType)


class FileNode(Base):
    __tablename__ = "file_nodes"
    __table_args__ = (
        UniqueConstraint("snapshot_id", "path", name="uq_filenode_snapshot_path"),
        CheckConstraint(
            f"node_type IN {_VALID_NODE_TYPES}",
            name="ck_filenode_type",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    snapshot_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("snapshots.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Path relative to the repository root, e.g. "src/api/routes.py"
    path: Mapped[str] = mapped_column(Text, nullable=False)
    node_type: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default=NodeType.FILE.value
    )
    # Detected programming language ("python", "javascript", etc.) or NULL.
    language: Mapped[str | None] = mapped_column(String(50), nullable=True)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    line_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    # Number of commits that touched this file — drives the heatmap overlay.
    churn_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_modified_sha: Mapped[str | None] = mapped_column(String(40), nullable=True)
    # Heuristic: True for __main__.py, index.js, main.go, etc.
    is_entry_point: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    # Graph metrics populated by GraphBuilder after dependency analysis.
    in_degree: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    out_degree: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # PageRank centrality score — higher means more architecturally central.
    pagerank: Mapped[float | None] = mapped_column(Float, nullable=True)

    def __repr__(self) -> str:
        return f"<FileNode id={self.id!s:.8} path={self.path!r}>"
