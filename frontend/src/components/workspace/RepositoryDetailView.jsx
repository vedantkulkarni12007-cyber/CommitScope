import React, { useState } from 'react'
import StatusBadge from '../shared/StatusBadge'
import Button from '../shared/Button'
import OverviewTab from './OverviewTab'
import ArchitectureTab from './ArchitectureTab'
import FilesTab from './FilesTab'
import HistoryTab from './HistoryTab'
import HotspotsTab from './HotspotsTab'
import { useRepoStore } from '../../store/repoStore'
import styles from './RepositoryDetailView.module.css'

export default function RepositoryDetailView({ repo, initialTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const { syncRepo, syncing } = useRepoStore()

  if (!repo) return null

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'architecture', label: 'Architecture', icon: '📐' },
    { id: 'files', label: 'Files', icon: '📄' },
    { id: 'history', label: 'History', icon: '⏱️' },
    { id: 'hotspots', label: 'Hotspots', icon: '🔥' },
  ]

  async function handleSync() {
    await syncRepo(repo.id)
  }

  return (
    <div className={styles.container}>
      {/* ── Repository Header Card ─────────────────────────────────────────── */}
      <div className={styles.headerCard}>
        <div className={styles.tape} aria-hidden="true" />

        <div className={styles.headerTop}>
          <div className={styles.titleArea}>
            <div className={styles.repoTitleRow}>
              <h1 className={styles.repoTitle}>{repo.name}</h1>
              <StatusBadge status={repo.status} />
            </div>
            <div className={styles.repoPath}>
              <code>{repo.local_path}</code>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSync}
            loading={syncing}
            disabled={syncing}
            icon={<SyncIcon />}
          >
            {syncing ? 'Syncing Git HEAD...' : 'Re-sync Repository'}
          </Button>
        </div>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <span>Branch:</span>
            <code>{repo.default_branch || 'main'}</code>
          </div>

          {repo.head_commit_sha && (
            <div className={styles.metaItem}>
              <span>HEAD SHA:</span>
              <code>{repo.head_commit_sha.slice(0, 8)}</code>
            </div>
          )}

          <div className={styles.metaItem}>
            <span>Last Synced:</span>
            <span>
              {repo.ingested_at
                ? new Date(repo.ingested_at).toLocaleDateString()
                : 'Just now'}
            </span>
          </div>

          <div className={styles.metaItem}>
            <span>Commits:</span>
            <strong>{repo.commit_count ?? 0}</strong>
          </div>

          <div className={styles.metaItem}>
            <span>Files:</span>
            <strong>{repo.file_count ?? 0}</strong>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <nav className={styles.tabNav} aria-label="Repository sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            <span className={styles.tabIcon} aria-hidden="true">
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Tab Content ─────────────────────────────────────────────────────── */}
      <div className={styles.tabContent} role="tabpanel">
        {activeTab === 'overview' && <OverviewTab repo={repo} />}
        {activeTab === 'architecture' && <ArchitectureTab repo={repo} />}
        {activeTab === 'files' && <FilesTab repo={repo} />}
        {activeTab === 'history' && <HistoryTab repo={repo} />}
        {activeTab === 'hotspots' && <HotspotsTab repo={repo} />}
      </div>
    </div>
  )
}

function SyncIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M13.5 8C13.5 11.0376 11.0376 13.5 8 13.5C4.96243 13.5 2.5 11.0376 2.5 8C2.5 4.96243 4.96243 2.5 8 2.5C10.1508 2.5 12.0238 3.73147 12.9355 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10 5.5H13.5V2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
