import React, { useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import Button from '../shared/Button'
import { useRepoStore } from '../../store/repoStore'
import styles from './TopBar.module.css'

const ROUTE_TITLES = {
  '/': 'Repositories',
  '/workspace': 'Repositories',
  '/architecture': 'Architecture Graph',
  '/files': 'File Tree & Code',
  '/history': 'Git Commit History',
  '/hotspots': 'Churn Hotspots',
  '/compare': 'Compare Snapshots',
}

export default function TopBar({ onToggleMobile }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { selectedRepo, setAddModalOpen } = useRepoStore()
  const [searchTerm, setSearchTerm] = useState('')

  // Derive breadcrumbs based on pathname and active repo
  let currentPageLabel = ROUTE_TITLES[pathname]
  if (!currentPageLabel) {
    if (pathname.includes('/graph')) currentPageLabel = 'Architecture Graph'
    else if (pathname.includes('/files')) currentPageLabel = 'Files'
    else if (pathname.includes('/history')) currentPageLabel = 'Commit History'
    else if (pathname.includes('/hotspots')) currentPageLabel = 'Hotspots'
    else if (pathname.startsWith('/repositories/')) currentPageLabel = 'Overview'
    else currentPageLabel = 'Workspace'
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Navigate to repository search / list with query
      navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  return (
    <header className={styles.topbar} role="banner">
      <div className={styles.leftArea}>
        <button
          type="button"
          className={styles.menuToggle}
          onClick={onToggleMobile}
          aria-label="Toggle navigation menu"
        >
          <MenuIcon />
        </button>

        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/" className={styles.crumbLink}>
            CommitScope
          </Link>
          <span className={styles.crumbSep} aria-hidden="true">
            /
          </span>

          {selectedRepo && (
            <>
              <Link
                to={`/repositories/${selectedRepo.id}`}
                className={styles.crumbLink}
              >
                {selectedRepo.name}
              </Link>
              <span className={styles.crumbSep} aria-hidden="true">
                /
              </span>
            </>
          )}

          <span className={styles.crumbCurrent} aria-current="page">
            {currentPageLabel}
          </span>
        </nav>
      </div>

      {/* Global search entry point */}
      <form onSubmit={handleSearchSubmit} className={styles.searchWrapper}>
        <span className={styles.searchIcon} aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          type="search"
          placeholder="Search repositories, commits, files..."
          aria-label="Global search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </form>

      {/* Right actions */}
      <div className={styles.actions}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setAddModalOpen(true)}
        >
          + Add Repo
        </Button>

        <span
          className={styles.stageBadge}
          title="CommitScope Architecture & Ingestion Workspace"
        >
          Stage 1–2 · Active
        </span>
      </div>
    </header>
  )
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <line x1="2.5" y1="4.5" x2="15.5" y2="4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="2.5" y1="9" x2="15.5" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="2.5" y1="13.5" x2="15.5" y2="13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8.5" y1="8.5" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
