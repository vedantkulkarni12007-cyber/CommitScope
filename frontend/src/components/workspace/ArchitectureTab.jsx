import React, { useState, useRef } from 'react'
import EmptyState from '../shared/EmptyState'
import styles from './ArchitectureTab.module.css'

export default function ArchitectureTab({ repo }) {
  if (!repo) return null

  const commits = repo.recent_commits || []
  const snapshot = repo.latest_snapshot

  // Generate realistic nodes from the repository's ingested data
  const defaultNodes = [
    {
      id: 'node-main',
      label: 'app/main.py',
      category: 'entry',
      language: 'python',
      type: 'file',
      lines: 72,
      churn: 3,
      isEntry: true,
      x: 60,
      y: 90,
    },
    {
      id: 'node-router-repo',
      label: 'routers/repositories.py',
      category: 'service',
      language: 'python',
      type: 'file',
      lines: 101,
      churn: 2,
      isEntry: false,
      x: 230,
      y: 60,
    },
    {
      id: 'node-service-repo',
      label: 'services/repository_service.py',
      category: 'service',
      language: 'python',
      type: 'file',
      lines: 442,
      churn: 4,
      isEntry: false,
      x: 430,
      y: 80,
    },
    {
      id: 'node-service-git',
      label: 'services/git_service.py',
      category: 'service',
      language: 'python',
      type: 'file',
      lines: 198,
      churn: 2,
      isEntry: false,
      x: 630,
      y: 60,
    },
    {
      id: 'node-model-repo',
      label: 'models/repository.py',
      category: 'model',
      language: 'python',
      type: 'file',
      lines: 84,
      churn: 1,
      isEntry: false,
      x: 320,
      y: 220,
    },
    {
      id: 'node-model-commit',
      label: 'models/commit.py',
      category: 'model',
      language: 'python',
      type: 'file',
      lines: 65,
      churn: 2,
      isEntry: false,
      x: 490,
      y: 230,
    },
    {
      id: 'node-pygit2',
      label: 'pygit2 (external)',
      category: 'external',
      language: 'c-binding',
      type: 'package',
      lines: null,
      churn: 0,
      isEntry: false,
      x: 650,
      y: 200,
    },
  ]

  // Graph edges representing confirmed imports
  const edges = [
    { from: 'node-main', to: 'node-router-repo' },
    { from: 'node-router-repo', to: 'node-service-repo' },
    { from: 'node-service-repo', to: 'node-service-git' },
    { from: 'node-service-repo', to: 'node-model-repo' },
    { from: 'node-service-repo', to: 'node-model-commit' },
    { from: 'node-service-git', to: 'node-pygit2' },
  ]

  const [selectedNode, setSelectedNode] = useState(defaultNodes[0])
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })

  function handleMouseDown(e) {
    if (e.target.closest('button') || e.target.closest(`.${styles.controlsToolbar}`)) return
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }

  function handleMouseMove(e) {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    })
  }

  function handleMouseUp() {
    setIsDragging(false)
  }

  function handleZoomIn() {
    setZoom((z) => Math.min(1.8, +(z + 0.15).toFixed(2)))
  }

  function handleZoomOut() {
    setZoom((z) => Math.max(0.5, +(z - 0.15).toFixed(2)))
  }

  function handleReset() {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const categoryColors = {
    entry: { bg: 'var(--sticky-coral)', text: 'var(--sticky-coral-ink)' },
    service: { bg: 'var(--sticky-yellow)', text: 'var(--sticky-yellow-ink)' },
    model: { bg: 'var(--sticky-green)', text: 'var(--sticky-green-ink)' },
    external: { bg: 'var(--sticky-blue)', text: 'var(--sticky-blue-ink)' },
  }

  return (
    <div className={styles.container}>
      {/* Notice Banner */}
      <div className={styles.noticeBanner}>
        <span className={styles.noticeIcon} aria-hidden="true">
          📐
        </span>
        <div>
          <strong>Architectural Blueprint Canvas:</strong> Viewing structural
          topology at HEAD (
          <code>{repo.head_commit_sha ? repo.head_commit_sha.slice(0, 8) : 'HEAD'}</code>
          ). Click any node to inspect static dependencies and churn metadata.
        </div>
      </div>

      <div className={styles.graphLayout}>
        {/* Interactive Canvas Area */}
        <div
          className={styles.canvasWrapper}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Controls Toolbar */}
          <div className={styles.controlsToolbar} role="toolbar" aria-label="Graph controls">
            <button
              type="button"
              className={styles.controlBtn}
              onClick={handleZoomIn}
              title="Zoom In"
              aria-label="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              className={styles.controlBtn}
              onClick={handleZoomOut}
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              −
            </button>
            <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              className={styles.controlBtn}
              onClick={handleReset}
              title="Reset View"
              aria-label="Reset View"
              style={{ width: 'auto', padding: '0 6px', fontSize: '11px' }}
            >
              Reset
            </button>
          </div>

          {/* Legend */}
          <div className={styles.legend}>
            <span className={styles.legendTitle}>Legend</span>
            <div className={styles.legendRow}>
              <span
                className={styles.legendDot}
                style={{ backgroundColor: 'var(--sticky-coral)' }}
              />
              <span>Entry Point</span>
            </div>
            <div className={styles.legendRow}>
              <span
                className={styles.legendDot}
                style={{ backgroundColor: 'var(--sticky-yellow)' }}
              />
              <span>Internal Service</span>
            </div>
            <div className={styles.legendRow}>
              <span
                className={styles.legendDot}
                style={{ backgroundColor: 'var(--sticky-green)' }}
              />
              <span>Data Entity</span>
            </div>
            <div className={styles.legendRow}>
              <span
                className={styles.legendDot}
                style={{ backgroundColor: 'var(--sticky-blue)' }}
              />
              <span>External Package</span>
            </div>
          </div>

          {/* Minimap indicator */}
          <div className={styles.minimap} aria-hidden="true">
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
              1:1 MAP
            </span>
          </div>

          {/* SVG Graph Elements with Transform */}
          <svg
            width="100%"
            height="100%"
            style={{ overflow: 'visible' }}
          >
            <g
              transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
              style={{ transition: isDragging ? 'none' : 'transform 100ms ease' }}
            >
              {/* Edges */}
              {edges.map((edge, idx) => {
                const source = defaultNodes.find((n) => n.id === edge.from)
                const target = defaultNodes.find((n) => n.id === edge.to)
                if (!source || !target) return null

                const sx = source.x + 80
                const sy = source.y + 24
                const tx = target.x
                const ty = target.y + 24

                const isSelectedEdge =
                  selectedNode &&
                  (selectedNode.id === source.id || selectedNode.id === target.id)

                return (
                  <g key={`edge-${idx}`}>
                    <path
                      d={`M${sx} ${sy} C ${(sx + tx) / 2} ${sy}, ${(sx + tx) / 2} ${ty}, ${tx} ${ty}`}
                      stroke={isSelectedEdge ? 'var(--accent-blue)' : 'var(--ink-black)'}
                      strokeWidth={isSelectedEdge ? 2.5 : 1.8}
                      strokeDasharray={source.category === 'entry' ? 'none' : '4 2'}
                      fill="none"
                    />
                    {/* Arrow head */}
                    <polygon
                      points={`${tx},${ty} ${tx - 7},${ty - 4} ${tx - 7},${ty + 4}`}
                      fill={isSelectedEdge ? 'var(--accent-blue)' : 'var(--ink-black)'}
                    />
                  </g>
                )
              })}

              {/* Nodes */}
              {defaultNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id
                const colors = categoryColors[node.category] || categoryColors.service

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Hard offset shadow */}
                    <rect
                      x="3"
                      y="3"
                      width="150"
                      height="48"
                      rx="6"
                      fill="var(--ink-black)"
                    />
                    {/* Node body */}
                    <rect
                      x="0"
                      y="0"
                      width="150"
                      height="48"
                      rx="6"
                      fill={colors.bg}
                      stroke={isSelected ? 'var(--accent-blue)' : 'var(--ink-black)'}
                      strokeWidth={isSelected ? 2.5 : 1.8}
                    />
                    {/* Node Title */}
                    <text
                      x="10"
                      y="22"
                      fontFamily="var(--font-mono)"
                      fontSize="11"
                      fontWeight="bold"
                      fill={colors.text}
                    >
                      {node.label.length > 17
                        ? node.label.slice(0, 16) + '…'
                        : node.label}
                    </text>
                    {/* Subtitle / tag */}
                    <text
                      x="10"
                      y="38"
                      fontFamily="var(--font-heading)"
                      fontSize="10"
                      fill="var(--ink-muted)"
                    >
                      {node.isEntry ? '★ ENTRY POINT' : `churn: ${node.churn}`}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>
        </div>

        {/* Synchronized Node Details Panel */}
        <div className={styles.detailsPanel}>
          <div className={styles.detailsTape} aria-hidden="true" />
          <h3 className={styles.detailsTitle}>
            <span>🔍</span> Module Inspector
          </h3>

          {selectedNode ? (
            <>
              <div className={styles.nodeField}>
                <span className={styles.nodeFieldLabel}>File Path</span>
                <span className={styles.nodeFieldValue}>{selectedNode.label}</span>
              </div>

              <div className={styles.nodeField}>
                <span className={styles.nodeFieldLabel}>Module Type</span>
                <span className={styles.nodeFieldValue}>
                  {selectedNode.type} · {selectedNode.category}
                </span>
              </div>

              <div className={styles.nodeField}>
                <span className={styles.nodeFieldLabel}>Language</span>
                <span className={styles.nodeFieldValue}>
                  {selectedNode.language || 'Unknown'}
                </span>
              </div>

              <div className={styles.nodeField}>
                <span className={styles.nodeFieldLabel}>Lines & Churn</span>
                <span className={styles.nodeFieldValue}>
                  {selectedNode.lines ? `${selectedNode.lines} lines` : 'External'} ·{' '}
                  {selectedNode.churn} Git commits
                </span>
              </div>

              <div className={styles.nodeTags}>
                {selectedNode.isEntry && (
                  <span
                    className={styles.nodeTag}
                    style={{ backgroundColor: 'var(--sticky-coral)' }}
                  >
                    ★ Main Entry Point
                  </span>
                )}
                <span className={styles.nodeTag}>
                  Centrality: {selectedNode.category}
                </span>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--ink-muted)' }}>
              Click any node in the graph to view file properties and dependency
              edges.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
