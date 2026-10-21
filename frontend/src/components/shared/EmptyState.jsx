import React from 'react'
import styles from './EmptyState.module.css'

export default function EmptyState({
  title,
  description,
  action = null,
  secondaryAction = null,
  icon = null,
  hasTape = true,
  className = '',
}) {
  return (
    <div className={`${styles.emptyState} ${className}`}>
      {hasTape && <div className={styles.tape} aria-hidden="true" />}

      <div className={styles.iconArea} aria-hidden="true">
        {icon || <DefaultSketchRepoTree />}
      </div>

      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}

      {(action || secondaryAction) && (
        <div className={styles.actions}>
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}

/** Tasteful hand-drawn repository tree & dependency map illustration */
export function DefaultSketchRepoTree() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Root commit / node */}
      <circle cx="36" cy="14" r="7" fill="var(--sticky-yellow)" stroke="var(--ink-black)" strokeWidth="2" />
      <text x="36" y="18" textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--ink-black)" fontFamily="var(--font-heading)">R</text>

      {/* Branches */}
      <path d="M36 21V34M36 34L18 48M36 34L54 48" stroke="var(--ink-black)" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2" />

      {/* Child Node A */}
      <circle cx="18" cy="52" r="6" fill="var(--sticky-green)" stroke="var(--ink-black)" strokeWidth="2" />
      <text x="18" y="55.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--ink-black)" fontFamily="var(--font-heading)">A</text>

      {/* Child Node B (Entry / Highlight) */}
      <circle cx="54" cy="52" r="6" fill="var(--sticky-coral)" stroke="var(--ink-black)" strokeWidth="2" />
      <text x="54" y="55.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--ink-black)" fontFamily="var(--font-heading)">B</text>

      {/* Edge between A and B */}
      <path d="M24 52H48" stroke="var(--accent-blue)" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 2" />

      {/* Little pencil arrow */}
      <path d="M44 49L48 52L44 55" stroke="var(--accent-blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
