"use client"

import { AIAssistant } from "@/components/ai-assistant"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <AIAssistant />
      </div>
    </div>
  )
}
