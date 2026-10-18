"""
DependencyEdge ORM model.

A DependencyEdge is a directed relationship from one FileNode (source) to
another (target), representing an import or reference found by static analysis.

Integrity principles
────────────────────
edge_type distinguishes what is *known* from what is *inferred*:

  confirmed_import    — A static import statement that was unambiguously
                        resolved to a file within the same repository.
                        confidence = 1.0 always.

  inferred_reference  — A reference that could not be fully resolved but is
                        structurally plausible. confidence < 1.0.
                        Used sparingly; never fabricated.

  external_package    — Import of a package that is not part of the
                        repository (e.g. `import numpy`). The target_id
                        is NULL for these edges; target_external_name
                        records the package name for display purposes.

Edges with edge_type = "external_package" MUST have target_id = NULL.
Edges with any other edge_type MUST have target_id NOT NULL.
This invariant is enforced in the service layer, not at the DB level,
to keep the constraint readable and testable.
"""
from __future__ import annotations

import enum
import uuid

from sqlalchemy import CheckConstraint, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class EdgeType(str, enum.Enum):
    CONFIRMED_IMPORT = "confirmed_import"
    INFERRED_REFERENCE = "inferred_reference"
    EXTERNAL_PACKAGE = "external_package"


_VALID_EDGE_TYPES = tuple(t.value for t in EdgeType)


class DependencyEdge(Base):
    __tablename__ = "dependency_edges"
    __table_args__ = (
        CheckConstraint(
            f"edge_type IN {_VALID_EDGE_TYPES}",
            name="ck_edge_type",
        ),
        CheckConstraint(
            "confidence >= 0.0 AND confidence <= 1.0",
            name="ck_edge_confidence_range",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    snapshot_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("snapshots.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # The file that declares the import.
    source_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("file_nodes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # The file being imported. NULL only for external_package edges.
    target_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("file_nodes.id", ondelete="CASCADE"), nullable=True, index=True
    )
    # For external_package edges: the name of the external package.
    target_external_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    edge_type: Mapped[str] = mapped_column(
        String(30), nullable=False
    )
    # The raw import statement as it appears in source, for display and debugging.
    import_statement: Mapped[str | None] = mapped_column(Text, nullable=True)
    # 1.0 = fully confirmed static import. < 1.0 = inferred.
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)

    def __repr__(self) -> str:
        return (
            f"<DependencyEdge id={self.id!s:.8} "
            f"type={self.edge_type!r} "
            f"confidence={self.confidence}>"
        )
