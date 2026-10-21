import React, { useEffect, useRef } from 'react'
import styles from './Modal.module.css'

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '560px',
}) {
  const modalRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={styles.modalSheet}
        style={{ maxWidth }}
        ref={modalRef}
      >
        <div className={styles.tape} aria-hidden="true" />

        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h2 id="modal-title" className={styles.title}>
              {title}
            </h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}
