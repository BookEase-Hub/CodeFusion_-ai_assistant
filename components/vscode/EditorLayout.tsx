"use client";

import React, { useRef } from "react";
import { useAppState, Project, FileNode } from "@/contexts/app-state-context";
import { MenuBar } from "./MenuBar";
import { ActivityBar } from "./ActivityBar";
import { Sidebar } from "./Sidebar";
import { EditorToolbar } from "./EditorToolbar";
import { ProjectExplorer } from "./ProjectExplorer";
import { Panel } from "./Panel";
import { StatusBar } from "./StatusBar";
import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { EditorView } from "@codemirror/view";
import { undo, redo } from "@codemirror/commands";

function findNode(nodes: FileNode[], nodeId: string): FileNode | null {
    for (const node of nodes) {
        if (node.id === nodeId) return node;
        if (node.children) {
            const found = findNode(node.children, nodeId);
            if (found) return found;
        }
    }
    return null;
}

export function EditorLayout() {
  const { state, loadProject, openEditorTab, closeEditorTab, updateNode, saveProjectAs } = useAppState();
  const {
    currentProject,
    editorTabs,
    activeEditorTab,
    showExplorer,
    showTerminal,
  } = state.aiAssistant;

  const folderInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<{ view?: EditorView }>(null);

  const handleOpenFolder = () => {
    folderInputRef.current?.click();
  };

  const handleFolderSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const rootName = files[0].webkitRelativePath.split('/')[0];
    const fileNodes: FileNode[] = [];
    const pathMap: { [key: string]: FileNode } = {};

    for (const file of Array.from(files)) {
        const path = file.webkitRelativePath;
        const parts = path.split('/');

        let currentPath = '';
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const oldPath = currentPath;
            currentPath += (currentPath ? '/' : '') + part;

            if (!pathMap[currentPath]) {
                const isFolder = i < parts.length - 1;
                const node: FileNode = {
                    id: currentPath,
                    name: part,
                    path: currentPath,
                    type: isFolder ? 'folder' : 'file',
                    children: isFolder ? [] : undefined,
                };

                if (!isFolder) {
                    node.content = await file.text();
                }

                pathMap[currentPath] = node;

                if (oldPath) {
                    pathMap[oldPath].children?.push(node);
                } else {
                    fileNodes.push(node);
                }
            }
        }
    }

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: rootName,
      files: fileNodes,
    };

    loadProject(newProject);
  };

  const activeFileNode = activeEditorTab && currentProject ? findNode(currentProject.files, activeEditorTab) : null;

  const handleSave = async () => {
      if (!activeFileNode) return;
      // In a real app, this would save to a backend/filesystem.
      // For now, we just clear the 'isDirty' flag.
      updateNode(activeFileNode.id, { isDirty: false });
      console.log("Saving file:", activeFileNode.name);
  }

  const handleSaveAs = async (newProjectName: string) => {
      if (!currentProject) return;
      saveProjectAs(newProjectName);
  }

  const handleCodeChange = (newContent: string) => {
      if (activeFileNode && activeFileNode.content !== newContent) {
          updateNode(activeFileNode.id, { content: newContent, isDirty: true });
      }
  }

  // Editor command handlers
  const handleUndo = () => editorRef.current?.view && undo(editorRef.current.view);
  const handleRedo = () => editorRef.current?.view && redo(editorRef.current.view);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#1e1e1e] border rounded-md overflow-hidden text-gray-300">
      <input
        type="file"
        ref={folderInputRef}
        webkitdirectory=""
        style={{ display: "none" }}
        onChange={handleFolderSelect}
      />

      <MenuBar onOpenFolder={handleOpenFolder} />

      <EditorToolbar
        projectName={currentProject?.name || "No Project"}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={!!activeFileNode}
        canRedo={!!activeFileNode}
      />

      <div className="flex flex-1 overflow-hidden">
        <ActivityBar />
        {showExplorer && (
          <Sidebar>
            <ProjectExplorer />
          </Sidebar>
        )}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Tabs */}
          <div className="flex items-center border-b border-[#252526] bg-[#252526] overflow-x-auto">
            {editorTabs.map((tab) => {
                const node = findNode(currentProject!.files, tab.id)!;
                return (
                    <button
                        key={tab.id}
                        className={`flex items-center flex-shrink-0 h-9 px-3 border-r border-[#252526] ${
                        activeEditorTab === tab.id ? "bg-[#1e1e1e]" : "bg-[#2d2d2d]"
                        }`}
                        onClick={() => openEditorTab(node)}
                    >
                        <span className="mr-2">{tab.name}{node.isDirty ? ' •' : ''}</span>
                        <span
                        className="text-gray-500 hover:text-white"
                        onClick={(e) => {
                            e.stopPropagation();
                            closeEditorTab(tab.id);
                        }}
                        >
                        &times;
                        </span>
                    </button>
                )
            })}
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden bg-[#1e1e1e]">
             {activeFileNode ? (
                <CodeEditor
                    ref={editorRef}
                    value={activeFileNode.content || ""}
                    language={activeFileNode.name.split('.').pop() || 'javascript'}
                    onChange={handleCodeChange}
                />
             ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <p className="mb-4">No file is open.</p>
                    <Button variant="outline" onClick={handleOpenFolder}>
                        Open Folder
                    </Button>
                </div>
             )}
          </div>

          {showTerminal && (
            <Panel>
              <div>Terminal / Problems</div>
            </Panel>
          )}
        </div>
      </div>
      <StatusBar />
    </div>
  );
}
