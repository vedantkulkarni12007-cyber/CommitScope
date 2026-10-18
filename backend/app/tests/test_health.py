"""
Tests for GET /api/v1/health and GET /.

These are integration tests at the ASGI layer using an in-memory SQLite
database (see conftest.py). They verify the full request/response cycle
including FastAPI routing, dependency injection, and response serialisation.
"""
from __future__ import annotations

import pytest
from httpx import AsyncClient


class TestRootEndpoint:
    async def test_returns_200(self, client: AsyncClient) -> None:
        response = await client.get("/")
        assert response.status_code == 200

    async def test_response_contains_name(self, client: AsyncClient) -> None:
        data = (await client.get("/")).json()
        assert data["name"] == "CommitScope API"

    async def test_response_contains_version(self, client: AsyncClient) -> None:
        data = (await client.get("/")).json()
        assert "version" in data
        assert isinstance(data["version"], str)

    async def test_response_contains_docs_link(self, client: AsyncClient) -> None:
        data = (await client.get("/")).json()
        assert data.get("docs") == "/api/docs"

    async def test_response_status_ok(self, client: AsyncClient) -> None:
        data = (await client.get("/")).json()
        assert data["status"] == "ok"


class TestHealthEndpoint:
    async def test_returns_200(self, client: AsyncClient) -> None:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200

    async def test_response_schema(self, client: AsyncClient) -> None:
        data = (await client.get("/api/v1/health")).json()
        assert set(data.keys()) >= {"status", "version", "database"}

    async def test_status_is_ok(self, client: AsyncClient) -> None:
        data = (await client.get("/api/v1/health")).json()
        assert data["status"] == "ok"

    async def test_database_connected(self, client: AsyncClient) -> None:
        """With in-memory SQLite the database should report connected."""
        data = (await client.get("/api/v1/health")).json()
        assert data["database"] == "connected"

    async def test_version_is_string(self, client: AsyncClient) -> None:
        data = (await client.get("/api/v1/health")).json()
        assert isinstance(data["version"], str)
        assert len(data["version"]) > 0

    async def test_content_type_json(self, client: AsyncClient) -> None:
        response = await client.get("/api/v1/health")
        assert "application/json" in response.headers.get("content-type", "")


class TestOpenAPISchema:
    async def test_openapi_json_accessible(self, client: AsyncClient) -> None:
        response = await client.get("/api/openapi.json")
        assert response.status_code == 200

    async def test_openapi_contains_health_path(self, client: AsyncClient) -> None:
        schema = (await client.get("/api/openapi.json")).json()
        assert "/api/v1/health" in schema["paths"]
