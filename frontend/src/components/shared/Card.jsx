import React from 'react'
import styles from './Card.module.css'
import { SketchPushPin } from './SketchDecorations'

export default function Card({
  children,
  variant = 'default',
  interactive = false,
  hasTape = false,
  hasPin = false,
  rotate = null,
  className = '',
  as: Component = 'div',
  ...props
}) {
  const variantClass = {
    default: styles.default,
    paper: styles.paper,
    muted: styles.muted,
    surface: styles.surface,
    'sticky-yellow': styles.stickyYellow,
    'sticky-green': styles.stickyGreen,
    'sticky-blue': styles.stickyBlue,
    'sticky-coral': styles.stickyCoral,
  }[variant] || styles.default

  const inlineStyle = {
    ...(rotate ? { transform: `rotate(${rotate})` } : {}),
    ...props.style,
  }

  return (
    <Component
      className={`${styles.card} ${variantClass} ${interactive ? styles.interactive : ''} ${className}`}
      style={inlineStyle}
      {...props}
    >
      {hasTape && <div className={styles.tape} aria-hidden="true" />}
      {hasPin && (
        <div className={styles.pinContainer} aria-hidden="true">
          <SketchPushPin size={18} />
        </div>
      )}
      {children}
    </Component>
  )
}
