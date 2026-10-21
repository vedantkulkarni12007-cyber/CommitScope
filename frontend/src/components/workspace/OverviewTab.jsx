import React from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../shared/EmptyState'
import styles from './OverviewTab.module.css'

export default function OverviewTab({ repo }) {
  if (!repo) return null

  const snapshot = repo.latest_snapshot
  const commits = repo.recent_commits || []

  return (
    <div className={styles.overview}>
      {/* ── Key Metrics Cards ───────────────────────────────────────────────── */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Commits</span>
          <span className={styles.metricValue}>{repo.commit_count ?? 0}</span>
          <span className={styles.metricSub}>Ingested from Git log</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Files at HEAD</span>
          <span className={styles.metricValue}>{repo.file_count ?? 0}</span>
          <span className={styles.metricSub}>Extracted file nodes</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Default Branch</span>
          <span className={styles.metricValue} style={{ fontSize: '1.5rem' }}>
            {repo.default_branch || 'main'}
          </span>
          <span className={styles.metricSub}>Active reference branch</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>HEAD Commit SHA</span>
          <span
            className={styles.metricValue}
            style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)' }}
          >
            {repo.head_commit_sha ? repo.head_commit_sha.slice(0, 8) : 'None'}
          </span>
          <span className={styles.metricSub}>Current working HEAD</span>
        </div>
      </div>

      {/* ── Latest Snapshot Panel ───────────────────────────────────────────── */}
      {snapshot ? (
        <div className={styles.snapshotCard}>
          <div className={styles.snapshotTape} aria-hidden="true" />
          <div className={styles.snapshotHeader}>
            <div className={styles.snapshotTitle}>
              <span>📌</span> Latest Analysis Snapshot
            </div>
            <span className={styles.snapshotSha}>
              {snapshot.commit_sha.slice(0, 8)}
            </span>
          </div>

          <p className={styles.snapshotBody}>
            <strong>"{snapshot.commit_message || 'Commit'}"</strong>
          </p>

          <div className={styles.snapshotMeta}>
            <span>Author: {snapshot.author || 'Unknown'}</span>
            <span>Files Analyzed: {snapshot.node_count} nodes</span>
            <span>Dependency Edges: {snapshot.edge_count}</span>
            {snapshot.analysis_completed_at && (
              <span>
                Completed:{' '}
                {new Date(snapshot.analysis_completed_at).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.snapshotCard} style={{ backgroundColor: 'var(--bg-paper-card)' }}>
          <div className={styles.snapshotTitle}>
            <span>📋</span> No Analysis Snapshot Yet
          </div>
          <p className={styles.snapshotBody}>
            This repository has not yet had an architecture snapshot calculated.
            Trigger a manual sync to run the analysis engine.
          </p>
        </div>
      )}

      {/* ── Recent Commits Table ────────────────────────────────────────────── */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionTitle}>
          <span>Recent Commits</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
            Showing {commits.length} of {repo.commit_count}
          </span>
        </div>

        {commits.length === 0 ? (
          <EmptyState
            title="No Commits Ingested"
            description="Either this is an empty Git repository, or no commits have been analyzed yet."
            hasTape={false}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.commitsTable}>
              <thead>
                <tr>
                  <th>SHA</th>
                  <th>Message</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th>Changes</th>
                </tr>
              </thead>
              <tbody>
                {commits.map((c) => (
                  <tr key={c.sha}>
                    <td>
                      <span className={styles.shaBadge} title={c.sha}>
                        {c.sha.slice(0, 7)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.commitMessage} title={c.message}>
                        {c.message?.split('\n')[0] || 'Commit'}
                      </div>
                    </td>
                    <td>
                      <span className={styles.commitAuthor}>
                        {c.author_name || 'Anonymous'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {c.authored_at
                          ? new Date(c.authored_at).toLocaleDateString()
                          : '—'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.diffStats}>
                        <span className={styles.diffPlus}>+{c.insertions}</span>
                        <span className={styles.diffMinus}>-{c.deletions}</span>
                        <span style={{ color: 'var(--ink-muted)' }}>
                          ({c.files_changed_count} files)
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
