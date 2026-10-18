/**
 * Centralised API client.
 *
 * All HTTP calls go through this module so the base URL is configured once
 * and request/response handling is consistent.
 *
 * In development, Vite proxies /api/* to http://localhost:8000 (vite.config.js).
 * In production, configure VITE_API_URL in the build environment.
 */

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}`
  : ''  // empty = same-origin, Vite proxy handles it in dev

/**
 * Thin fetch wrapper that parses JSON and surfaces HTTP errors.
 *
 * @param {string} path - Path relative to API_BASE (should start with /api/)
 * @param {RequestInit} [options] - fetch options
 * @returns {Promise<unknown>} Parsed JSON response body
 */
export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let detail
    try {
      const body = await response.json()
      detail = body.detail || body.message || response.statusText
    } catch {
      detail = response.statusText
    }
    throw new ApiError(response.status, detail)
  }

  return response.json()
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Convenience: GET /api/v1/health */
export function fetchHealth() {
  return apiFetch('/api/v1/health')
}
