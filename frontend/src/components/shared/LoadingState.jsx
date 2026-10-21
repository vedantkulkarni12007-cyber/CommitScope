import React from 'react'
import styles from './LoadingState.module.css'

export default function LoadingState({
  label = 'Sketching repository intelligence...',
  sublabel = 'Analyzing Git commits and structure',
  className = '',
}) {
  return (
    <div className={`${styles.wrapper} ${className}`} role="status" aria-live="polite">
      {/* Hand-drawn drafting compass spinner */}
      <div className={styles.spinnerCompass} aria-hidden="true">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          {/* Compass outer circle */}
          <circle cx="22" cy="22" r="18" stroke="var(--ink-black)" strokeWidth="2" strokeDasharray="3 2" />
          {/* Needle */}
          <line x1="22" y1="7" x2="22" y2="37" stroke="var(--accent-red)" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="22,5 18,13 26,13" fill="var(--accent-red)" stroke="var(--ink-black)" strokeWidth="1" />
          <polygon points="22,39 18,31 26,31" fill="var(--accent-blue)" stroke="var(--ink-black)" strokeWidth="1" />
          <circle cx="22" cy="22" r="3.5" fill="var(--bg-paper)" stroke="var(--ink-black)" strokeWidth="2" />
        </svg>
      </div>

      <div className={styles.label}>{label}</div>
      {sublabel && <div className={styles.sublabel}>{sublabel}</div>}
    </div>
  )
}
