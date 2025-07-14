"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Types for persistent state
interface EditorTab {
  id: string
  name: string
  content: string
  language?: string
  path?: string
  isDirty?: boolean
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  code?: { language: string; value: string }
}

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
  // AI Assistant State
  aiAssistant: {
    editorTabs: EditorTab[]
    activeEditorTab: string | null
    chatMessages: ChatMessage[]
    chatInput: string
    showExplorer: boolean
    showTerminal: boolean
    showProblems: boolean
    activePanel: string | null
    terminalHeight: number
  }

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
  updateAIAssistant: (updates: Partial<AppState["aiAssistant"]>) => void
  updateProjects: (updates: Partial<ProjectState>) => void
  updateAPIHub: (updates: Partial<APIHubState>) => void
  updateSettings: (updates: Partial<SettingsState>) => void
  updateDashboard: (updates: Partial<AppState["dashboard"]>) => void
  addEditorTab: (tab: EditorTab) => void
  updateEditorTab: (id: string, updates: Partial<EditorTab>) => void
  removeEditorTab: (id: string) => void
  addChatMessage: (message: ChatMessage) => void
  clearChatMessages: () => void
  persistState: () => void
  loadState: () => void
}

const defaultState: AppState = {
  aiAssistant: {
    editorTabs: [],
    activeEditorTab: null,
    chatMessages: [
      {
        id: "1",
        role: "assistant",
        content:
          "Hi! I'm your AI coding assistant. I can help you write, debug, and optimize code. What would you like to work on?",
      },
    ],
    chatInput: "",
    showExplorer: true,
    showTerminal: false,
    showProblems: false,
    activePanel: "terminal",
    terminalHeight: 200,
  },
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

  const updateAIAssistant = (updates: Partial<AppState["aiAssistant"]>) => {
    setState((prev) => ({
      ...prev,
      aiAssistant: { ...prev.aiAssistant, ...updates },
    }))
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

  const addEditorTab = (tab: EditorTab) => {
    setState((prev) => ({
      ...prev,
      aiAssistant: {
        ...prev.aiAssistant,
        editorTabs: [...prev.aiAssistant.editorTabs, tab],
        activeEditorTab: tab.id,
      },
    }))
  }

  const updateEditorTab = (id: string, updates: Partial<EditorTab>) => {
    setState((prev) => ({
      ...prev,
      aiAssistant: {
        ...prev.aiAssistant,
        editorTabs: prev.aiAssistant.editorTabs.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab)),
      },
    }))
  }

  const removeEditorTab = (id: string) => {
    setState((prev) => {
      const newTabs = prev.aiAssistant.editorTabs.filter((tab) => tab.id !== id)
      const newActiveTab =
        newTabs.length > 0
          ? prev.aiAssistant.activeEditorTab === id
            ? newTabs[newTabs.length - 1].id
            : prev.aiAssistant.activeEditorTab
          : null

      return {
        ...prev,
        aiAssistant: {
          ...prev.aiAssistant,
          editorTabs: newTabs,
          activeEditorTab: newActiveTab,
        },
      }
    })
  }

  const addChatMessage = (message: ChatMessage) => {
    setState((prev) => ({
      ...prev,
      aiAssistant: {
        ...prev.aiAssistant,
        chatMessages: [...prev.aiAssistant.chatMessages, message],
      },
    }))
  }

  const clearChatMessages = () => {
    setState((prev) => ({
      ...prev,
      aiAssistant: {
        ...prev.aiAssistant,
        chatMessages: [defaultState.aiAssistant.chatMessages[0]], // Keep welcome message
      },
    }))
  }

  return (
    <AppStateContext.Provider
      value={{
        state,
        updateAIAssistant,
        updateProjects,
        updateAPIHub,
        updateSettings,
        updateDashboard,
        addEditorTab,
        updateEditorTab,
        removeEditorTab,
        addChatMessage,
        clearChatMessages,
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
