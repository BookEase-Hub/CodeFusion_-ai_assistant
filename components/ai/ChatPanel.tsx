"use client"

import * as React from "react"
import { useAIStore } from "@/store/ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, FileCode2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { CodeEditor } from "@/components/code-editor"
import { useToast } from "@/components/ui/use-toast"
import { generateAIResponse } from "@/utils/ai/aiService"
import { Message } from "@/types/ai"

export function ChatPanel({ onInsertCode }: { onInsertCode: (code: string, language: string) => void }) {
  const { chatMessages, chatInput, activeEditorTab, editorTabs, addChatMessage, updateAIAssistant } = useAIStore()
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()

  const handleSendMessage = () => {
    if (!chatInput.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput,
    }
    addChatMessage(userMessage)

    setIsLoading(true)
    // @ts-ignore
    const aiResponse = generateAIResponse(chatInput, { activeTab: activeEditorTab, tabs: editorTabs, fileTree: [] })
    setTimeout(() => {
      addChatMessage(aiResponse)
      setIsLoading(false)
    }, 500)

    updateAIAssistant({ chatInput: "" })
  }

  const handleInsertCode = (code: string, language?: string) => {
    onInsertCode(code, language || 'javascript');
    toast({
      title: "Code Inserted",
      description: "The code has been inserted into the active editor.",
    })
  }

  return (
    <div className="flex flex-col h-full bg-[#252526] text-gray-300">
      <div className="p-2 font-semibold border-b border-[#3c3c3c] flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-blue-400" />
        AI Assistant
      </div>
      <ScrollArea className="flex-1 p-2">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "mb-4 p-2 rounded-lg",
              message.role === "user" ? "bg-[#2a2d2e] text-gray-100 ml-4" : "bg-[#1e1e1e] text-gray-300 mr-4"
            )}
          >
            <div className="text-xs text-gray-500 mb-1">
              {message.role === "user" ? "You" : "Assistant"} • {new Date().toLocaleTimeString()}
            </div>
            <div className="whitespace-pre-wrap">{message.content}</div>
            {message.code && (
              <div className="mt-2">
                <CodeEditor
                  value={message.code.value}
                  language={message.code.language || "javascript"}
                  height="200px"
                  readOnly
                />
                <div className="flex gap-2 mt-2">
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        navigator.clipboard.writeText(message.code?.value || "")
                        toast({ title: "Copied to clipboard" })
                    }}
                    >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                    </Button>
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInsertCode(message.code!.value, message.code!.language as string)}
                    >
                    <FileCode2 className="h-3 w-3 mr-1" />
                    Insert Code
                    </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </ScrollArea>
      <div className="p-2 border-t border-[#3c3c3c]">
        <Input
          value={chatInput}
          onChange={(e) => updateAIAssistant({ chatInput: e.target.value })}
          placeholder="Ask AI Assistant..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && chatInput.trim() && !isLoading) {
              handleSendMessage()
            }
          }}
          disabled={isLoading}
        />
      </div>
    </div>
  )
}
