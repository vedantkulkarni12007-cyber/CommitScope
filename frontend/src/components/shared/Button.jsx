import React from 'react'
import styles from './Button.module.css'

export default function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon = null,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const isActuallyDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isActuallyDisabled}
      aria-disabled={isActuallyDisabled}
      className={`${styles.button} ${styles[variant] || styles.secondary} ${styles[size] || styles.md} ${isActuallyDisabled ? styles.disabled : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        icon && <span className={styles.iconArea} aria-hidden="true">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  )
}
