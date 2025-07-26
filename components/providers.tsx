"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { AppStateProvider } from "@/contexts/app-state-context"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider>
        <AppStateProvider>
          {children}
          <Toaster />
        </AppStateProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
