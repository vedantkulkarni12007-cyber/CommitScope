import React from 'react'
import styles from './Logo.module.css'

/**
 * CommitScope hand-drawn brand identity.
 * Architectural sketchbook scope / compass mark + hand-lettered Kalam wordmark.
 */
export default function Logo({ size = 'md', showWordmark = true }) {
  const iconSize = size === 'sm' ? 22 : size === 'lg' ? 34 : 28

  return (
    <div className={`${styles.root} ${styles[size]}`} aria-label="CommitScope">
      {/* Hand-drawn scope / crosshairs icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={styles.icon}
      >
        {/* Paper badge background with pencil border */}
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="5"
          fill="#fdfbf7"
          stroke="var(--ink-black)"
          strokeWidth="2"
        />
        {/* Hand-drawn target circle */}
        <circle
          cx="16"
          cy="16"
          r="8"
          stroke="var(--ink-black)"
          strokeWidth="1.8"
          strokeDasharray="2 1"
        />
        {/* Red center dot */}
        <circle cx="16" cy="16" r="3" fill="var(--accent-red)" stroke="var(--ink-black)" strokeWidth="1" />
        {/* Ballpoint-blue tick marks */}
        <line x1="16" y1="3" x2="16" y2="7.5" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="24.5" x2="16" y2="29" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" />
        <line x1="3" y1="16" x2="7.5" y2="16" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" />
        <line x1="24.5" y1="16" x2="29" y2="16" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" />
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
