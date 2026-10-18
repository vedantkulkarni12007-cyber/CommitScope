import { useLocation } from 'react-router-dom'
import styles from './TopBar.module.css'

const ROUTE_LABELS = {
  '/': 'Repositories',
  '/architecture': 'Architecture',
  '/analytics': 'Git Analytics',
  '/heatmap': 'Heatmap',
  '/compare': 'Compare',
}

/**
 * Horizontal top bar showing breadcrumb and context-sensitive actions.
 * Actions are intentionally minimal in Stage 1.
 */
export default function TopBar() {
  const { pathname } = useLocation()
  const pageLabel = ROUTE_LABELS[pathname] ?? 'CommitScope'

  return (
    <header className={styles.topbar} role="banner">
      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <span className={styles.crumbRoot}>CommitScope</span>
        <span className={styles.crumbSep} aria-hidden="true">/</span>
        <span className={styles.crumbCurrent} aria-current="page">{pageLabel}</span>
      </nav>

      {/* ── Right actions ─────────────────────────────────────────────────── */}
      <div className={styles.actions}>
        {/* Stage badge — communicates which features are implemented */}
        <span className={styles.stageBadge} title="Currently implementing Stage 1: Infrastructure">
          Stage 1 · Infrastructure
        </span>
      </div>
    </header>
  )
}
