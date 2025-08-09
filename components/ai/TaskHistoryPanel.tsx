"use client"

import * as React from "react"
import { useAIStore } from "@/store/ai"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play } from "lucide-react"
import { generateAIResponse } from "@/utils/ai/aiService"

export function TaskHistoryPanel() {
  const { chatMessages, addMessage } = useAIStore()

  const handleRerun = (prompt: string) => {
    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: prompt,
    }
    addMessage(userMessage)

    // @ts-ignore
    const aiResponse = generateAIResponse(prompt, { activeTab: null, tabs: [], fileTree: [] })
    setTimeout(() => {
      addMessage(aiResponse)
    }, 500)
  }

  return (
    <div className="h-full bg-[#1e1e1e] text-gray-300 text-sm p-2 overflow-y-auto">
      <div className="mb-2 font-semibold">TASK HISTORY</div>
      <ScrollArea className="h-full">
        {chatMessages.filter(m => m.role === 'user').map((message, index) => (
          <div key={index} className="flex items-center justify-between p-2 hover:bg-[#2a2d2e] rounded-sm">
            <p className="truncate">{message.content}</p>
            <Button variant="ghost" size="icon" onClick={() => handleRerun(message.content)}>
              <Play className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}
