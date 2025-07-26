"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plug, Plus, Check, X, AlertCircle, RefreshCw, ExternalLink, SettingsIcon, Search, Zap, Github } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { useSession, signIn } from "next-auth/react"
import { Octokit } from "@octokit/rest"
import { saveAs } from "file-saver"
import { useRouter } from "next/navigation"

export function APIHub() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showAddIntegrationDialog, setShowAddIntegrationDialog] = useState(false)
  const [newIntegration, setNewIntegration] = useState({
    type: "",
    apiKey: "",
    autoSync: false,
  })
  const { toast } = useToast()
  const [repos, setRepos] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchRepos = async () => {
      if (session?.accessToken) {
        const octokit = new Octokit({ auth: session.accessToken })
        const { data } = await octokit.repos.listForAuthenticatedUser()
        setRepos(data)
      }
    }
    fetchRepos()
  }, [session])

  const handleAddIntegration = () => {
    setShowAddIntegrationDialog(true)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleIntegrationAction = (action: string, integration: string) => {
    toast({
      title: "Action Completed",
      description: `Successfully ${action} ${integration} integration.`,
      duration: 3000,
    })
  }

  const handleCreateIntegration = () => {
    if (!newIntegration.type || !newIntegration.apiKey) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    toast({
      title: "Integration Added",
      description: `Successfully added ${newIntegration.type} integration.`,
      duration: 3000,
    })

    setShowAddIntegrationDialog(false)
    setNewIntegration({ type: "", apiKey: "", autoSync: false })
  }

  const handleCloneRepo = async (repo: any) => {
    if (session?.accessToken) {
      const octokit = new Octokit({ auth: session.accessToken })
      const { data } = await octokit.repos.get({
        owner: repo.owner.login,
        repo: repo.name,
      })
      const cloneUrl = data.clone_url
      const response = await fetch(cloneUrl)
      const blob = await response.blob()
      saveAs(blob, `${repo.name}.zip`)
      router.push("/ai-assist")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">API Hub</h1>
        <p className="text-muted-foreground">Manage your API integrations and connections</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>GitHub Integration</CardTitle>
          <CardDescription>Connect to your GitHub account to manage your repositories.</CardDescription>
        </CardHeader>
        <CardContent>
          {session ? (
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  <p>Connected as {session.user?.name}</p>
                </div>
                <Badge variant="secondary">Connected</Badge>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">Your Repositories</h3>
                <div className="mt-2 space-y-2">
                  {repos.map((repo) => (
                    <div key={repo.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <p className="font-medium">{repo.name}</p>
                        <p className="text-sm text-muted-foreground">{repo.description}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleCloneRepo(repo)}>
                        Clone
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Button onClick={() => signIn("github")}>
              <Github className="mr-2 h-4 w-4" />
              Connect to GitHub
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default APIHub
