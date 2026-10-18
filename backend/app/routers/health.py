"""
Health check router.

GET /api/v1/health — returns API version and database connectivity status.

This endpoint is intentionally dependency-free beyond the database connection
so that load balancers and Docker health checks can use it without
authenticating or providing request bodies.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_db
from app.schemas.common import HealthResponse

router = APIRouter(prefix="/api/v1", tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description=(
        "Returns the API status and whether the database connection is healthy. "
        "Safe to call without authentication."
    ),
)
async def health_check(db: AsyncSession = Depends(get_db)) -> HealthResponse:
    """Verify the API is running and the database is reachable."""
    try:
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:  # noqa: BLE001
        # Return 200 with db=error so the response body is machine-readable.
        # A separate liveness probe can check db_status and alert accordingly.
        db_status = f"error: {exc}"

    return HealthResponse(
        status="ok",
        version=settings.app_version,
        database=db_status,
    )
