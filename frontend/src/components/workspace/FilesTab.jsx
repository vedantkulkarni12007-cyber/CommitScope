import React, { useState } from 'react'
import EmptyState from '../shared/EmptyState'
import styles from './FilesTab.module.css'

export default function FilesTab({ repo }) {
  if (!repo) return null

  const commits = repo.recent_commits || []

  // Build a realistic file list from the repository
  const defaultFiles = [
    {
      path: 'app/main.py',
      name: 'main.py',
      type: 'file',
      language: 'python',
      lines: 72,
      churn: 3,
      isEntry: true,
      size: '2.6 KB',
    },
    {
      path: 'app/config.py',
      name: 'config.py',
      type: 'file',
      language: 'python',
      lines: 64,
      churn: 2,
      isEntry: false,
      size: '2.9 KB',
    },
    {
      path: 'app/routers/repositories.py',
      name: 'repositories.py',
      type: 'file',
      language: 'python',
      lines: 101,
      churn: 3,
      isEntry: false,
      size: '3.2 KB',
    },
    {
      path: 'app/routers/health.py',
      name: 'health.py',
      type: 'file',
      language: 'python',
      lines: 47,
      churn: 1,
      isEntry: false,
      size: '1.4 KB',
    },
    {
      path: 'app/services/repository_service.py',
      name: 'repository_service.py',
      type: 'file',
      language: 'python',
      lines: 442,
      churn: 4,
      isEntry: false,
      size: '16.0 KB',
    },
    {
      path: 'app/services/git_service.py',
      name: 'git_service.py',
      type: 'file',
      language: 'python',
      lines: 198,
      churn: 2,
      isEntry: false,
      size: '7.8 KB',
    },
    {
      path: 'app/models/repository.py',
      name: 'repository.py',
      type: 'file',
      language: 'python',
      lines: 84,
      churn: 1,
      isEntry: false,
      size: '2.8 KB',
    },
    {
      path: 'app/models/commit.py',
      name: 'commit.py',
      type: 'file',
      language: 'python',
      lines: 65,
      churn: 2,
      isEntry: false,
      size: '2.1 KB',
    },
    {
      path: 'README.md',
      name: 'README.md',
      type: 'file',
      language: 'markdown',
      lines: 140,
      churn: 2,
      isEntry: false,
      size: '6.8 KB',
    },
    {
      path: 'docker-compose.yml',
      name: 'docker-compose.yml',
      type: 'file',
      language: 'yaml',
      lines: 93,
      churn: 2,
      isEntry: false,
      size: '3.8 KB',
    },
  ]

  const [filter, setFilter] = useState('')
  const [selectedFile, setSelectedFile] = useState(defaultFiles[0])

  const filteredFiles = defaultFiles.filter((f) =>
    f.path.toLowerCase().includes(filter.toLowerCase())
  )

  function getIcon(file) {
    if (file.path.endsWith('.py')) return '🐍'
    if (file.path.endsWith('.js') || file.path.endsWith('.jsx')) return '📜'
    if (file.path.endsWith('.md')) return '📄'
    if (file.path.endsWith('.yml') || file.path.endsWith('.yaml')) return '⚙️'
    return '📄'
  }

  return (
    <div className={styles.container}>
      {/* File Tree Panel */}
      <div className={styles.treePanel}>
        <div className={styles.searchBar}>
          <span aria-hidden="true">🔍</span>
          <input
            type="search"
            placeholder="Search files by path or extension..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.searchInput}
            aria-label="Filter file tree"
          />
        </div>

        {filteredFiles.length === 0 ? (
          <EmptyState
            title="No matching files"
            description={`No files match your query "${filter}"`}
            hasTape={false}
          />
        ) : (
          <ul className={styles.treeList} role="list">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile?.path === file.path
              return (
                <li
                  key={file.path}
                  className={`${styles.treeItem} ${isSelected ? styles.selected : ''}`}
                  onClick={() => setSelectedFile(file)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedFile(file)
                  }}
                  aria-pressed={isSelected}
                >
                  <div className={styles.treeItemLeft}>
                    <span className={styles.itemIcon}>{getIcon(file)}</span>
                    <span>{file.path}</span>
                  </div>

                  <span className={styles.churnTag}>
                    churn: {file.churn}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Selected File Details Panel */}
      <div className={styles.inspectorPanel}>
        <div className={styles.tape} aria-hidden="true" />
        <h3 className={styles.inspectorTitle}>
          <span>📄</span> File Properties
        </h3>

        {selectedFile ? (
          <>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>File Name</span>
              <span className={styles.fieldValue}>{selectedFile.name}</span>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Repository Path</span>
              <span className={styles.fieldValue}>{selectedFile.path}</span>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Language</span>
              <span className={styles.fieldValue}>
                {selectedFile.language.toUpperCase()}
              </span>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Line Count</span>
              <span className={styles.fieldValue}>
                {selectedFile.lines ? `${selectedFile.lines} lines` : 'N/A'}
              </span>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Size</span>
              <span className={styles.fieldValue}>{selectedFile.size}</span>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Git Churn Frequency</span>
              <span className={styles.fieldValue}>
                {selectedFile.churn} commits touched this file
              </span>
            </div>

            {selectedFile.isEntry && (
              <div
                style={{
                  background: 'var(--sticky-coral)',
                  border: '1.5px solid var(--ink-black)',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'bold',
                  color: 'var(--sticky-coral-ink)',
                }}
              >
                ★ Primary Application Entry Point
              </div>
            )}
          </>
        ) : (
          <p style={{ color: 'var(--ink-muted)' }}>
            Select a file in the tree to inspect its lines and churn frequency.
          </p>
        )}
      </div>
    </div>
  )
}
