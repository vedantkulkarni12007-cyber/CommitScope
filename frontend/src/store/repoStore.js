import { create } from 'zustand'
import {
  fetchHealth,
  fetchRepositories,
  fetchRepositoryDetail,
  registerRepository,
  syncRepository,
} from '../api/client'

export const useRepoStore = create((set, get) => ({
  // State
  repositories: [],
  totalRepos: 0,
  selectedRepo: null,
  health: { status: 'checking', database: 'unknown' },
  loading: false,
  detailLoading: false,
  syncing: false,
  error: null,
  addModalOpen: false,

  // UI Actions
  setAddModalOpen: (open) => set({ addModalOpen: open }),
  clearError: () => set({ error: null }),

  // Health check
  checkHealth: async () => {
    try {
      const data = await fetchHealth()
      set({ health: data })
      return data
    } catch (err) {
      set({
        health: {
          status: 'offline',
          database: 'disconnected',
          error: err.message,
        },
      })
      return null
    }
  },

  // Load repositories list
  loadRepositories: async () => {
    set({ loading: true, error: null })
    try {
      const data = await fetchRepositories()
      set({
        repositories: data.items || [],
        totalRepos: data.total || 0,
        loading: false,
      })
      return data.items || []
    } catch (err) {
      set({
        loading: false,
        error: err.message || 'Failed to fetch repositories',
      })
      return []
    }
  },

  // Select and load repository details
  selectRepository: async (repoId) => {
    if (!repoId) {
      set({ selectedRepo: null })
      return null
    }
    set({ detailLoading: true, error: null })
    try {
      const detail = await fetchRepositoryDetail(repoId)
      set({ selectedRepo: detail, detailLoading: false })
      return detail
    } catch (err) {
      set({
        detailLoading: false,
        error: err.message || `Failed to fetch repository ${repoId}`,
      })
      return null
    }
  },

  // Add a repository
  addRepo: async (localPath, name) => {
    set({ loading: true, error: null })
    try {
      const createdRepo = await registerRepository(localPath, name)
      // Refresh list
      await get().loadRepositories()
      set({
        selectedRepo: createdRepo,
        loading: false,
        addModalOpen: false,
      })
      return { success: true, data: createdRepo }
    } catch (err) {
      set({ loading: false })
      return {
        success: false,
        error: err.message,
        code: err.code,
        detail: err.detail,
      }
    }
  },

  // Sync a repository
  syncRepo: async (repoId) => {
    set({ syncing: true, error: null })
    try {
      const updated = await syncRepository(repoId)
      // Refresh detail and list
      await get().selectRepository(repoId)
      await get().loadRepositories()
      set({ syncing: false })
      return { success: true, data: updated }
    } catch (err) {
      set({ syncing: false, error: err.message })
      return { success: false, error: err.message }
    }
  },
}))
