import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import AppLayout from "@/components/app-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CodeFusion - AI-Powered Development Platform",
  description: "Your intelligent coding companion for seamless development",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  )
}
