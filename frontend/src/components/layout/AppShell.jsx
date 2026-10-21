import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import AddRepoModal from '../workspace/AddRepoModal'
import { useRepoStore } from '../../store/repoStore'
import styles from './AppShell.module.css'

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { addModalOpen, setAddModalOpen, checkHealth, loadRepositories } = useRepoStore()

  useEffect(() => {
    checkHealth()
    loadRepositories()
  }, [checkHealth, loadRepositories])

  return (
    <div className={styles.shell}>
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={styles.bodyColumn}>
        <TopBar onToggleMobile={() => setMobileOpen((prev) => !prev)} />
        <main className={styles.main} id="main-content">
          <Outlet />
        </main>
      </div>

      <AddRepoModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  )
}
