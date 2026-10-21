/**
 * Centralised API client for CommitScope.
 *
 * All HTTP calls go through this module so the base URL is configured once
 * and request/response handling is consistent.
 *
 * In development, Vite proxies /api/* to http://localhost:8000 (vite.config.js).
 * In production, configure VITE_API_URL in the build environment.
 */

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}`
  : '' // empty = same-origin, Vite proxy handles it in dev

/**
 * Custom error class with HTTP status code and server detail.
 */
export class ApiError extends Error {
  constructor(status, message, code = 'API_ERROR', detail = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.detail = detail
  }
}

/**
 * Thin fetch wrapper that parses JSON and surfaces structured HTTP errors.
 *
 * @param {string} path - Path relative to API_BASE (starts with /api/)
 * @param {RequestInit} [options] - fetch options
 * @returns {Promise<unknown>} Parsed JSON response body
 */
export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let message = response.statusText
    let code = 'HTTP_' + response.status
    let detail = null

    try {
      const body = await response.json()
      message = body.message || body.detail || response.statusText
      code = body.code || code
      detail = body.detail || null
    } catch {
      // Non-JSON response
    }

    throw new ApiError(response.status, message, code, detail)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null
  }

  return response.json()
}

/** Convenience: GET /api/v1/health */
export function fetchHealth() {
  return apiFetch('/api/v1/health')
}

/**
 * GET /api/v1/repositories
 * Lists all registered repositories with counts.
 */
export function fetchRepositories(skip = 0, limit = 50) {
  return apiFetch(`/api/v1/repositories?skip=${skip}&limit=${limit}`)
}

/**
 * GET /api/v1/repositories/{id}
 * Retrieves full repository details including latest snapshot and recent commits.
 */
export function fetchRepositoryDetail(repoId) {
  return apiFetch(`/api/v1/repositories/${repoId}`)
}

/**
 * POST /api/v1/repositories
 * Registers a new local git repository and triggers initial ingestion.
 */
export function registerRepository(localPath, name = null) {
  const payload = { local_path: localPath }
  if (name && name.trim()) {
    payload.name = name.trim()
  }
  return apiFetch('/api/v1/repositories', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * POST /api/v1/repositories/{id}/sync
 * Re-analyzes the repository at current HEAD from disk.
 */
export function syncRepository(repoId) {
  return apiFetch(`/api/v1/repositories/${repoId}/sync`, {
    method: 'POST',
  })
}
