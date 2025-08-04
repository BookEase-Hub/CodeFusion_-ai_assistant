"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface FileTreeItem {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileTreeItem[];
}

interface EditorContextType {
  activeFile: string | null;
  setActiveFile: (file: string | null) => void;
  projectStructure: FileTreeItem[];
  setProjectStructure: (structure: FileTreeItem[]) => void;
  terminalHistory: string[];
  updateTerminalHistory: (history: string[]) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context;
};

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [projectStructure, setProjectStructure] = useState<FileTreeItem[]>([]);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);

  const updateTerminalHistory = (history: string[]) => {
    setTerminalHistory(history);
  };

  return (
    <EditorContext.Provider
      value={{
        activeFile,
        setActiveFile,
        projectStructure,
        setProjectStructure,
        terminalHistory,
        updateTerminalHistory,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
