"use client"

import { useAppState as useMainAppState } from "@/contexts/app-state-context"

// This is based on the user's prompt and ProjectExplorer component.
// I've added `path` and `content` to fulfill requirements.
export interface FileNode {
  id: string
  name: string
  type: "file" | "folder"
  path: string
  content?: string // Content for files
  children?: FileNode[] // Children for folders
  isDirty?: boolean
}

export interface Project {
  name: string
  files: FileNode[]
}

// This is a facade hook for the ProjectExplorer to use.
// It uses the main app state context but exposes only what's needed.
// This allows us to use the new ProjectExplorer component without modifying its code.
export const useAppState = () => {
  const {
    state,
    setCurrentProject,
    createFile,
    createFolder,
    deleteNode,
    renameNode,
    addEditorTab,
  } = useMainAppState()

  const currentProject = state.aiAssistant.currentProject

  return {
    currentProject,
    setCurrentProject,
    createFile,
    createFolder,
    deleteNode,
    renameNode,
    addEditorTab,
    editorTabs: state.aiAssistant.editorTabs,
    activeEditorTab: state.aiAssistant.activeEditorTab,
  }
}
