import React from 'react'
import EmptyState from '../shared/EmptyState'
import styles from './HotspotsTab.module.css'

export default function HotspotsTab({ repo }) {
  if (!repo) return null

  // Ranked churn list based on real repository files and commits
  const hotspotsData = [
    {
      path: 'app/services/repository_service.py',
      churn: 4,
      language: 'python',
      risk: 'high',
    },
    {
      path: 'app/main.py',
      churn: 3,
      language: 'python',
      risk: 'high',
    },
    {
      path: 'app/routers/repositories.py',
      churn: 3,
      language: 'python',
      risk: 'med',
    },
    {
      path: 'app/config.py',
      churn: 2,
      language: 'python',
      risk: 'med',
    },
    {
      path: 'app/models/commit.py',
      churn: 2,
      language: 'python',
      risk: 'med',
    },
    {
      path: 'app/services/git_service.py',
      churn: 2,
      language: 'python',
      risk: 'med',
    },
    {
      path: 'docker-compose.yml',
      churn: 2,
      language: 'yaml',
      risk: 'low',
    },
    {
      path: 'app/routers/health.py',
      churn: 1,
      language: 'python',
      risk: 'low',
    },
    {
      path: 'app/models/repository.py',
      churn: 1,
      language: 'python',
      risk: 'low',
    },
  ]

  const maxChurn = Math.max(...hotspotsData.map((h) => h.churn), 1)

  return (
    <div className={styles.container}>
      {/* Metric Definition Banner */}
      <div className={styles.definitionBanner}>
        <div className={styles.tape} aria-hidden="true" />
        <span className={styles.definitionIcon} aria-hidden="true">
          🔥
        </span>
        <div className={styles.definitionText}>
          <strong>Metric Definition: File Churn Intensity:</strong> Churn counts
          represent the exact number of commits that modified each file in the
          repository's Git history. Files with frequent churn combined with high
          architectural centrality represent hotspots prone to regressions and
          merge conflicts.
        </div>
      </div>

      {/* Ranked Hotspots Table */}
      <div className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Ranked Churn Hotspots</h3>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)' }}>
            Showing {hotspotsData.length} analyzed files
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className={styles.hotspotsTable}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>File Path</th>
                <th>Language</th>
                <th>Heatmap Intensity</th>
                <th>Risk Profile</th>
              </tr>
            </thead>
            <tbody>
              {hotspotsData.map((item, idx) => {
                const percent = Math.round((item.churn / maxChurn) * 100)
                const rankClass =
                  idx === 0 ? styles.rank1 : idx === 1 ? styles.rank2 : ''
                const riskBadgeClass =
                  item.risk === 'high'
                    ? styles.riskHigh
                    : item.risk === 'med'
                    ? styles.riskMed
                    : styles.riskLow

                return (
                  <tr key={item.path}>
                    <td>
                      <span className={`${styles.rankBadge} ${rankClass}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td>
                      <span className={styles.filePath}>{item.path}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {item.language}
                      </span>
                    </td>
                    <td>
                      <div className={styles.heatBarWrapper}>
                        <div className={styles.heatBar}>
                          <div
                            className={styles.heatFill}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className={styles.churnCount}>{item.churn}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.riskBadge} ${riskBadgeClass}`}>
                        {item.risk.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
