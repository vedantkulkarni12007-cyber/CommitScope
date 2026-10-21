import React from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import Logo from '../shared/Logo'
import Button from '../shared/Button'
import { useRepoStore } from '../../store/repoStore'
import styles from './Sidebar.module.css'

export default function Sidebar({ mobileOpen = false, onCloseMobile }) {
  const location = useLocation()
  const { selectedRepo, health, setAddModalOpen } = useRepoStore()

  const repoId = selectedRepo?.id

  const navItems = [
    {
      id: 'repositories',
      label: 'Repositories',
      path: repoId ? `/repositories/${repoId}` : '/',
      icon: <FolderTreeIcon />,
      activeOn: ['/', `/repositories/${repoId}`],
    },
    {
      id: 'architecture',
      label: 'Architecture Graph',
      path: repoId ? `/repositories/${repoId}/graph` : '/architecture',
      icon: <NetworkGraphIcon />,
    },
    {
      id: 'files',
      label: 'Files & Tree',
      path: repoId ? `/repositories/${repoId}/files` : '/files',
      icon: <FileCodeIcon />,
    },
    {
      id: 'history',
      label: 'Git History',
      path: repoId ? `/repositories/${repoId}/history` : '/history',
      icon: <HistoryIcon />,
    },
    {
      id: 'hotspots',
      label: 'Churn Hotspots',
      path: repoId ? `/repositories/${repoId}/hotspots` : '/hotspots',
      icon: <FireIcon />,
    },
    {
      id: 'compare',
      label: 'Compare Snapshots',
      path: '/compare',
      icon: <CompareIcon />,
      stage: 6,
    },
  ]

  const isConnected = health.database === 'connected'

  return (
    <>
      {mobileOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}
        aria-label="Main navigation"
      >
        {/* ── Brand Logo Area ───────────────────────────────────────────────── */}
        <div className={styles.logoArea}>
          <Link to="/" className={styles.logoLink} onClick={onCloseMobile}>
            <Logo size="md" showWordmark />
          </Link>
          <span className={styles.versionBadge} title="CommitScope Prototype">
            v0.1
          </span>
        </div>

        {/* ── Repository Context Switcher / Indicator ───────────────────────── */}
        <div className={styles.contextSection}>
          <div className={styles.contextLabel}>Current Workspace</div>
          {selectedRepo ? (
            <Link
              to={`/repositories/${selectedRepo.id}`}
              className={styles.repoBadge}
              title={`Active repo: ${selectedRepo.name} (${selectedRepo.local_path})`}
              onClick={onCloseMobile}
            >
              <span className={styles.repoName}>{selectedRepo.name}</span>
              <span className={styles.repoBranch}>
                {selectedRepo.default_branch || 'HEAD'}
              </span>
            </Link>
          ) : (
            <Link
              to="/"
              className={styles.repoBadge}
              title="View all registered repositories"
              onClick={onCloseMobile}
            >
              <span className={styles.repoName}>All Repositories</span>
              <span className={styles.repoBranch}>workspace</span>
            </Link>
          )}
        </div>

        {/* ── Quick Add Repository CTA ──────────────────────────────────────── */}
        <div className={styles.addRepoWrapper}>
          <Button
            variant="primary"
            size="sm"
            className={styles.quickAddBtn}
            onClick={() => {
              if (onCloseMobile) onCloseMobile()
              setAddModalOpen(true)
            }}
            icon={<PlusIcon />}
          >
            + Add Repository
          </Button>
        </div>

        {/* ── Navigation Items ──────────────────────────────────────────────── */}
        <nav className={styles.nav}>
          <ul className={styles.navList} role="list">
            {navItems.map((item) => {
              const isActive = item.activeOn
                ? item.activeOn.includes(location.pathname)
                : location.pathname === item.path

              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    onClick={onCloseMobile}
                  >
                    <span className={styles.navIcon} aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className={styles.navLabel}>{item.label}</span>
                    {item.stage && (
                      <span className={styles.soonBadge}>S{item.stage}</span>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* ── Bottom Section: Health & External Links ────────────────────────── */}
        <div className={styles.bottom}>
          <div
            className={`${styles.healthPill} ${
              isConnected ? styles.healthConnected : styles.healthOffline
            }`}
            title={`API: ${health.status}, DB: ${health.database}`}
          >
            <span className={styles.healthDot} aria-hidden="true" />
            <span>
              {isConnected ? 'Backend: connected' : 'Backend: offline'}
            </span>
          </div>

          <div className={styles.utilRow}>
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
        </div>
      </aside>
    </>
  )
}

/* ── Hand-Drawn / Crisp Nav Icons ─────────────────────────────────────────── */
function FolderTreeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M2 4.5C2 3.67 2.67 3 3.5 3H7L8.5 5H14.5C15.33 5 16 5.67 16 6.5V13.5C16 14.33 15.33 15 14.5 15H3.5C2.67 15 2 14.33 2 13.5V4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NetworkGraphIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="4" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14" cy="4.5" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14" cy="13.5" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.2 8L11.8 5.5M6.2 10L11.8 12.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function FileCodeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3.5 2H10.5L14.5 6V15C14.5 15.5 14 16 13.5 16H3.5C3 16 2.5 15.5 2.5 15V3C2.5 2.5 3 2 3.5 2Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 10L8 8M6 10L8 12M11 8L9 10M11 12L9 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 5.5V9.5L12 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function FireIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M9.5 2C9.5 2 13 5.5 13 9.5C13 12 11 15 9 15C7 15 5 13 5 10.5C5 7.5 7.5 5.5 8 5C8.5 6 9.5 7 9.5 8C10 6 9.5 2 9.5 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CompareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5 3.5L2 9L5 14.5M13 3.5L16 9L13 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 4V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
      <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 5H11M5 8H11M5 11H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
