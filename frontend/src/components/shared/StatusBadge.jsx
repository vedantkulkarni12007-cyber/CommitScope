import styles from './StatusBadge.module.css'

/**
 * Compact status badge for repository analysis state.
 *
 * status: 'pending' | 'analyzing' | 'ready' | 'error' | 'coming-soon'
 */
export default function StatusBadge({ status, label }) {
  const displayLabel = label ?? STATUS_LABELS[status] ?? status

  return (
    <span
      className={`${styles.badge} ${styles[status] ?? styles.default}`}
      title={displayLabel}
    >
      <span className={styles.dot} aria-hidden="true" />
      {displayLabel}
    </span>
  )
}

const STATUS_LABELS = {
  pending:      'Pending',
  analyzing:    'Analyzing',
  ready:        'Ready',
  error:        'Error',
  'coming-soon': 'Coming soon',
}
