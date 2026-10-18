import { Routes, Route } from 'react-router-dom'

import AppShell from './components/layout/AppShell'
import LandingPage from './pages/LandingPage'
import NotFoundPage from './pages/NotFoundPage'

/**
 * Root router.
 * All routes are wrapped in AppShell (sidebar + topbar layout).
 * Future stages add repository, graph, commits, and analysis routes here.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<LandingPage />} />
        {/* Stage 2+: <Route path="repositories/*" element={<RepositoryRoutes />} /> */}
        {/* Stage 4+: <Route path="repositories/:id/graph" element={<GraphPage />} /> */}
        {/* Stage 5+: <Route path="repositories/:id/analytics" element={<AnalyticsPage />} /> */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
