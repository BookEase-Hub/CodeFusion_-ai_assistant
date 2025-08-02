import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { ProjectProvider } from "@/contexts/project-context"
import { IntegrationProvider } from "@/contexts/integration-context"
import { AppStateProvider } from "@/contexts/app-state-context"
import { AuthModal } from "@/components/auth-modal"
import AppLayout from "@/components/app-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CodeFusion - Advanced Development Platform",
  description: "A comprehensive development platform with AI assistance, project management, and API integrations.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ProjectProvider>
              <IntegrationProvider>
                <AppStateProvider>
                  <AppLayout>
                    {children}
                  </AppLayout>
                  <AuthModal />
                  <Toaster />
                </AppStateProvider>
              </IntegrationProvider>
            </ProjectProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
