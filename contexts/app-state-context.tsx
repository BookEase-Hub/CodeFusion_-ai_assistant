"use client"

import * as React from "react"
import { useState, useCallback } from "react"

// Types
export interface EditorTab {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  isDirty?: boolean;
}

export interface FileNode {
  id:string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  isOpen?: boolean;
  language?: string;
  content?: string;
  isDirty?: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  files: FileNode[];
  lastModified: string;
}

export interface Workspace {
  id: string;
  name: string;
  project: Project;
  createdAt: string;
  syncStatus: "local" | "cloud" | "synced";
}

// App State Context
interface AppState {
  tabs: EditorTab[];
  activeTab: string | null;
  currentProject: Project | null;
  currentWorkspaceId: string | null;
  workspaces: Workspace[];
  activePanel: "terminal" | "problems" | null;
  autoSave: boolean;
  zoomLevel: number;
  isFindReplaceOpen: boolean;
  findQuery: string;
  replaceQuery: string;
  isCommandPaletteOpen: boolean;
  commandQuery: string;
  isSidebarOpen: boolean;
  sidebarWidth: number;
}

interface AppStateContextType {
  state: AppState;
  setTabs: React.Dispatch<React.SetStateAction<EditorTab[]>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string | null>>;
  updateProject: React.Dispatch<React.SetStateAction<Project | null>>;
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
  setCurrentWorkspaceId: React.Dispatch<React.SetStateAction<string | null>>;
  setActivePanel: React.Dispatch<React.SetStateAction<"terminal" | "problems" | null>>;
  setAutoSave: React.Dispatch<React.SetStateAction<boolean>>;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  setFindReplaceOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFindQuery: React.Dispatch<React.SetStateAction<string>>;
  setReplaceQuery: React.Dispatch<React.SetStateAction<string>>;
  setCommandPaletteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCommandQuery: React.Dispatch<React.SetStateAction<string>>;
  toggleSidebar: () => void;
  setSidebarWidth: React.Dispatch<React.SetStateAction<number>>;
}

const AppStateContext = React.createContext<AppStateContextType | undefined>(undefined);

export function useAppState() {
  const context = React.useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activePanel, setActivePanel] = useState<"terminal" | "problems" | null>(null);
  const [autoSave, setAutoSave] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFindReplaceOpen, setFindReplaceOpen] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(250);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const value: AppStateContextType = {
    state: {
      tabs,
      activeTab,
      currentProject,
      currentWorkspaceId,
      workspaces,
      activePanel,
      autoSave,
      zoomLevel,
      isFindReplaceOpen,
      findQuery,
      replaceQuery,
      isCommandPaletteOpen,
      commandQuery,
      isSidebarOpen,
      sidebarWidth,
    },
    setTabs,
    setActiveTab,
    updateProject: setCurrentProject,
    setWorkspaces,
    setCurrentWorkspaceId,
    setActivePanel,
    setAutoSave,
    setZoomLevel,
    setFindReplaceOpen,
    setFindQuery,
    setReplaceQuery,
    setCommandPaletteOpen,
    setCommandQuery,
    toggleSidebar,
    setSidebarWidth,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
