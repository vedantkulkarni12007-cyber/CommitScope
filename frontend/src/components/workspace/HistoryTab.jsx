import React from 'react'
import EmptyState from '../shared/EmptyState'
import styles from './HistoryTab.module.css'

export default function HistoryTab({ repo }) {
  if (!repo) return null

  const commits = repo.recent_commits || []

  if (commits.length === 0) {
    return (
      <EmptyState
        title="No Commit History"
        description="No commits have been ingested for this repository yet."
      />
    )
  }

  return (
    <div className={styles.timeline}>
      {commits.map((commit) => (
        <article key={commit.sha} className={styles.commitCard}>
          <div className={styles.timelineDot} aria-hidden="true" />

          <div className={styles.commitHeader}>
            <div className={styles.commitTitleRow}>
              <span className={styles.shaBadge} title={commit.sha}>
                {commit.sha.slice(0, 8)}
              </span>
              {commit.is_merge && (
                <span className={styles.mergeBadge}>MERGE</span>
              )}
            </div>

            <span className={styles.commitDate}>
              {commit.authored_at
                ? new Date(commit.authored_at).toLocaleString()
                : 'Unknown date'}
            </span>
          </div>

          <div className={styles.commitMessage}>
            {commit.message?.trim() || 'No commit message'}
          </div>

          <div className={styles.commitMeta}>
            <div className={styles.author}>
              <span>👤</span>
              <span>{commit.author_name || 'Anonymous'}</span>
              {commit.author_email && (
                <span style={{ color: 'var(--ink-muted)', fontSize: '11px' }}>
                  &lt;{commit.author_email}&gt;
                </span>
              )}
            </div>

            <div className={styles.diffStats}>
              <span className={styles.diffAdd}>+{commit.insertions}</span>
              <span className={styles.diffDel}>-{commit.deletions}</span>
              <span style={{ color: 'var(--ink-muted)' }}>
                ({commit.files_changed_count} files modified)
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
