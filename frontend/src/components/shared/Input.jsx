import React, { useId } from 'react'
import styles from './Input.module.css'

export default function Input({
  label,
  id: explicitId,
  helperText,
  error,
  optional = false,
  mono = false,
  className = '',
  ...props
}) {
  const generatedId = useId()
  const id = explicitId || generatedId

  return (
    <div className={`${styles.fieldGroup} ${className}`}>
      {label && (
        <div className={styles.labelRow}>
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
          {optional && <span className={styles.optional}>Optional</span>}
        </div>
      )}

      <div className={styles.inputWrapper}>
        <input
          id={id}
          className={`${styles.input} ${mono ? styles.mono : ''} ${error ? styles.hasError : ''}`}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
          {...props}
        />
      </div>

      {error ? (
        <span id={`${id}-error`} className={styles.errorText} role="alert">
          <span aria-hidden="true">✏️</span> {error}
        </span>
      ) : helperText ? (
        <span id={`${id}-helper`} className={styles.helperText}>
          {helperText}
        </span>
      ) : null}
    </div>
  )
}
