"use client";

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useAppState } from '@/contexts/app-state-context';
import { VSCodeMenu } from './vscode/VSCodeMenu';
import { FileExplorer } from './vscode/FileExplorer';
import { Terminal } from './vscode/Terminal';
import { ProblemsPanel } from './vscode/ProblemsPanel';
import { HistoryPanel } from './vscode/HistoryPanel';
import { FileSystemDB } from '@/lib/db';
import { EditorTab, FileTreeItem } from '@/types';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, FileCode2, Lock, Sparkles, GitBranch, Save } from 'lucide-react';
import { cn } from '@/lib/utils';


import { useFileManager } from '@/hooks/useFileManager';

export const VSCodeEditor = forwardRef<
  {
    insertCode: (code: string, language?: string) => void;
  },
  {}
>((props, ref) => {
  const { state, dispatch, addEditorTab, updateEditorTab, removeEditorTab } = useAppState();
  const { tabs, activeTab, showExplorer, showTerminal, terminalHeight, activePanel } = state;
  const { openFile, saveFile, createFile, createFolder, saveFolderAs, closeFolder } = useFileManager();
  const [autoSave, setAutoSave] = useState(true);
  const [historyState, setHistoryState] = useState<{isOpen: boolean, path: string, history: any[]}>({ isOpen: false, path: '', history: [] });
  const db = useRef(new FileSystemDB());

  const handleShowHistory = async (path: string) => {
    const file = await db.current.getFile(path);
    if (file && file.history) {
        setHistoryState({ isOpen: true, path, history: file.history });
    } else {
        alert("No history found for this file.");
    }
  };

  const handleFileSelect = (path: string) => {
    openFile(path);
  };

  const handleContentChange = (value: string, tabId: string) => {
    updateEditorTab(tabId, { content: value, isDirty: true });
  };

  const handleNewFile = () => {
    const fileName = prompt("Enter new file name:", "untitled.js");
    if (fileName) {
        createFile(fileName);
        // The hook will refresh the file tree, and we can open the file
        // in a new tab if desired. For now, we just create it.
    }
  };

  const handleSave = () => {
    const activeTabData = tabs.find(t => t.id === activeTab);
    if (activeTabData && activeTabData.isDirty) {
      saveFile(activeTabData);
    }
  };

  const handleSaveAsFolder = () => {
    const { currentFolder } = state;
    if (currentFolder) {
        const newName = prompt("Save folder as:", currentFolder.name);
        if (newName) {
            // In a real app, we'd need to handle file content properly.
            // This is a simplified version where we assume the content is in the file tree item.
            saveFolderAs(currentFolder, newName);
        }
    } else {
        alert("No active folder to save.");
    }
  };

  useImperativeHandle(ref, () => ({
    insertCode: (code: string, language = 'javascript') => {
      if (activeTab) {
        const currentTab = tabs.find(tab => tab.id === activeTab);
        if (currentTab) {
          const newContent = currentTab.content + '\n' + code;
          updateEditorTab(activeTab, { content: newContent, isDirty: true });
        }
      } else {
        const newTab: EditorTab = {
          id: `tab-${Date.now()}`,
          name: `snippet.js`,
          path: `snippet-${Date.now()}.js`,
          content: code,
          language,
        };
        addEditorTab(newTab);
      }
    },
  }));

  const getLanguageExtension = (language: string) => {
    switch (language) {
      case 'javascript': return javascript({ jsx: true, typescript: true });
      case 'python': return python();
      case 'html': return html();
      case 'css': return css();
      case 'json': return json();
      default: return javascript();
    }
  };

  const activeTabData = tabs.find(t => t.id === activeTab);

  const handleRestoreHistory = (content: string) => {
    const tabToUpdate = tabs.find(t => t.path === historyState.path);
    if (tabToUpdate) {
        updateEditorTab(tabToUpdate.id, { content, isDirty: true });
    }
    setHistoryState({ isOpen: false, path: '', history: [] });
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300 border rounded-md overflow-hidden">
        <HistoryPanel
            isOpen={historyState.isOpen}
            onClose={() => setHistoryState({ isOpen: false, path: '', history: [] })}
            filePath={historyState.path}
            history={historyState.history}
            onRestore={handleRestoreHistory}
        />
        <VSCodeMenu onNewFile={handleNewFile} onOpenFile={() => {}} onSave={handleSave} onSaveAsFolder={handleSaveAsFolder} onCloseFolder={closeFolder} />
        <div className="flex flex-1 overflow-hidden">
            {showExplorer && (
                <div className="w-64 bg-[#252526] border-r border-[#3c3c3c]">
                    <FileExplorer onFileSelect={handleFileSelect} onShowHistory={handleShowHistory} />
                </div>
            )}
            <div className="flex flex-col flex-1">
                <div className="flex bg-[#252526] border-b border-[#3c3c3c] overflow-x-auto">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            className={cn(
                                "flex items-center px-4 py-2 text-sm cursor-pointer border-r border-[#3c3c3c]",
                                activeTab === tab.id ? "bg-[#1e1e1e] text-white" : "text-gray-400 hover:bg-[#2a2d2e]",
                                tab.isDirty && "italic"
                            )}
                            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id })}
                        >
                            <span title={tab.path}>{tab.name}</span>
                            <Button variant="ghost" size="icon" className="h-5 w-5 ml-2" onClick={(e) => { e.stopPropagation(); removeEditorTab(tab.id); }}>
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="flex-1 overflow-hidden">
                    {activeTabData ? (
                        <CodeMirror
                            value={activeTabData.content}
                            height="100%"
                            theme={vscodeDark}
                            extensions={[getLanguageExtension(activeTabData.language)]}
                            onChange={(value) => handleContentChange(value, activeTabData.id)}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            <FileCode2 className="h-16 w-16 mb-4 opacity-20" />
                            <span>Open a file to start editing</span>
                        </div>
                    )}
                </div>
                 {/* Status Bar */}
                <div className="h-6 bg-[#007acc] text-white flex items-center px-2 text-xs">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center"><GitBranch className="h-3.5 w-3.5 mr-1" /><span>main</span></div>
                        <div className="flex items-center"><Sparkles className="h-3.5 w-3.5 mr-1" /><span>AI: Ready</span></div>
                        {autoSave && <div className="flex items-center"><Save className="h-3.5 w-3.5 mr-1" /><span>Auto Save: ON</span></div>}
                    </div>
                </div>
            </div>
        </div>
        {showTerminal && (
            <div className="border-t border-[#3c3c3c]" style={{ height: `${terminalHeight}px` }}>
                 <Tabs value={activePanel || 'terminal'} onValueChange={(value) => dispatch({ type: 'UPDATE_AIAssistant', payload: { activePanel: value as 'terminal' | 'problems' } })} className="h-full flex flex-col">
                    <TabsList className="bg-[#252526] justify-start rounded-none">
                        <TabsTrigger value="terminal">Terminal</TabsTrigger>
                        <TabsTrigger value="problems">Problems</TabsTrigger>
                    </TabsList>
                    <TabsContent value="terminal" className="flex-1 overflow-hidden"><Terminal /></TabsContent>
                    <TabsContent value="problems" className="flex-1 overflow-hidden"><ProblemsPanel /></TabsContent>
                </Tabs>
            </div>
        )}
    </div>
  );
});

VSCodeEditor.displayName = "VSCodeEditor";
