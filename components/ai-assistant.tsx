"use client"

import * as React from "react"
import { VSCodeEditor } from "@/components/editor/VSCodeEditor"
import { ChatPanel } from "@/components/ai/ChatPanel"
import { DiagramPanel } from "@/components/diagram/DiagramPanel"
import { useAIStore } from "@/store/ai"
import { EditorTab } from "@/types/ai"

export function AIAssistant() {
  const editorRef = React.useRef<{
    insertCode: (code: string, language?: string) => void
  } | null>(null)

  const { editorTabs, addEditorTab, updateEditorTab } = useAIStore()

  const handleInsertCode = React.useCallback((code: string, language = "javascript") => {
    editorRef.current?.insertCode(code, language)
  }, [])

  const handleUpdateDiagram = (path: string, content: string) => {
    const existingTab = editorTabs.find(t => t.path === path);
    if(existingTab) {
      updateEditorTab(existingTab.id, { content: content, isDirty: true });
    } else {
      const newTab: EditorTab = {
        id: `tab-${Date.now()}`,
        name: path.split("/").pop() || "",
        content: content,
        language: "mermaid",
        path: path,
      }
      addEditorTab(newTab)
    }
  }

  return (
    <div className="grid lg:grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
      <div className="lg:col-span-8 h-full">
        <VSCodeEditor
          ref={editorRef as any}
        />
      </div>

      <div className="lg:col-span-4 flex flex-col h-full">
        <div className="flex-1 overflow-hidden border rounded-md">
          <ChatPanel onInsertCode={handleInsertCode} />
        </div>
        <div className="mt-4 h-[35%]">
          <DiagramPanel onUpdateDiagram={handleUpdateDiagram} />
        </div>
      </div>
    </div>
  )
}

export default AIAssistant
