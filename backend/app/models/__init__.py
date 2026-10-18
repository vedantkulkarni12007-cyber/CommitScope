"""
ORM model package.

Import all models here so Alembic can discover every table in Base.metadata
without needing individual imports in env.py.
"""
from app.models.repository import Repository, RepositoryStatus  # noqa: F401
from app.models.snapshot import Snapshot  # noqa: F401
from app.models.file_node import FileNode, NodeType  # noqa: F401
from app.models.dependency_edge import DependencyEdge, EdgeType  # noqa: F401
from app.models.commit import Commit  # noqa: F401

__all__ = [
    "Repository",
    "RepositoryStatus",
    "Snapshot",
    "FileNode",
    "NodeType",
    "DependencyEdge",
    "EdgeType",
    "Commit",
]
