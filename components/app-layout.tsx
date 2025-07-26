"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Home,
  MessageSquareCode,
  FolderGit2,
  Plug,
  SettingsIcon,
  Menu,
  X,
  Moon,
  Sun,
  Code,
  Code2,
  LogOut,
  User,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signOut } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const navItems = [
  { name: "Dashboard", path: "/", icon: Home, requiresAuth: false },
  { name: "AI Assist", path: "/ai-assist", icon: MessageSquareCode, requiresAuth: true, feature: "AI Assistant" },
  { name: "Projects", path: "/projects", icon: FolderGit2, requiresAuth: true, feature: "Projects" },
  { name: "API Hub", path: "/api-hub", icon: Plug, requiresAuth: true, feature: "API Hub" },
  { name: "Settings", path: "/settings", icon: SettingsIcon, requiresAuth: true, feature: "Settings" },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    setShowLogoutConfirm(false)
    signOut({ callbackUrl: "/login" })
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="font-montserrat font-bold text-xl hidden sm:inline-block">CodeFusion</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-4">
            {navItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary relative px-3 py-2 rounded-md ${
                    isActive ? "bg-muted text-primary" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="hidden lg:inline-block">{item.name}</span>
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-4">
            {mounted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session?.user?.image || "/placeholder.svg?height=32&width=32"}
                      alt={session?.user?.name || "User"}
                    />
                    <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {session ? (
                  <>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{session?.user?.name}</p>
                        <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/settings")}>
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/billing")}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={() => setShowLogoutConfirm(true)}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/login")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Sign In</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden fixed inset-x-0 top-16 z-40 bg-background border-b"
        >
          <nav className="container py-4">
            <ul className="space-y-4">
              {navItems.map((item) => {
                const isActive = pathname === item.path
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`flex w-full items-center gap-2 p-2 rounded-md transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </button>
                  </li>
                )
              })}
              {session ? (
                <>
                  <li>
                    <button
                      onClick={() => handleNavigation("/profile")}
                      className="flex w-full items-center gap-2 p-2 rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigation("/billing")}
                      className="flex w-full items-center gap-2 p-2 rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <CreditCard className="h-5 w-5" />
                      Billing
                    </button>
                  </li>
                  <li>
                    <button
                      className="flex w-full items-center gap-2 p-2 rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => setShowLogoutConfirm(true)}
                    >
                      <LogOut className="h-5 w-5" />
                      Log out
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <button
                    className="flex w-full items-center gap-2 p-2 rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => router.push("/login")}
                  >
                    <User className="h-5 w-5" />
                    Sign In
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-1 container py-6">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CodeFusion. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access your account and premium features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Log out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AppLayout
