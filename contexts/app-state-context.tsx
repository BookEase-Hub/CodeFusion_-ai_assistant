"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type Project, type FileNode } from "@/hooks/use-app-state"
import { v4 as uuidv4 } from "uuid"
import { projectManager } from "@/services/project-manager"

// Recursive helper to find and update a node in the tree
const updateNodeInTree = (
  nodes: FileNode[],
  nodeId: string,
  update: Partial<FileNode>,
): FileNode[] => {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return { ...node, ...update }
    }
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, nodeId, update) }
    }
    return node
  })
}

// Recursive helper to delete a node from the tree
const deleteNodeFromTree = (nodes: FileNode[], nodeId: string): FileNode[] => {
  return nodes.reduce((acc, node) => {
    if (node.id === nodeId) {
      return acc // Skip the node to delete it
    }
    if (node.children) {
      const newChildren = deleteNodeFromTree(node.children, nodeId)
      if (newChildren.length !== node.children.length) {
        acc.push({ ...node, children: newChildren })
      } else {
        acc.push(node)
      }
    } else {
      acc.push(node)
    }
    return acc
  }, [] as FileNode[])
}

// Recursive helper to add a node to the tree
const addNodeToTree = (
  nodes: FileNode[],
  parentId: string | null,
  newNode: FileNode,
): FileNode[] => {
  if (parentId === null) {
    return [...nodes, newNode]
  }
  return nodes.map((node) => {
    if (node.id === parentId) {
      if (node.type === "folder") {
        return {
          ...node,
          children: [...(node.children || []), newNode],
        }
      }
    }
    if (node.children) {
      return { ...node, children: addNodeToTree(node.children, parentId, newNode) }
    }
    return node
  })
}

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

interface ProjectsListState {
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
  projects: ProjectsListState

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
  setCurrentProject: (project: Project | null) => void
  updateAIAssistant: (updates: Partial<AppState["aiAssistant"]>) => void
  updateProjects: (updates: Partial<ProjectsListState>) => void
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
  createFile: (name: string, parentId: string | null) => void
  createFolder: (name: string, parentId: string | null) => void
  deleteNode: (nodeId: string) => void
  renameNode: (nodeId: string, newName: string) => void
  saveProject: () => Promise<void>
  saveProjectAs: (newProjectName: string) => Promise<void>
  resetWorkspace: () => void
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
    currentProject: null,
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

  const setCurrentProject = (project: Project | null) => {
    setState((prev) => ({
      ...prev,
      aiAssistant: {
        ...prev.aiAssistant,
        currentProject: project,
      },
    }))
  }

  const createFile = (name: string, parentId: string | null) => {
    if (!state.aiAssistant.currentProject) return

    const newFile: FileNode = {
      id: uuidv4(),
      name,
      type: "file",
      path: parentId ? `${parentId}/${name}` : name, // This needs improvement
      content: "",
    }

    const newFiles = addNodeToTree(state.aiAssistant.currentProject.files, parentId, newFile)
    const newProject = { ...state.aiAssistant.currentProject, files: newFiles }
    setCurrentProject(newProject)
  }

  const resetWorkspace = () => {
    setState((prev) => ({
      ...prev,
      aiAssistant: {
        ...prev.aiAssistant,
        currentProject: null,
        editorTabs: [],
        activeEditorTab: null,
      },
    }))
  }

  const saveProject = async () => {
    if (!state.aiAssistant.currentProject) {
      throw new Error("No active project to save.")
    }
    await projectManager.saveProject(state.aiAssistant.currentProject)
    // Here you might want to clear dirty flags on files
  }

  const saveProjectAs = async (newProjectName: string) => {
    if (!state.aiAssistant.currentProject) {
      throw new Error("No active project to save.")
    }
    const newProject: Project = {
      ...state.aiAssistant.currentProject,
      name: newProjectName,
    }
    await projectManager.saveProject(newProject)
    resetWorkspace()
  }

  const createFolder = (name: string, parentId: string | null) => {
    if (!state.aiAssistant.currentProject) return

    const newFolder: FileNode = {
      id: uuidv4(),
      name,
      type: "folder",
      path: parentId ? `${parentId}/${name}` : name, // This needs improvement
      children: [],
    }

    const newFiles = addNodeToTree(state.aiAssistant.currentProject.files, parentId, newFolder)
    const newProject = { ...state.aiAssistant.currentProject, files: newFiles }
    setCurrentProject(newProject)
  }

  const deleteNode = (nodeId: string) => {
    if (!state.aiAssistant.currentProject) return

    const newFiles = deleteNodeFromTree(state.aiAssistant.currentProject.files, nodeId)
    const newProject = { ...state.aiAssistant.currentProject, files: newFiles }
    setCurrentProject(newProject)
  }

  const renameNode = (nodeId: string, newName: string) => {
    if (!state.aiAssistant.currentProject) return

    // This is a simplified rename, path update logic will be needed
    const newFiles = updateNodeInTree(state.aiAssistant.currentProject.files, nodeId, { name: newName })
    const newProject = { ...state.aiAssistant.currentProject, files: newFiles }
    setCurrentProject(newProject)
  }

  const updateProjects = (updates: Partial<ProjectsListState>) => {
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
        setCurrentProject,
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
        deleteNode,
        renameNode,
        saveProject,
        saveProjectAs,
        resetWorkspace,
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
