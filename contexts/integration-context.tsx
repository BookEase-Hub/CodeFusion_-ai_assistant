"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"

export interface Integration {
  id: string
  name: string
  status: "connected" | "disconnected" | "connecting" | "error"
  lastSync?: string
  error?: string
  config?: Record<string, any>
  data?: any
}

interface IntegrationContextType {
  integrations: Record<string, Integration>
  updateIntegration: (id: string, updates: Partial<Integration>) => void
  connectIntegration: (id: string, config: Record<string, any>) => Promise<void>
  disconnectIntegration: (id: string) => Promise<void>
  syncIntegration: (id: string) => Promise<void>
  getIntegration: (id: string) => Integration | undefined
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined)

const defaultIntegrations: Record<string, Integration> = {
  github: {
    id: "github",
    name: "GitHub",
    status: "connected",
    lastSync: "10 minutes ago",
    config: { token: "stored_securely" },
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    status: "connected",
    lastSync: "1 hour ago",
    config: { apiKey: "stored_securely" },
  },
  mongodb: {
    id: "mongodb",
    name: "MongoDB",
    status: "connected",
    lastSync: "2 days ago",
    config: { connectionString: "stored_securely" },
  },
  vercel: {
    id: "vercel",
    name: "Vercel",
    status: "connected",
    lastSync: "5 hours ago",
    config: { token: "stored_securely" },
  },
  stripe: {
    id: "stripe",
    name: "Stripe",
    status: "error",
    lastSync: "Failed 3 hours ago",
    error: "Invalid API key",
  },
  aws: {
    id: "aws",
    name: "AWS",
    status: "disconnected",
    lastSync: "Never",
  },
  supabase: {
    id: "supabase",
    name: "Supabase",
    status: "disconnected",
    lastSync: "Never",
  },
  huggingface: {
    id: "huggingface",
    name: "Hugging Face",
    status: "disconnected",
    lastSync: "Never",
  },
}

export function IntegrationProvider({ children }: { children: React.ReactNode }) {
  const [integrations, setIntegrations] = useState<Record<string, Integration>>(defaultIntegrations)

  const updateIntegration = useCallback((id: string, updates: Partial<Integration>) => {
    setIntegrations((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }))
  }, [])

  const connectIntegration = useCallback(
    async (id: string, config: Record<string, any>) => {
      updateIntegration(id, { status: "connecting" })

      try {
        // Simulate connection process
        await new Promise((resolve) => setTimeout(resolve, 2000))

        updateIntegration(id, {
          status: "connected",
          config,
          lastSync: "Just now",
          error: undefined,
        })

        toast({
          title: "Integration Connected",
          description: `${integrations[id]?.name} has been successfully connected.`,
        })
      } catch (error) {
        updateIntegration(id, {
          status: "error",
          error: error instanceof Error ? error.message : "Connection failed",
        })

        toast({
          title: "Connection Failed",
          description: `Failed to connect ${integrations[id]?.name}. Please check your credentials.`,
          variant: "destructive",
        })
      }
    },
    [integrations, updateIntegration],
  )

  const disconnectIntegration = useCallback(
    async (id: string) => {
      updateIntegration(id, {
        status: "disconnected",
        config: undefined,
        data: undefined,
        lastSync: "Never",
        error: undefined,
      })

      toast({
        title: "Integration Disconnected",
        description: `${integrations[id]?.name} has been disconnected.`,
      })
    },
    [integrations, updateIntegration],
  )

  const syncIntegration = useCallback(
    async (id: string) => {
      if (integrations[id]?.status !== "connected") return

      updateIntegration(id, { status: "connecting" })

      try {
        // Simulate sync process
        await new Promise((resolve) => setTimeout(resolve, 1500))

        updateIntegration(id, {
          status: "connected",
          lastSync: "Just now",
        })

        toast({
          title: "Sync Complete",
          description: `${integrations[id]?.name} data has been synchronized.`,
        })
      } catch (error) {
        updateIntegration(id, {
          status: "error",
          error: error instanceof Error ? error.message : "Sync failed",
        })

        toast({
          title: "Sync Failed",
          description: `Failed to sync ${integrations[id]?.name} data.`,
          variant: "destructive",
        })
      }
    },
    [integrations, updateIntegration],
  )

  const getIntegration = useCallback(
    (id: string) => {
      return integrations[id]
    },
    [integrations],
  )

  return (
    <IntegrationContext.Provider
      value={{
        integrations,
        updateIntegration,
        connectIntegration,
        disconnectIntegration,
        syncIntegration,
        getIntegration,
      }}
    >
      {children}
    </IntegrationContext.Provider>
  )
}

export function useIntegrations() {
  const context = useContext(IntegrationContext)
  if (!context) {
    throw new Error("useIntegrations must be used within IntegrationProvider")
  }
  return context
}
