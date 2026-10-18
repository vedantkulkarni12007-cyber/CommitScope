"""Initial schema — create all CommitScope core tables.

Revision ID: 0001
Revises:
Create Date: 2026-10-18 00:00:00.000000

Tables created (in dependency order):
  repositories      — Registered git repositories
  snapshots         — Versioned analysis runs per repository
  commits           — Git commit metadata for analytics
  file_nodes        — Files/directories at a specific snapshot
  dependency_edges  — Import relationships between file nodes

All status/enum fields use VARCHAR with CHECK constraints rather than
PostgreSQL ENUM types so that:
  1. The schema is compatible with SQLite for unit tests.
  2. Adding a new status value does not require ALTER TYPE (a table lock).
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── repositories ──────────────────────────────────────────────────────────
    op.create_table(
        "repositories",
        sa.Column("id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("local_path", sa.Text(), nullable=False),
        sa.Column("remote_url", sa.Text(), nullable=True),
        sa.Column(
            "default_branch",
            sa.String(length=255),
            server_default="main",
            nullable=False,
        ),
        sa.Column("head_commit_sha", sa.String(length=40), nullable=True),
        sa.Column(
            "status",
            sa.String(length=20),
            server_default="pending",
            nullable=False,
        ),
        sa.Column("status_message", sa.Text(), nullable=True),
        sa.Column("ingested_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "status IN ('pending', 'analyzing', 'ready', 'error')",
            name="ck_repository_status",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("local_path"),
    )

    # ── snapshots ─────────────────────────────────────────────────────────────
    op.create_table(
        "snapshots",
        sa.Column("id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("repository_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("commit_sha", sa.String(length=40), nullable=False),
        sa.Column("commit_message", sa.Text(), nullable=True),
        sa.Column("author", sa.String(length=255), nullable=True),
        sa.Column("authored_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "analysis_started_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("analysis_completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("node_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("edge_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(
            ["repository_id"],
            ["repositories.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_snapshots_repository_id", "snapshots", ["repository_id"])

    # ── commits ───────────────────────────────────────────────────────────────
    op.create_table(
        "commits",
        sa.Column("id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("repository_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("sha", sa.String(length=40), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("author_name", sa.String(length=255), nullable=True),
        sa.Column("author_email", sa.String(length=255), nullable=True),
        sa.Column("authored_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("files_changed_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("insertions", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("deletions", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_merge", sa.Boolean(), nullable=False, server_default="false"),
        sa.ForeignKeyConstraint(
            ["repository_id"],
            ["repositories.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("repository_id", "sha", name="uq_commit_repo_sha"),
    )
    op.create_index("ix_commits_repository_id", "commits", ["repository_id"])
    op.create_index("ix_commits_authored_at", "commits", ["authored_at"])

    # ── file_nodes ────────────────────────────────────────────────────────────
    op.create_table(
        "file_nodes",
        sa.Column("id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("snapshot_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("path", sa.Text(), nullable=False),
        sa.Column(
            "node_type",
            sa.String(length=20),
            server_default="file",
            nullable=False,
        ),
        sa.Column("language", sa.String(length=50), nullable=True),
        sa.Column("size_bytes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("line_count", sa.Integer(), nullable=True),
        sa.Column("churn_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_modified_sha", sa.String(length=40), nullable=True),
        sa.Column("is_entry_point", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("in_degree", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("out_degree", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("pagerank", sa.Float(), nullable=True),
        sa.CheckConstraint(
            "node_type IN ('file', 'directory')",
            name="ck_filenode_type",
        ),
        sa.ForeignKeyConstraint(
            ["snapshot_id"],
            ["snapshots.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("snapshot_id", "path", name="uq_filenode_snapshot_path"),
    )
    op.create_index("ix_file_nodes_snapshot_id", "file_nodes", ["snapshot_id"])

    # ── dependency_edges ──────────────────────────────────────────────────────
    op.create_table(
        "dependency_edges",
        sa.Column("id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("snapshot_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("source_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("target_id", sa.Uuid(as_uuid=True), nullable=True),
        sa.Column("target_external_name", sa.String(length=255), nullable=True),
        sa.Column("edge_type", sa.String(length=30), nullable=False),
        sa.Column("import_statement", sa.Text(), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="1.0"),
        sa.CheckConstraint(
            "edge_type IN ('confirmed_import', 'inferred_reference', 'external_package')",
            name="ck_edge_type",
        ),
        sa.CheckConstraint(
            "confidence >= 0.0 AND confidence <= 1.0",
            name="ck_edge_confidence_range",
        ),
        sa.ForeignKeyConstraint(
            ["snapshot_id"], ["snapshots.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["source_id"], ["file_nodes.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["target_id"], ["file_nodes.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_dependency_edges_snapshot_id", "dependency_edges", ["snapshot_id"]
    )
    op.create_index(
        "ix_dependency_edges_source_id", "dependency_edges", ["source_id"]
    )
    op.create_index(
        "ix_dependency_edges_target_id", "dependency_edges", ["target_id"]
    )


def downgrade() -> None:
    op.drop_table("dependency_edges")
    op.drop_table("file_nodes")
    op.drop_table("commits")
    op.drop_table("snapshots")
    op.drop_table("repositories")
