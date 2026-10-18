import { NavLink, useLocation } from 'react-router-dom'
import Logo from '../shared/Logo'
import styles from './Sidebar.module.css'

/* ── Navigation items ───────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    id: 'repositories',
    label: 'Repositories',
    path: '/',
    icon: <ReposIcon />,
    stage: 1,
  },
  {
    id: 'architecture',
    label: 'Architecture',
    path: '/architecture',
    icon: <GraphIcon />,
    stage: 4,
    disabled: true,
  },
  {
    id: 'git-analytics',
    label: 'Git Analytics',
    path: '/analytics',
    icon: <AnalyticsIcon />,
    stage: 5,
    disabled: true,
  },
  {
    id: 'heatmap',
    label: 'Heatmap',
    path: '/heatmap',
    icon: <HeatmapIcon />,
    stage: 5,
    disabled: true,
  },
  {
    id: 'compare',
    label: 'Compare',
    path: '/compare',
    icon: <CompareIcon />,
    stage: 6,
    disabled: true,
  },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className={styles.sidebar} aria-label="Main navigation">
      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <div className={styles.logoArea}>
        <Logo size="md" showWordmark />
        <span className={styles.version}>v0.1</span>
      </div>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className={styles.divider} />

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <ul className={styles.navList} role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              {item.disabled ? (
                <div
                  className={`${styles.navItem} ${styles.disabled}`}
                  title={`Coming in Stage ${item.stage}`}
                  aria-disabled="true"
                >
                  <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                  <span className={styles.soonBadge} aria-hidden="true">S{item.stage}</span>
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ''}`
                  }
                >
                  <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Bottom utilities ──────────────────────────────────────────────── */}
      <div className={styles.bottom}>
        <div className={styles.divider} />
        <a
          href="https://github.com/commitscope/commitscope"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.utilLink}
        >
          <GitHubIcon />
          <span>GitHub</span>
        </a>
        <a
          href="/api/docs"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.utilLink}
        >
          <DocsIcon />
          <span>API Docs</span>
        </a>
      </div>
    </aside>
  )
}

/* ── SVG Icon components ────────────────────────────────────────────────────── */
function ReposIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5.5 4.5v7M5.5 4.5l2.5 2.5M5.5 9l2.5-2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 6.5h2M10 9.5h2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

function GraphIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.25" />
      <path d="M6 7.2L10 4.8M6 8.8L10 11.2" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

function AnalyticsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="9" width="2.5" height="5" rx="0.5" fill="currentColor" opacity="0.5" />
      <rect x="6.75" y="6" width="2.5" height="8" rx="0.5" fill="currentColor" opacity="0.7" />
      <rect x="11.5" y="2" width="2.5" height="12" rx="0.5" fill="currentColor" />
    </svg>
  )
}

function HeatmapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.2" />
      <rect x="6.5" y="2" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
      <rect x="11" y="2" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.8" />
      <rect x="2" y="6.5" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.4" />
      <rect x="6.5" y="6.5" width="3" height="3" rx="0.5" fill="currentColor" opacity="1" />
      <rect x="11" y="6.5" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.6" />
      <rect x="2" y="11" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.7" />
      <rect x="6.5" y="11" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.3" />
      <rect x="11" y="11" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.9" />
    </svg>
  )
}

function CompareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M5 3L2 8l3 5M11 3l3 5-3 5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 4v8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeDasharray="1.5 2" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

function DocsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}
