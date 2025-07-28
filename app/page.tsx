"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Dashboard } from "@/components/dashboard"

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  // Simulate project creation and redirect
  useEffect(() => {
    const timer = setTimeout(() => {
      // router.push('/ai-assist');
    }, 2000); // Redirect after 2 seconds
    return () => clearTimeout(timer);
  }, [router]);

  if (isLoading || !isAuthenticated) {
    return null // Will redirect to login
  }

  return <Dashboard />
}
