"use client"

import type React from "react"
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
    // Check for existing session on app load
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem("codefusion_user")
        const sessionToken = localStorage.getItem("codefusion_token")

        if (savedUser && sessionToken) {
          const userData = JSON.parse(savedUser)
          // Verify token is still valid (simple check)
          const tokenExpiry = localStorage.getItem("codefusion_token_expiry")
          if (tokenExpiry && new Date().getTime() < Number.parseInt(tokenExpiry)) {
            setUser(userData)
          } else {
            // Token expired, clear storage
            localStorage.removeItem("codefusion_user")
            localStorage.removeItem("codefusion_token")
            localStorage.removeItem("codefusion_token_expiry")
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
        // Clear corrupted data
        localStorage.removeItem("codefusion_user")
        localStorage.removeItem("codefusion_token")
        localStorage.removeItem("codefusion_token_expiry")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call with realistic delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Simple validation for demo
      if (!email || !password) {
        throw new Error("Email and password are required")
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      // Create mock user based on email
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        email: email,
        avatar: "",
        bio: "Welcome to CodeFusion!",
        role: "developer",
        subscriptionPlan: "free",
        subscriptionStatus: "trial",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      }

      // Generate session token
      const sessionToken = Math.random().toString(36).substr(2, 15)
      const tokenExpiry = new Date().getTime() + 7 * 24 * 60 * 60 * 1000 // 7 days

      // Store user data and session
      localStorage.setItem("codefusion_user", JSON.stringify(mockUser))
      localStorage.setItem("codefusion_token", sessionToken)
      localStorage.setItem("codefusion_token_expiry", tokenExpiry.toString())

      setUser(mockUser)

      // Redirect to dashboard
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
      // Simulate API call with realistic delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Validation
      if (!name || !email || !password) {
        throw new Error("All fields are required")
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error("Please enter a valid email address")
      }

      // Create new user
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        avatar: "",
        bio: "",
        role: "developer",
        subscriptionPlan: "free",
        subscriptionStatus: "trial",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      }

      // Generate session token
      const sessionToken = Math.random().toString(36).substr(2, 15)
      const tokenExpiry = new Date().getTime() + 7 * 24 * 60 * 60 * 1000 // 7 days

      // Store user data and session
      localStorage.setItem("codefusion_user", JSON.stringify(newUser))
      localStorage.setItem("codefusion_token", sessionToken)
      localStorage.setItem("codefusion_token_expiry", tokenExpiry.toString())

      setUser(newUser)

      // Redirect to dashboard
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem("codefusion_user", JSON.stringify(updatedUser))
    } catch (error) {
      throw new Error("Failed to update profile")
    }
  }

  const updateAvatar = async (avatar: string) => {
    if (!user) return

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const updatedUser = { ...user, avatar }
      setUser(updatedUser)
      localStorage.setItem("codefusion_user", JSON.stringify(updatedUser))
    } catch (error) {
      throw new Error("Failed to update avatar")
    }
  }

  const updateSubscription = async (plan: "free" | "premium") => {
    if (!user) return

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedUser = {
        ...user,
        subscriptionPlan: plan,
        subscriptionStatus: plan === "premium" ? "active" : "trial",
      }
      setUser(updatedUser)
      localStorage.setItem("codefusion_user", JSON.stringify(updatedUser))
    } catch (error) {
      throw new Error("Failed to update subscription")
    }
  }

  const resetPassword = async (email: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error("Please enter a valid email address")
      }

      // In a real app, this would send a reset email
      console.log("Password reset email sent to:", email)
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
