"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { AppLayout } from "@/components/app-layout"
import { Dashboard } from "@/components/dashboard"

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !isAuthenticated) {
    return null // Will redirect to login
  }

  return null // Or a loading spinner, while redirecting to /dashboard
}
