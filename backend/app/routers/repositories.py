"""
Repository endpoints.

Handles registration, listing, detail retrieval, and manual re-synchronization.
Delegates all validation and ingestion logic to RepositoryService.
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.repository import (
    RepositoryCreate,
    RepositoryDetailResponse,
    RepositoryListResponse,
    RepositoryResponse,
)
from app.services.repository_service import RepositoryService

router = APIRouter(prefix="/api/v1/repositories", tags=["Repositories"])


@router.post(
    "",
    response_model=RepositoryResponse,
    summary="Register a local Git repository",
    description=(
        "Registers a local Git repository from a filesystem path, validates that it falls "
        "under ALLOWED_REPO_ROOTS, and extracts commits, file tree, and churn metrics."
    ),
)
async def register_repository(
    payload: RepositoryCreate,
    db: AsyncSession = Depends(get_db),
) -> JSONResponse:
    """Register and ingest a repository by local filesystem path."""
    repo, created = await RepositoryService.register_repository(
        db=db,
        local_path=payload.local_path,
        name=payload.name,
    )

    counts = await RepositoryService.get_repository_counts(db, repo.id)
    resp = RepositoryResponse.model_validate(repo)
    resp.commit_count = counts["commit_count"]
    resp.file_count = counts["file_count"]

    status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
    return JSONResponse(
        status_code=status_code,
        content=resp.model_dump(mode="json"),
    )


@router.get(
    "",
    response_model=RepositoryListResponse,
    summary="List registered repositories",
    description="Returns a paginated list of all registered repositories.",
)
async def list_repositories(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Max items per page"),
    db: AsyncSession = Depends(get_db),
) -> RepositoryListResponse:
    """Retrieve all registered repositories."""
    items, total = await RepositoryService.list_repositories(db, skip=skip, limit=limit)
    return RepositoryListResponse(items=items, total=total)


@router.get(
    "/{repo_id}",
    response_model=RepositoryDetailResponse,
    summary="Get repository details",
    description="Returns detailed repository info including latest snapshot and recent commits.",
)
async def get_repository(
    repo_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> RepositoryDetailResponse:
    """Retrieve full repository details by ID."""
    return await RepositoryService.get_repository_detail(db, repo_id)


@router.post(
    "/{repo_id}/sync",
    response_model=RepositoryResponse,
    summary="Sync repository",
    description="Re-analyzes the repository at current HEAD from disk.",
)
async def sync_repository(
    repo_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> RepositoryResponse:
    """Re-synchronize an existing repository."""
    return await RepositoryService.sync_repository(db, repo_id)
