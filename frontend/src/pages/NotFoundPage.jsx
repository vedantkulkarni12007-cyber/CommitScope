import React from 'react'
import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <div className={styles.page} role="main" aria-labelledby="notfound-heading">
      <div className={styles.sheet}>
        <div className={styles.tape} aria-hidden="true" />
        <div className={styles.code} aria-hidden="true">
          404
        </div>
        <h1 id="notfound-heading" className={styles.title}>
          Page not found
        </h1>
        <p className={styles.desc}>
          This route seems to have been drawn off the edge of the sketchbook. It
          may be part of a future stage of CommitScope.
        </p>
        <Link to="/" className={styles.homeLink}>
          ← Back to Repositories
        </Link>
      </div>
    </div>
  )
}
