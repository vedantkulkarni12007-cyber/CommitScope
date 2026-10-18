import styles from './Logo.module.css'

/**
 * CommitScope wordmark.
 *
 * The icon is an inline SVG crosshair/scope — represents "targeting" commits.
 * size: 'sm' | 'md' | 'lg'
 */
export default function Logo({ size = 'md', showWordmark = true }) {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 24

  return (
    <div className={`${styles.root} ${styles[size]}`} aria-label="CommitScope">
      {/* Scope / crosshair icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={styles.icon}
      >
        <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
        <line x1="12" y1="1" x2="12" y2="4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="19.5" x2="12" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="1" y1="12" x2="4.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="19.5" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      {showWordmark && (
        <span className={styles.wordmark}>
          <span className={styles.word1}>Commit</span>
          <span className={styles.word2}>Scope</span>
        </span>
      )}
    </div>
  )
}
