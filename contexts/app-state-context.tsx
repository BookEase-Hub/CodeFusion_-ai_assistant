"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// =================================================================================
// Types and Interfaces
// =================================================================================

export interface FileNode {
  id: string
  name: string
  type: "file" | "folder"
  path: string
  content?: string
  children?: FileNode[]
  isDirty?: boolean
}

export interface Project {
  id: string
  name: string
  files: FileNode[]
}

interface EditorTab {
  id: string // Corresponds to FileNode id
  name: string
  path: string
  language?: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  code?: { language: string; value: string }
}

interface AIAssistantState {
  currentProject: Project | null
  editorTabs: EditorTab[]
  activeEditorTab: string | null // id of the active tab
  chatMessages: ChatMessage[]
  chatInput: string
  showExplorer: boolean
  showTerminal: boolean
  showProblems: boolean
  activePanel: string | null
  terminalHeight: number
}

interface AppState {
  aiAssistant: AIAssistantState
  // other top-level state slices can go here
}

interface AppStateContextType {
  state: AppState
  updateAIAssistant: (updates: Partial<AIAssistantState>) => void

  // Project management
  loadProject: (project: Project) => void
  clearProject: () => void
  saveProjectAs: (newProjectName: string) => void

  // File and Folder operations
  updateNode: (nodeId: string, updates: Partial<FileNode>) => void

  // Editor Tab management
  openEditorTab: (fileNode: FileNode) => void
  closeEditorTab: (tabId: string) => void

  // Chat management
  addChatMessage: (message: ChatMessage) => void
  clearChatMessages: () => void

  // Persistence
  persistState: () => void
  loadState: () => void
}

// =================================================================================
// Default State
// =================================================================================

const defaultState: AppState = {
  aiAssistant: {
    currentProject: null,
    editorTabs: [],
    activeEditorTab: null,
    chatMessages: [
      {
        id: "1",
        role: "assistant",
        content: "Hi! I'm your AI coding assistant. Upload a project or create a new file to get started.",
      },
    ],
    chatInput: "",
    showExplorer: true,
    showTerminal: false,
    showProblems: false,
    activePanel: "terminal",
    terminalHeight: 200,
  },
}

// =================================================================================
// Context Definition
// =================================================================================

const AppStateContext = createContext<AppStateContextType | undefined>(undefined)

// =================================================================================
// App State Provider
// =================================================================================

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
        const mergedState = {
          ...defaultState,
          aiAssistant: {
            ...defaultState.aiAssistant,
            ...parsedState.aiAssistant,
          }
        }
        setState(mergedState)
      }
    } catch (error) {
      console.error("Failed to load app state:", error)
    }
  }

  const updateAIAssistant = (updates: Partial<AIAssistantState>) => {
    setState((prev) => ({
      ...prev,
      aiAssistant: { ...prev.aiAssistant, ...updates },
    }))
  }

  // --- Project Management ---
  const loadProject = (project: Project) => {
    setState(prev => ({
        ...prev,
        aiAssistant: {
            ...prev.aiAssistant,
            currentProject: project,
            editorTabs: [],
            activeEditorTab: null,
        }
    }))
  }

  const clearProject = () => {
    setState(prev => ({
        ...prev,
        aiAssistant: {
            ...prev.aiAssistant,
            currentProject: null,
            editorTabs: [],
            activeEditorTab: null,
        }
    }))
  }

  const saveProjectAs = (newProjectName: string) => {
    setState(prev => {
      if (!prev.aiAssistant.currentProject) return prev;

      const newProject: Project = {
          ...prev.aiAssistant.currentProject,
          id: `proj_${Date.now()}`,
          name: newProjectName,
      };

      // In a real app, we would save the newProject to the backend here.
      // For now, we simulate by just clearing the workspace.

      return {
          ...prev,
          aiAssistant: {
              ...prev.aiAssistant,
              currentProject: null, // Reset the workspace
              editorTabs: [],
              activeEditorTab: null,
          }
      }
    });
  }

  // --- File/Folder Operations ---
  const updateNode = (nodeId: string, updates: Partial<FileNode>) => {
    const recursiveUpdate = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
            if (node.id === nodeId) {
                return { ...node, ...updates };
            }
            if (node.children) {
                return { ...node, children: recursiveUpdate(node.children) };
            }
            return node;
        });
    }

    setState(prev => {
        if (!prev.aiAssistant.currentProject) return prev;
        return {
            ...prev,
            aiAssistant: {
                ...prev.aiAssistant,
                currentProject: {
                    ...prev.aiAssistant.currentProject,
                    files: recursiveUpdate(prev.aiAssistant.currentProject.files)
                }
            }
        }
    })
  }

  // --- Editor Tab Management ---
  const openEditorTab = (fileNode: FileNode) => {
    if (fileNode.type !== 'file') return;

    setState(prev => {
        const alreadyOpen = prev.aiAssistant.editorTabs.find(tab => tab.id === fileNode.id);
        if (alreadyOpen) {
            return {
                ...prev,
                aiAssistant: { ...prev.aiAssistant, activeEditorTab: fileNode.id }
            }
        }

        const newTab: EditorTab = {
            id: fileNode.id,
            name: fileNode.name,
            path: fileNode.path,
            language: fileNode.name.split('.').pop() || 'plaintext',
        };

        return {
            ...prev,
            aiAssistant: {
                ...prev.aiAssistant,
                editorTabs: [...prev.aiAssistant.editorTabs, newTab],
                activeEditorTab: newTab.id,
            }
        }
    })
  }

  const closeEditorTab = (tabId: string) => {
    setState((prev) => {
      const newTabs = prev.aiAssistant.editorTabs.filter((tab) => tab.id !== tabId)
      let newActiveTab = prev.aiAssistant.activeEditorTab;

      if (newActiveTab === tabId) {
          if (newTabs.length > 0) {
              const closedTabIndex = prev.aiAssistant.editorTabs.findIndex(t => t.id === tabId);
              newActiveTab = newTabs[Math.max(0, closedTabIndex - 1)].id;
          } else {
              newActiveTab = null;
          }
      }

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

  // --- Chat Management ---
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
        loadProject,
        clearProject,
        saveProjectAs,
        updateNode,
        openEditorTab,
        closeEditorTab,
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

// =================================================================================
// Custom Hook
// =================================================================================

export function useAppState() {
  const context = useContext(AppStateContext)
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider")
  }
  return context
}
