"use client"

import type React from "react"
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

// User interface for the application
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  role: string
  subscriptionPlan: "free" | "premium"
  subscriptionStatus: "active" | "trial" | "expired"
  trialEndsAt?: string
  createdAt: string
}

interface AuthContextProps {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: { name: string; email: string; bio?: string }) => Promise<void>
  updateAvatar: (avatar: string) => Promise<void>
  updateSubscription: (plan: "free" | "premium") => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionToken = localStorage.getItem("codefusion_token")
        if (sessionToken) {
          // Verify token with the backend
          const res = await fetch(`${API_BASE}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${sessionToken}` },
          })

          if (res.ok) {
            const { user } = await res.json()
            setUser(user)
          } else {
            // Token is invalid or expired
            logout()
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Login failed")
      }

      const { user, token, expiresIn } = await res.json()

      const tokenExpiry = new Date().getTime() + expiresIn * 1000

      localStorage.setItem("codefusion_user", JSON.stringify(user))
      localStorage.setItem("codefusion_token", token)
      localStorage.setItem("codefusion_token_expiry", tokenExpiry.toString())

      setUser(user)
      router.push("/")
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Signup failed")
      }

      const { user, token, expiresIn } = await res.json()
      const tokenExpiry = new Date().getTime() + expiresIn * 1000

      localStorage.setItem("codefusion_user", JSON.stringify(user))
      localStorage.setItem("codefusion_token", token)
      localStorage.setItem("codefusion_token_expiry", tokenExpiry.toString())

      setUser(user)
      router.push("/")
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear all stored data
    localStorage.removeItem("codefusion_user")
    localStorage.removeItem("codefusion_token")
    localStorage.removeItem("codefusion_token_expiry")

    setUser(null)
    router.push("/login")
  }

  const updateProfile = async (data: { name: string; email: string; bio?: string }) => {
    if (!user) return

    try {
      const token = localStorage.getItem("codefusion_token")
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to update profile")
      }

      const updatedUser = await res.json()
      setUser(updatedUser)
      localStorage.setItem("codefusion_user", JSON.stringify(updatedUser))
    } catch (error) {
      throw error
    }
  }

  const updateAvatar = async (avatar: string) => {
    if (!user) return

    try {
      const token = localStorage.getItem("codefusion_token")
      // This would typically be a file upload, but for simplicity, we send the new URL
      const res = await fetch(`${API_BASE}/api/user/avatar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to update avatar")
      }

      const updatedUser = await res.json()
      setUser(updatedUser)
      localStorage.setItem("codefusion_user", JSON.stringify(updatedUser))
    } catch (error) {
      throw error
    }
  }

  const updateSubscription = async (plan: "free" | "premium") => {
    if (!user) return

    try {
      const token = localStorage.getItem("codefusion_token")
      const res = await fetch(`${API_BASE}/api/user/subscription`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to update subscription")
      }

      const updatedUser = await res.json()
      setUser(updatedUser)
      localStorage.setItem("codefusion_user", JSON.stringify(updatedUser))
    } catch (error) {
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to send reset email")
      }
    } catch (error) {
      throw error
    }
  }

  const value: AuthContextProps = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    updateAvatar,
    updateSubscription,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
