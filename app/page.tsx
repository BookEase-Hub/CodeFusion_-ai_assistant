"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { AppLayout } from "@/components/app-layout"
import { Dashboard } from "@/components/dashboard"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading" || status === "unauthenticated") {
    return null // Will redirect to login
  }

  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  )
}
