import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import styles from './AppShell.module.css'

/**
 * Root layout shell — sidebar + topbar + main content area.
 * All pages are rendered inside <Outlet />.
 */
export default function AppShell() {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.bodyColumn}>
        <TopBar />
        <main className={styles.main} id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
