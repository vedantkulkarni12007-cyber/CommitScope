import styles from './LandingPage.module.css'

/**
 * Landing page — shown when no repository is selected.
 *
 * Design intent: honest developer-tool aesthetic. No fake analytics.
 * Clearly communicates what CommitScope does, what's ready (Stage 1:
 * infrastructure), and what's coming (Stages 2–6).
 */
export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.heroPill}>Git Repository Intelligence</div>
          <h1 id="hero-heading" className={styles.heroTitle}>
            Understand your codebase.<br />
            <span className={styles.heroAccent}>Down to the commit.</span>
          </h1>
          <p className={styles.heroDesc}>
            CommitScope analyses git repositories to reveal architecture graphs,
            dependency relationships, commit patterns and file hotspots —
            deterministically, with no AI and no cloud.
          </p>

          {/* Infrastructure status — honest Stage 1 state */}
          <div className={styles.statusRow}>
            <div className={styles.statusDot} aria-label="Status: ready" />
            <span className={styles.statusText}>
              Infrastructure ready — API and database online
            </span>
          </div>
        </div>
      </section>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className={styles.sectionDivider} />

      {/* ── Empty state: no repositories yet ─────────────────────────────── */}
      <section className={styles.repoSection} aria-labelledby="repo-heading">
        <div className={styles.sectionHeader}>
          <h2 id="repo-heading" className={styles.sectionTitle}>Repositories</h2>
          <span className={styles.sectionCount}>0 registered</span>
        </div>

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
      </section>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className={styles.sectionDivider} />

      {/* ── Capabilities roadmap ──────────────────────────────────────────── */}
      <section className={styles.capSection} aria-labelledby="cap-heading">
        <div className={styles.sectionHeader}>
          <h2 id="cap-heading" className={styles.sectionTitle}>Platform Capabilities</h2>
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
                <span className={styles.capIcon} aria-hidden="true">{cap.icon}</span>
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
                    <span key={t} className={styles.capTag}>{t}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className={styles.sectionDivider} />

      {/* ── Tech stack ────────────────────────────────────────────────────── */}
      <section className={styles.stackSection} aria-labelledby="stack-heading">
        <div className={styles.sectionHeader}>
          <h2 id="stack-heading" className={styles.sectionTitle}>Technology Stack</h2>
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

/* ── Data ───────────────────────────────────────────────────────────────────── */

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

/* ── Icon components (inline SVG) ───────────────────────────────────────────── */
function RepoEmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="6" y="6" width="36" height="36" rx="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 14v20M16 14l7 7M16 26l7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 19h8M28 24h8M28 29h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function DocsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1.5" y="1" width="11" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 4.5h6M4 7h6M4 9.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function ServerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="16" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
      <rect x="2" y="12" width="16" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="15" cy="5.5" r="1" fill="currentColor" />
      <circle cx="15" cy="14.5" r="1" fill="currentColor" />
    </svg>
  )
}

function GitIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="5" cy="15" r="2" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="15" cy="8" r="2" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5 7v6M5 7c0-2 10-2 10 1" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="5" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="15" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="15" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M7.5 9L12.5 6.2M7.5 11L12.5 13.8" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

function GraphIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="4" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="16" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="16" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M6.5 9L13.5 6.2M6.5 11L13.5 13.8" stroke="currentColor" strokeWidth="1.25" />
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
      <path d="M6 4L3 10l3 6M14 4l3 6-3 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 5v10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeDasharray="2 2.5" />
    </svg>
  )
}
