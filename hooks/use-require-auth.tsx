"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export function useRequireAuth() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const requireAuth = (feature?: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: feature ? `Please sign in to access ${feature}.` : "Please sign in to continue.",
        variant: "destructive",
        duration: 4000,
      })
      router.push("/login")
      return false
    }
    return true
  }

  return { requireAuth }
}
