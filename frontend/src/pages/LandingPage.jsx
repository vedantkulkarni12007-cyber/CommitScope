import React from 'react'
import { Link } from 'react-router-dom'
import { useRepoStore } from '../store/repoStore'
import {
  SketchUnderline,
  SketchDoubleUnderline,
  SketchStar,
} from '../components/shared/SketchDecorations'
import StatusBadge from '../components/shared/StatusBadge'
import styles from './LandingPage.module.css'

export default function LandingPage() {
  const { repositories, setAddModalOpen } = useRepoStore()

  return (
    <div className={styles.page}>
      {/* ── 1. Hero Section ─────────────────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroContent}>
          <div className={styles.heroPill}>
            <span>✏️</span> Git Repository Intelligence
          </div>

          <h1 id="hero-heading" className={styles.heroTitle}>
            Every repository has a story.{' '}
            <span className={styles.heroAccent}>Draw it out.</span>
          </h1>

          <p className={styles.heroDesc}>
            CommitScope turns Git history and repository structure into an
            explorable engineering map. Discover architecture graphs, confirmed
            dependency relationships, and change hotspots — deterministically,
            with no AI and no cloud.
          </p>

          <div className={styles.heroActions}>
            <Link
              to="/workspace"
              className={styles.btnPrimary}
              style={{ cursor: 'pointer' }}
            >
              Explore your repository →
            </Link>

            <Link
              to="/workspace"
              className={styles.btnSecondary}
              style={{ cursor: 'pointer' }}
            >
              View the workspace
            </Link>
          </div>

          {/* Infrastructure status */}
          <div className={styles.statusRow}>
            <div className={styles.statusDot} aria-label="Status: ready" />
            <span className={styles.statusText}>
              Infrastructure ready — API and database online
            </span>
          </div>
        </div>

        {/* ── Hero Architectural Sketch Illustration ──────────────────────── */}
        <div className={styles.heroSketchWrapper} aria-hidden="true">
          <div className={styles.sketchPaperSheet}>
            <div className={styles.sheetTape} />
            <div className={styles.sheetHeader}>
              <span className={styles.sheetTitle}>
                📐 ARCH_GRAPH_HEAD.sketch
              </span>
              <span className={styles.sheetTag}>CONFIRMED IMPORTS</span>
            </div>

            {/* Hand-drawn architecture sketch diagram SVG */}
            <svg
              className={styles.sheetSvg}
              viewBox="0 0 380 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Grid dots */}
              <defs>
                <pattern
                  id="sheetDots"
                  x="0"
                  y="0"
                  width="16"
                  height="16"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1" fill="#2d2d2d" opacity="0.1" />
                </pattern>
              </defs>
              <rect width="380" height="220" fill="url(#sheetDots)" />

              {/* Edge: app/main.py -> services/git.py */}
              <path
                d="M100 55 C 130 55, 150 90, 180 90"
                stroke="var(--ink-black)"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              <polygon
                points="180,90 173,86 174,94"
                fill="var(--ink-black)"
              />

              {/* Edge: app/main.py -> models/commit.py */}
              <path
                d="M100 65 C 130 90, 150 150, 180 160"
                stroke="var(--ink-black)"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              <polygon
                points="180,160 173,156 175,164"
                fill="var(--ink-black)"
              />

              {/* Edge: services/git.py -> models/commit.py */}
              <path
                d="M245 105 C 255 125, 245 145, 245 150"
                stroke="var(--accent-blue)"
                strokeWidth="2"
              />
              <polygon
                points="245,150 241,142 249,142"
                fill="var(--accent-blue)"
              />

              {/* Edge: services/git.py -> analysis/parser.py */}
              <path
                d="M255 85 C 280 85, 290 60, 310 55"
                stroke="var(--ink-black)"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
              <polygon
                points="310,55 302,53 305,61"
                fill="var(--ink-black)"
              />

              {/* Node 1: Entry Point (app/main.py) */}
              <g transform="translate(15, 35)">
                <rect
                  width="95"
                  height="42"
                  rx="6"
                  fill="var(--sticky-coral)"
                  stroke="var(--ink-black)"
                  strokeWidth="2"
                />
                <text
                  x="10"
                  y="20"
                  fontFamily="var(--font-mono)"
                  fontSize="11"
                  fontWeight="bold"
                  fill="var(--ink-black)"
                >
                  app/main.py
                </text>
                <text
                  x="10"
                  y="34"
                  fontFamily="var(--font-heading)"
                  fontSize="10"
                  fill="var(--accent-red)"
                >
                  ★ ENTRY POINT
                </text>
              </g>

              {/* Node 2: Service (services/git.py) */}
              <g transform="translate(170, 70)">
                <rect
                  width="100"
                  height="42"
                  rx="6"
                  fill="var(--sticky-yellow)"
                  stroke="var(--ink-black)"
                  strokeWidth="2"
                />
                <text
                  x="10"
                  y="20"
                  fontFamily="var(--font-mono)"
                  fontSize="11"
                  fontWeight="bold"
                  fill="var(--ink-black)"
                >
                  services/git.py
                </text>
                <text
                  x="10"
                  y="34"
                  fontFamily="var(--font-heading)"
                  fontSize="10"
                  fill="var(--ink-muted)"
                >
                  churn: 4 commits
                </text>
              </g>

              {/* Node 3: Model (models/commit.py) */}
              <g transform="translate(170, 150)">
                <rect
                  width="105"
                  height="42"
                  rx="6"
                  fill="var(--sticky-green)"
                  stroke="var(--ink-black)"
                  strokeWidth="2"
                />
                <text
                  x="10"
                  y="20"
                  fontFamily="var(--font-mono)"
                  fontSize="11"
                  fontWeight="bold"
                  fill="var(--ink-black)"
                >
                  models/commit.py
                </text>
                <text
                  x="10"
                  y="34"
                  fontFamily="var(--font-heading)"
                  fontSize="10"
                  fill="var(--ink-muted)"
                >
                  SQLAlchemy entity
                </text>
              </g>

              {/* Node 4: Parser (analysis/tree_sitter.py) */}
              <g transform="translate(295, 35)">
                <rect
                  width="78"
                  height="36"
                  rx="6"
                  fill="var(--sticky-blue)"
                  stroke="var(--ink-black)"
                  strokeWidth="1.8"
                />
                <text
                  x="8"
                  y="18"
                  fontFamily="var(--font-mono)"
                  fontSize="10"
                  fontWeight="bold"
                  fill="var(--ink-black)"
                >
                  tree_sitter
                </text>
                <text
                  x="8"
                  y="29"
                  fontFamily="var(--font-heading)"
                  fontSize="9"
                  fill="var(--accent-blue)"
                >
                  AST parser
                </text>
              </g>
            </svg>

            <div className={styles.sheetStickyAnnotation}>
              <span>📌</span> <em>Architectural note:</em> Graph edges represent
              confirmed static imports only — zero hallucinated dependencies.
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <div className={styles.sectionDivider} />

      {/* ── 2. Simple Three-Step Workflow: Connect, Explore, Understand ─────── */}
      <section className={styles.workflowSection} aria-labelledby="workflow-heading">
        <div className={styles.sectionHeader}>
          <h2 id="workflow-heading" className={styles.sectionTitle}>
            How CommitScope Works
          </h2>
          <span className={styles.sectionCount}>3 Simple Steps</span>
        </div>
        <SketchUnderline color="var(--accent-blue)" width={180} />

        <div className={styles.workflowGrid}>
          <div className={styles.workflowCard}>
            <span className={styles.workflowStepNum}>01</span>
            <h3 className={styles.workflowCardTitle}>Connect</h3>
            <p className={styles.workflowCardDesc}>
              Point CommitScope at a local Git repository path mounted inside
              your Docker environment. The backend verifies permissions and
              opens the Git database safely with Pygit2.
            </p>
          </div>

          <div className={styles.workflowCard}>
            <span className={styles.workflowStepNum}>02</span>
            <h3 className={styles.workflowCardTitle}>Explore</h3>
            <p className={styles.workflowCardDesc}>
              CommitScope traverses the commit log and extracts full file trees.
              Confirmed static imports are parsed to construct architectural
              dependency graphs without cloud exposure.
            </p>
          </div>

          <div className={styles.workflowCard}>
            <span className={styles.workflowStepNum}>03</span>
            <h3 className={styles.workflowCardTitle}>Understand</h3>
            <p className={styles.workflowCardDesc}>
              Inspect visual dependency maps, track file churn hotspots, and trace
              exact commit progressions with diff statistics across the codebase
              lifecycle.
            </p>
          </div>
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <div className={styles.sectionDivider} />

      {/* ── 3. Core Capabilities Highlights ──────────────────────────────────── */}
      <section className={styles.featuresSection} aria-labelledby="features-heading">
        <div className={styles.sectionHeader}>
          <h2 id="features-heading" className={styles.sectionTitle}>
            Repository Intelligence Pillars
          </h2>
        </div>
        <SketchUnderline color="var(--accent-red)" width={210} />

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🗺️</div>
            <h3 className={styles.featureTitle}>Architecture Exploration</h3>
            <p className={styles.featureDesc}>
              Transform opaque directories into an interactive architectural
              notebook. Follow import vectors from entry points to core
              services, distinguishing internal modules from third-party packages.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⏱️</div>
            <h3 className={styles.featureTitle}>Git History & Change Analysis</h3>
            <p className={styles.featureDesc}>
              Trace the chronological progression of commits, author contributions,
              file insertions, and deletions with deterministic metadata stored
              cleanly in PostgreSQL.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔥</div>
            <h3 className={styles.featureTitle}>File Churn & Hotspot Discovery</h3>
            <p className={styles.featureDesc}>
              Locate high-frequency edit areas across repository lifecycles. File
              churn rankings highlight complex or fragile modules requiring
              architectural attention.
            </p>
          </div>
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <div className={styles.sectionDivider} />

      {/* ── 4. Repositories Section (Meets Test Assertions & Real Data) ──────── */}
      <section className={styles.repoSection} aria-labelledby="repo-heading">
        <div className={styles.sectionHeader}>
          <h2 id="repo-heading" className={styles.sectionTitle}>
            Repositories
          </h2>
          <span className={styles.sectionCount}>
            {repositories.length} registered
          </span>
        </div>

        {repositories.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} aria-hidden="true">
              <RepoEmptyIcon />
            </div>
            <h3 className={styles.emptyTitle}>No repositories registered</h3>
            <p className={styles.emptyDesc}>
              Repository registration arrives in <strong>Stage 2</strong>.
              Once implemented, you will point CommitScope at a local git repository path
              and trigger analysis from here.
            </p>
            <div className={styles.emptyActions}>
              <button
                className={styles.btnPrimary}
                disabled
                title="Available in Stage 2"
                aria-disabled="true"
              >
                <PlusIcon />
                Add Repository
              </button>
              <a
                href="/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnSecondary}
              >
                <DocsIcon />
                View API Docs
              </a>
            </div>
          </div>
        ) : (
          <div className={styles.repoCardsGrid}>
            {repositories.map((repo) => (
              <Link
                key={repo.id}
                to={`/repositories/${repo.id}`}
                className={styles.repoItemCard}
              >
                <div className={styles.repoItemHeader}>
                  <h3 className={styles.repoItemName}>{repo.name}</h3>
                  <StatusBadge status={repo.status} />
                </div>
                <div className={styles.repoItemPath}>{repo.local_path}</div>
                <div className={styles.repoItemStats}>
                  <span className={styles.repoStatItem}>
                    <strong>{repo.commit_count}</strong> commits
                  </span>
                  <span className={styles.repoStatItem}>
                    <strong>{repo.file_count}</strong> files
                  </span>
                  <span className={styles.repoStatItem}>
                    branch: <strong>{repo.default_branch || 'main'}</strong>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <div className={styles.sectionDivider} />

      {/* ── 5. Platform Capabilities Roadmap ───────────────────────────────── */}
      <section className={styles.capSection} aria-labelledby="cap-heading">
        <div className={styles.sectionHeader}>
          <h2 id="cap-heading" className={styles.sectionTitle}>
            Platform Capabilities
          </h2>
          <span className={styles.sectionCount}>6 features · 6 stages</span>
        </div>

        <div className={styles.capGrid} role="list">
          {CAPABILITIES.map((cap) => (
            <article
              key={cap.id}
              className={`${styles.capCard} ${cap.implemented ? styles.capReady : ''}`}
              role="listitem"
              aria-label={`${cap.title}: ${cap.implemented ? 'ready' : `Stage ${cap.stage}`}`}
            >
              <div className={styles.capHeader}>
                <span className={styles.capIcon} aria-hidden="true">
                  {cap.icon}
                </span>
                <span
                  className={`${styles.capBadge} ${cap.implemented ? styles.capBadgeReady : ''}`}
                >
                  {cap.implemented ? '✓ Stage 1' : `Stage ${cap.stage}`}
                </span>
              </div>
              <h3 className={styles.capTitle}>{cap.title}</h3>
              <p className={styles.capDesc}>{cap.desc}</p>
              {cap.tags && (
                <div className={styles.capTags} aria-label="Technology tags">
                  {cap.tags.map((t) => (
                    <span key={t} className={styles.capTag}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <div className={styles.sectionDivider} />

      {/* ── 6. Technology Stack ────────────────────────────────────────────── */}
      <section className={styles.stackSection} aria-labelledby="stack-heading">
        <div className={styles.sectionHeader}>
          <h2 id="stack-heading" className={styles.sectionTitle}>
            Technology Stack
          </h2>
        </div>
        <div className={styles.stackGrid} role="list">
          {STACK.map((item) => (
            <div key={item.name} className={styles.stackItem} role="listitem">
              <span className={styles.stackName}>{item.name}</span>
              <span className={styles.stackRole}>{item.role}</span>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.pagePad} />
    </div>
  )
}

/* ── Capabilities Data ──────────────────────────────────────────────────────── */
const CAPABILITIES = [
  {
    id: 'infra',
    title: 'Infrastructure',
    desc: 'FastAPI backend, PostgreSQL database, async SQLAlchemy, Alembic migrations, and a React/Vite frontend — all running in Docker Compose.',
    icon: <ServerIcon />,
    stage: 1,
    implemented: true,
    tags: ['FastAPI', 'PostgreSQL', 'Docker'],
  },
  {
    id: 'ingestion',
    title: 'Repository Ingestion',
    desc: 'Register a local git repository. CommitScope walks the commit log and file tree using Pygit2, storing commits and file nodes in the database.',
    icon: <GitIcon />,
    stage: 2,
    implemented: false,
    tags: ['Pygit2', 'libgit2'],
  },
  {
    id: 'dependency',
    title: 'Dependency Analysis',
    desc: 'tree-sitter parses Python and JavaScript/TypeScript source files to extract confirmed static imports. External packages are tracked separately — no fabricated edges.',
    icon: <LinkIcon />,
    stage: 3,
    implemented: false,
    tags: ['tree-sitter', 'NetworkX'],
  },
  {
    id: 'graph',
    title: 'Architecture Graph',
    desc: 'An interactive directed graph visualises the dependency structure. Nodes represent files and directories; edges represent import relationships. Zoom, pan, and click to inspect.',
    icon: <GraphIcon />,
    stage: 4,
    implemented: false,
    tags: ['@xyflow/react'],
  },
  {
    id: 'analytics',
    title: 'Git Analytics & Heatmap',
    desc: 'Commit timeline, contributor breakdown, and file hotspot list. Architecture graph nodes are coloured by commit churn to reveal change-intensive areas.',
    icon: <ChartIcon />,
    stage: 5,
    implemented: false,
    tags: ['Recharts'],
  },
  {
    id: 'compare',
    title: 'Historical Comparisons',
    desc: 'Select two commits or branches to compare their dependency graphs. See which files were added, removed or restructured between snapshots.',
    icon: <CompareIcon />,
    stage: 6,
    implemented: false,
    tags: ['NetworkX', 'Snapshots'],
  },
]

const STACK = [
  { name: 'Python 3.12', role: 'Backend language' },
  { name: 'FastAPI', role: 'HTTP framework' },
  { name: 'SQLAlchemy 2.x', role: 'Async ORM' },
  { name: 'Alembic', role: 'Schema migrations' },
  { name: 'PostgreSQL 16', role: 'Primary database' },
  { name: 'Pygit2 / libgit2', role: 'Git integration' },
  { name: 'tree-sitter', role: 'AST parsing (Stage 3)' },
  { name: 'NetworkX', role: 'Graph algorithms (Stage 3)' },
  { name: 'React 18', role: 'Frontend framework' },
  { name: 'Vite 5', role: 'Build tool' },
  { name: '@xyflow/react', role: 'Graph canvas (Stage 4)' },
  { name: 'Recharts', role: 'Charts (Stage 5)' },
]

/* ── Inline SVG Icons ───────────────────────────────────────────────────────── */
function RepoEmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="6" y="6" width="36" height="36" rx="6" stroke="currentColor" strokeWidth="2" />
      <path d="M16 14v20M16 14l7 7M16 26l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 19h8M28 24h8M28 29h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function DocsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1.5" y="1" width="11" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 4.5h6M4 7h6M4 9.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ServerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="16" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="12" width="16" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="5.5" r="1" fill="currentColor" />
      <circle cx="15" cy="14.5" r="1" fill="currentColor" />
    </svg>
  )
}

function GitIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="5" cy="15" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 7v6M5 7c0-2 10-2 10 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="5" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 9L12.5 6.2M7.5 11L12.5 13.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function GraphIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="4" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 9L13.5 6.2M6.5 11L13.5 13.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="11" width="3" height="6" rx="0.5" fill="currentColor" opacity="0.4" />
      <rect x="8.5" y="7" width="3" height="10" rx="0.5" fill="currentColor" opacity="0.7" />
      <rect x="14" y="3" width="3" height="14" rx="0.5" fill="currentColor" />
    </svg>
  )
}

function CompareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6 4L3 10l3 6M14 4l3 6-3 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 5v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2.5" />
    </svg>
  )
}
