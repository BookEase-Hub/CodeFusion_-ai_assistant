"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { get, set } from "@/lib/idb"

// Types for persistent state
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
    currentProject: Project | null
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
  createFile: (parentId: string | null, name: string) => void
  createFolder: (parentId: string | null, name: string) => void
  renameNode: (nodeId: string, newName: string) => void
  deleteNode: (nodeId: string) => void
  moveNode: (nodeId: string, newParentId: string) => void
  updateFileContent: (fileId: string, content: string) => void
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
    currentProject: {
      id: "proj-1",
      name: "My Sample Project",
      files: [
        {
          id: "file-1",
          name: "index.js",
          type: "file",
          path: "index.js",
          content: "console.log('hello world')",
        },
        {
          id: "folder-1",
          name: "src",
          type: "folder",
          path: "src",
          children: [
            {
              id: "file-2",
              name: "app.js",
              type: "file",
              path: "src/app.js",
              content: "import React from 'react'",
            },
          ],
        },
      ],
    },
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
  }, [state.aiAssistant.currentProject])

  const persistState = async () => {
    try {
      await set("ai_assistant_state", state.aiAssistant)
    } catch (error) {
      console.error("Failed to persist app state:", error)
    }
  }

  const loadState = async () => {
    try {
      const savedState = await get("ai_assistant_state")
      if (savedState) {
        setState((prev) => ({ ...prev, aiAssistant: { ...prev.aiAssistant, ...savedState } }))
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

  const createFile = (parentId: string | null, name: string) => {
    setState((prev) => {
      if (!prev.aiAssistant.currentProject) return prev

      const newFile: FileNode = {
        id: `file-${Date.now()}`,
        name,
        type: "file",
        path: parentId ? `${findNodePath(prev.aiAssistant.currentProject.files, parentId)}/${name}` : name,
        content: "",
      }

      const newFiles = addNode(prev.aiAssistant.currentProject.files, parentId, newFile)

      return {
        ...prev,
        aiAssistant: {
          ...prev.aiAssistant,
          currentProject: {
            ...prev.aiAssistant.currentProject,
            files: newFiles,
          },
        },
      }
    })
  }

  const createFolder = (parentId: string | null, name: string) => {
    setState((prev) => {
      if (!prev.aiAssistant.currentProject) return prev

      const newFolder: FileNode = {
        id: `folder-${Date.now()}`,
        name,
        type: "folder",
        path: parentId ? `${findNodePath(prev.aiAssistant.currentProject.files, parentId)}/${name}` : name,
        children: [],
      }

      const newFiles = addNode(prev.aiAssistant.currentProject.files, parentId, newFolder)

      return {
        ...prev,
        aiAssistant: {
          ...prev.aiAssistant,
          currentProject: {
            ...prev.aiAssistant.currentProject,
            files: newFiles,
          },
        },
      }
    })
  }

  const findNodePath = (nodes: FileNode[], nodeId: string): string | null => {
    for (const node of nodes) {
      if (node.id === nodeId) return node.path
      if (node.children) {
        const path = findNodePath(node.children, nodeId)
        if (path) return path
      }
    }
    return null
  }

  const addNode = (nodes: FileNode[], parentId: string | null, newNode: FileNode): FileNode[] => {
    if (parentId === null) {
      return [...nodes, newNode]
    }

    return nodes.map((node) => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), newNode],
        }
      }
      if (node.children) {
        return {
          ...node,
          children: addNode(node.children, parentId, newNode),
        }
      }
      return node
    })
  }

  const renameNode = (nodeId: string, newName: string) => {
    setState((prev) => {
      if (!prev.aiAssistant.currentProject) return prev
      const newFiles = renameNodeRecursive(prev.aiAssistant.currentProject.files, nodeId, newName)
      return {
        ...prev,
        aiAssistant: { ...prev.aiAssistant, currentProject: { ...prev.aiAssistant.currentProject, files: newFiles } },
      }
    })
  }

  const deleteNode = (nodeId: string) => {
    setState((prev) => {
      if (!prev.aiAssistant.currentProject) return prev
      const newFiles = deleteNodeRecursive(prev.aiAssistant.currentProject.files, nodeId)
      return {
        ...prev,
        aiAssistant: { ...prev.aiAssistant, currentProject: { ...prev.aiAssistant.currentProject, files: newFiles } },
      }
    })
  }

  const moveNode = (nodeId: string, newParentId: string) => {
    console.log("Moving node", nodeId, "to", newParentId)
    // TODO: Implement this properly
  }

  const updateFileContent = (fileId: string, content: string) => {
    setState((prev) => {
      if (!prev.aiAssistant.currentProject) return prev

      const newFiles = updateFileContentRecursive(prev.aiAssistant.currentProject.files, fileId, content)

      return {
        ...prev,
        aiAssistant: {
          ...prev.aiAssistant,
          currentProject: {
            ...prev.aiAssistant.currentProject,
            files: newFiles,
          },
        },
      }
    })
  }

  const updateFileContentRecursive = (nodes: FileNode[], fileId: string, content: string): FileNode[] => {
    return nodes.map((node) => {
      if (node.id === fileId) {
        return { ...node, content, isDirty: true }
      }
      if (node.children) {
        return { ...node, children: updateFileContentRecursive(node.children, fileId, content) }
      }
      return node
    })
  }

  const renameNodeRecursive = (nodes: FileNode[], nodeId: string, newName: string): FileNode[] => {
    return nodes.map((node) => {
      if (node.id === nodeId) {
        const pathParts = node.path.split("/")
        pathParts[pathParts.length - 1] = newName
        const newPath = pathParts.join("/")
        return { ...node, name: newName, path: newPath }
      }
      if (node.children) {
        return { ...node, children: renameNodeRecursive(node.children, nodeId, newName) }
      }
      return node
    })
  }

  const deleteNodeRecursive = (nodes: FileNode[], nodeId: string): FileNode[] => {
    return nodes.filter((node) => node.id !== nodeId).map((node) => {
      if (node.children) {
        return { ...node, children: deleteNodeRecursive(node.children, nodeId) }
      }
      return node
    })
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
        createFile,
        createFolder,
        renameNode,
        deleteNode,
        moveNode,
        updateFileContent,
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
