"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"

export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authReason } = useAuth()

  return (
    <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Authentication Required</DialogTitle>
          <DialogDescription>{authReason}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Please log in to continue.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
