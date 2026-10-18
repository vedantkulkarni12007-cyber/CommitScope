import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <div className={styles.page} role="main" aria-labelledby="notfound-heading">
      <div className={styles.code} aria-hidden="true">404</div>
      <h1 id="notfound-heading" className={styles.title}>Page not found</h1>
      <p className={styles.desc}>
        This route doesn't exist yet — it may be part of a future stage of CommitScope.
      </p>
      <Link to="/" className={styles.homeLink}>← Back to Repositories</Link>
    </div>
  )
}
