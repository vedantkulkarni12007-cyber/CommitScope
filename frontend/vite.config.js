import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // ── Test configuration (Vitest) ─────────────────────────────────────────
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    css: false,
  },

  // ── Dev server ──────────────────────────────────────────────────────────
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Proxy /api requests to the FastAPI backend in development.
    // In production, the reverse proxy (nginx, Caddy, etc.) handles this.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },

  // ── Build ────────────────────────────────────────────────────────────────
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
