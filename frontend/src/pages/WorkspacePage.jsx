import React, { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useRepoStore } from '../store/repoStore'
import RepositoryDetailView from '../components/workspace/RepositoryDetailView'
import EmptyState, { DefaultSketchRepoTree } from '../components/shared/EmptyState'
import StatusBadge from '../components/shared/StatusBadge'
import Button from '../components/shared/Button'
import LoadingState from '../components/shared/LoadingState'
import styles from './WorkspacePage.module.css'

export default function WorkspacePage({ tab: tabProp }) {
  const { id: routeId } = useParams()
  const {
    repositories,
    selectedRepo,
    selectRepository,
    loadRepositories,
    loading,
    detailLoading,
    error,
    setAddModalOpen,
  } = useRepoStore()

  useEffect(() => {
    if (routeId) {
      selectRepository(routeId)
    } else {
      loadRepositories()
    }
  }, [routeId, selectRepository, loadRepositories])

  // If viewing a specific repository detail
  if (routeId) {
    if (detailLoading) {
      return (
        <div className={styles.page}>
          <LoadingState label="Loading repository workspace..." />
        </div>
      )
    }

    if (error) {
      return (
        <div className={styles.page}>
          <div className={styles.errorCard} role="alert">
            <h2 className={styles.errorTitle}>Repository Not Found or Offline</h2>
            <p className={styles.errorDesc}>{error}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => selectRepository(routeId)}
              >
                Retry
              </Button>
              <Link to="/workspace">
                <Button variant="secondary" size="sm">
                  ← Back to Workspace Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    if (selectedRepo) {
      return (
        <RepositoryDetailView
          repo={selectedRepo}
          initialTab={tabProp || 'overview'}
        />
      )
    }
  }

  // Dashboard View (All registered repositories)
  return (
    <div className={styles.page}>
      <div className={styles.dashboardHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Repository Workspace</h1>
          <p className={styles.subtitle}>
            Deterministic code architecture intelligence and Git commit telemetry.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setAddModalOpen(true)}
          icon={<PlusIcon />}
        >
          Add Repository
        </Button>
      </div>

      {loading && repositories.length === 0 ? (
        <LoadingState label="Fetching registered repositories..." />
      ) : repositories.length === 0 ? (
        <EmptyState
          title="Welcome to your CommitScope Workspace"
          description="No Git repositories have been connected yet. Connect a local repository path to inspect architectural dependency graphs and Git history."
          action={
            <Button
              variant="primary"
              onClick={() => setAddModalOpen(true)}
              icon={<PlusIcon />}
            >
              Add Your First Repository
            </Button>
          }
        />
      ) : (
        <div className={styles.repoGrid}>
          {repositories.map((repo) => (
            <div key={repo.id} className={styles.repoCard}>
              <div className={styles.cardTop}>
                <div>
                  <h2 className={styles.repoName}>{repo.name}</h2>
                  <div className={styles.repoPath}>{repo.local_path}</div>
                </div>
                <StatusBadge status={repo.status} />
              </div>

              <div className={styles.statsRow}>
                <div className={styles.statItem}>
                  <strong>{repo.commit_count ?? 0}</strong> commits
                </div>
                <div className={styles.statItem}>
                  <strong>{repo.file_count ?? 0}</strong> files
                </div>
                <div className={styles.statItem}>
                  branch: <strong>{repo.default_branch || 'HEAD'}</strong>
                </div>
              </div>

              <div className={styles.cardShortcuts}>
                <Link
                  to={`/repositories/${repo.id}`}
                  className={styles.shortcutLink}
                >
                  Overview
                </Link>
                <Link
                  to={`/repositories/${repo.id}`}
                  className={styles.shortcutLink}
                >
                  Architecture
                </Link>
                <Link
                  to={`/repositories/${repo.id}`}
                  className={styles.shortcutLink}
                >
                  Files
                </Link>
                <Link
                  to={`/repositories/${repo.id}`}
                  className={styles.shortcutLink}
                >
                  History
                </Link>
                <Link
                  to={`/repositories/${repo.id}`}
                  className={styles.shortcutLink}
                >
                  Hotspots
                </Link>
              </div>

              <div className={styles.cardFooter}>
                <Link to={`/repositories/${repo.id}`}>
                  <Button variant="secondary" size="sm">
                    Open Workspace →
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
