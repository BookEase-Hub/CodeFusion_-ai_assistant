"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Types for persistent state
interface ProjectState {
  searchQuery: string
  activeTab: string
  selectedProjects: string[]
}

interface APIHubState {
  searchQuery: string
  activeTab: string
  selectedIntegrations: string[]
}

interface SettingsState {
  activeTab: string
  unsavedChanges: Record<string, any>
}

interface AppState {
  // Projects State
  projects: ProjectState

  // API Hub State
  apiHub: APIHubState

  // Settings State
  settings: SettingsState

  // Dashboard State
  dashboard: {
    activeTab: string
  }
}

interface AppStateContextType {
  state: AppState
  updateProjects: (updates: Partial<ProjectState>) => void
  updateAPIHub: (updates: Partial<APIHubState>) => void
  updateSettings: (updates: Partial<SettingsState>) => void
  updateDashboard: (updates: Partial<AppState["dashboard"]>) => void
  persistState: () => void
  loadState: () => void
}

const defaultState: AppState = {
  projects: {
    searchQuery: "",
    activeTab: "all",
    selectedProjects: [],
  },
  apiHub: {
    searchQuery: "",
    activeTab: "all",
    selectedIntegrations: [],
  },
  settings: {
    activeTab: "account",
    unsavedChanges: {},
  },
  dashboard: {
    activeTab: "overview",
  },
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState)

  // Load state from localStorage on mount
  useEffect(() => {
    loadState()
  }, [])

  // Auto-save state changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      persistState()
    }, 1000) // Debounce saves by 1 second

    return () => clearTimeout(timeoutId)
  }, [state])

  const persistState = () => {
    try {
      localStorage.setItem("codefusion_app_state", JSON.stringify(state))
    } catch (error) {
      console.error("Failed to persist app state:", error)
    }
  }

  const loadState = () => {
    try {
      const savedState = localStorage.getItem("codefusion_app_state")
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        setState({ ...defaultState, ...parsedState })
      }
    } catch (error) {
      console.error("Failed to load app state:", error)
    }
  }

  const updateProjects = (updates: Partial<ProjectState>) => {
    setState((prev) => ({
      ...prev,
      projects: { ...prev.projects, ...updates },
    }))
  }

  const updateAPIHub = (updates: Partial<APIHubState>) => {
    setState((prev) => ({
      ...prev,
      apiHub: { ...prev.apiHub, ...updates },
    }))
  }

  const updateSettings = (updates: Partial<SettingsState>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }))
  }

  const updateDashboard = (updates: Partial<AppState["dashboard"]>) => {
    setState((prev) => ({
      ...prev,
      dashboard: { ...prev.dashboard, ...updates },
    }))
  }

  return (
    <AppStateContext.Provider
      value={{
        state,
        updateProjects,
        updateAPIHub,
        updateSettings,
        updateDashboard,
        persistState,
        loadState,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppStateContext)
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider")
  }
  return context
}
