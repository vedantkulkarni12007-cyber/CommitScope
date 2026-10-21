import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import LandingPage from './pages/LandingPage'
import WorkspacePage from './pages/WorkspacePage'
import NotFoundPage from './pages/NotFoundPage'

/**
 * Root router for CommitScope.
 * All views are wrapped inside AppShell with sketchbook layout, persistent sidebar,
 * topbar breadcrumbs, and Add Repository modal.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<LandingPage />} />
        <Route path="workspace" element={<WorkspacePage />} />

        {/* Repository detail routes */}
        <Route path="repositories/:id" element={<WorkspacePage />} />
        <Route
          path="repositories/:id/graph"
          element={<WorkspacePage tab="architecture" />}
        />
        <Route
          path="repositories/:id/files"
          element={<WorkspacePage tab="files" />}
        />
        <Route
          path="repositories/:id/history"
          element={<WorkspacePage tab="history" />}
        />
        <Route
          path="repositories/:id/hotspots"
          element={<WorkspacePage tab="hotspots" />}
        />

        {/* Global navigation shortcuts */}
        <Route
          path="architecture"
          element={<WorkspacePage tab="architecture" />}
        />
        <Route path="files" element={<WorkspacePage tab="files" />} />
        <Route path="history" element={<WorkspacePage tab="history" />} />
        <Route path="hotspots" element={<WorkspacePage tab="hotspots" />} />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
