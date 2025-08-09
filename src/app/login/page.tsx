"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Mail, Lock, Loader2, Code2, User, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState("")

  const { login, signup, resetPassword, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-8 w-8 text-primary animate-pulse" />
            <span className="font-bold text-2xl">CodeFusion</span>
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  // Don't render if authenticated
  if (isAuthenticated) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }

    // Clear success message
    if (success) {
      setSuccess("")
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (activeTab === "signup") {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required"
      } else if (formData.name.trim().length < 2) {
        newErrors.name = "Name must be at least 2 characters"
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setErrors({})
    setSuccess("")

    try {
      if (activeTab === "login") {
        await login(formData.email.trim(), formData.password)
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
          duration: 3000,
        })
      } else {
        await signup(formData.name.trim(), formData.email.trim(), formData.password)
        toast({
          title: "Account created successfully!",
          description: "Welcome to CodeFusion. Your 14-day trial has started.",
          duration: 5000,
        })
      }
    } catch (error: any) {
      const errorMessage = error.message || "Something went wrong. Please try again."
      setErrors({ general: errorMessage })
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      setErrors({ email: "Please enter your email address first" })
      return
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: "Please enter a valid email address" })
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      await resetPassword(formData.email.trim())
      setSuccess("Password reset instructions have been sent to your email.")
      toast({
        title: "Reset email sent",
        description: "Check your inbox for password reset instructions.",
        duration: 5000,
      })
    } catch (error: any) {
      const errorMessage = error.message || "Failed to send reset email. Please try again."
      setErrors({ general: errorMessage })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setErrors({})
    setSuccess("")
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Code2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <span className="font-bold text-2xl text-foreground">CodeFusion</span>
              <p className="text-sm text-muted-foreground">AI-Powered Development</p>
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              {activeTab === "login" ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription>
              {activeTab === "login"
                ? "Sign in to continue to your dashboard"
                : "Start your coding journey with AI assistance"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="font-medium">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="font-medium">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* General Error Alert */}
              {errors.general && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert className="mb-4 border-primary/20 bg-primary/5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-primary">{success}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 h-11"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="px-0 font-normal text-primary hover:text-primary/80"
                        onClick={handleForgotPassword}
                        disabled={isSubmitting}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10 h-11"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        autoComplete="current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="signup-name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10 h-11"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        autoComplete="name"
                      />
                    </div>
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 h-11"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="pl-10 pr-10 h-11"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="signup-confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-10 pr-10 h-11"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              By continuing, you agree to our{" "}
              <Button variant="link" className="p-0 h-auto font-normal text-primary hover:text-primary/80">
                Terms of Service
              </Button>{" "}
              and{" "}
              <Button variant="link" className="p-0 h-auto font-normal text-primary hover:text-primary/80">
                Privacy Policy
              </Button>
            </div>

            {activeTab === "signup" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Start with a 14-day free trial. No credit card required.</span>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
