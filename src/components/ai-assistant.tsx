"use client";

import * as React from 'react';
import { useAppState } from '@/contexts/app-state-context';
import { VSCodeEditor } from './vscode-editor';
import { ChatPanel } from './ai/ChatPanel';
import { DiagramPanel } from './diagram/DiagramPanel';
import { EditorTab } from '@/types';

/**
 * Top-level AI Assistant screen that combines:
 *  – Code editor (with VS-Code-like UX)
 *  – Chat panel (AI prompt / response)
 *  – Architecture diagrams
 */
export function AIAssistant() {
  const editorRef = React.useRef<{
    insertCode: (code: string, language?: string) => void;
  } | null>(null);

  const { state, addEditorTab, updateEditorTab } = useAppState();

  // helper passed to ChatPanel so the AI can drop code into editor
  const handleInsertCode = React.useCallback((code: string, language = "javascript") => {
    editorRef.current?.insertCode(code, language);
  }, []);

  const handleUpdateDiagram = (path: string, content: string) => {
    const existingTab = state.tabs.find(t => t.path === path);
    if(existingTab) {
      updateEditorTab(existingTab.id, { content: content, isDirty: true });
    } else {
      const newTab: EditorTab = {
        id: `tab-${Date.now()}`,
        name: path.split("/").pop() || "",
        content: content,
        language: "mermaid",
        path: path,
      };
      addEditorTab(newTab);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-white">
        <div className="flex-1 min-h-0">
            <VSCodeEditor ref={editorRef as any} />
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 min-h-0">
            <div className="overflow-hidden border rounded-md bg-[#252526]">
                <ChatPanel onInsertCode={handleInsertCode} />
            </div>
            <div className="overflow-hidden border rounded-md bg-[#252526]">
                <DiagramPanel onUpdateDiagram={handleUpdateDiagram} />
            </div>
        </div>
    </div>
  );
}

// default export for backwards compatibility
export default AIAssistant;
