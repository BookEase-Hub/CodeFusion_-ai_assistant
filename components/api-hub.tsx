"use client"

import type React from "react"
import { useState } from "react"
import {
  Plug,
  Plus,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  SettingsIcon,
  Search,
  Zap,
  GitBranch,
  Database,
  Cloud,
  CreditCard,
  Brain,
  Loader2,
  Download,
} from "lucide-react"
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
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useIntegrations } from "@/contexts/integration-context"
import { IntegrationConfigModal } from "@/components/integration-config-modal"
import { GitHubCloneModal } from "@/components/github-clone-modal"
import { toast } from "@/components/ui/use-toast"

const integrationIcons = {
  github: GitBranch,
  openai: Brain,
  mongodb: Database,
  vercel: Cloud,
  stripe: CreditCard,
  aws: Cloud,
  supabase: Database,
  huggingface: Brain,
}

const integrationCategories = {
  github: "version-control",
  openai: "ai",
  mongodb: "database",
  vercel: "deployment",
  stripe: "payment",
  aws: "cloud",
  supabase: "database",
  huggingface: "ai",
}

export function APIHub() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showAddIntegrationDialog, setShowAddIntegrationDialog] = useState(false)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  const [githubCloneModalOpen, setGithubCloneModalOpen] = useState(false)
  const { requireAuth } = useRequireAuth()

  const { integrations, connectIntegration, disconnectIntegration, syncIntegration, getIntegration } = useIntegrations()

  const integrationsList = Object.values(integrations).map((integration) => ({
    ...integration,
    icon: integrationIcons[integration.id as keyof typeof integrationIcons] || Plug,
    category: integrationCategories[integration.id as keyof typeof integrationCategories] || "other",
  }))

  const filteredIntegrations = integrationsList.filter((integration) => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "connected") return matchesSearch && integration.status === "connected"
    if (activeTab === "disconnected") return matchesSearch && integration.status === "disconnected"
    if (activeTab === "error") return matchesSearch && integration.status === "error"

    return matchesSearch && integration.category === activeTab
  })

  const handleAddIntegration = () => {
    if (requireAuth("adding new integrations")) {
      setShowAddIntegrationDialog(true)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (requireAuth("searching integrations")) {
      setSearchQuery(e.target.value)
    }
  }

  const handleTabChange = (value: string) => {
    if (requireAuth(`viewing ${value} integrations`)) {
      setActiveTab(value)
    }
  }

  const handleConnect = async (integrationId: string) => {
    if (!requireAuth(`connecting ${integrations[integrationId]?.name}`)) return

    setSelectedIntegration(integrationId)
    setConfigModalOpen(true)
  }

  const handleDisconnect = async (integrationId: string) => {
    if (!requireAuth(`disconnecting ${integrations[integrationId]?.name}`)) return

    await disconnectIntegration(integrationId)
  }

  const handleSync = async (integrationId: string) => {
    if (!requireAuth(`syncing ${integrations[integrationId]?.name}`)) return

    await syncIntegration(integrationId)
  }

  const handleConfigure = (integrationId: string) => {
    if (!requireAuth(`configuring ${integrations[integrationId]?.name}`)) return

    setSelectedIntegration(integrationId)
    setConfigModalOpen(true)
  }

  const handleGitHubClone = () => {
    if (!requireAuth("cloning GitHub repositories")) return

    const githubIntegration = getIntegration("github")
    if (githubIntegration?.status !== "connected") {
      toast({
        title: "GitHub Not Connected",
        description: "Please connect your GitHub account first.",
        variant: "destructive",
      })
      return
    }

    setGithubCloneModalOpen(true)
  }

  const handleCloneComplete = (project: any, action: "editor" | "chat") => {
    toast({
      title: "Repository Cloned Successfully",
      description: `${project.name} is now available in your ${action === "editor" ? "Code Editor" : "AI Chat"}.`,
    })

    // Here you would typically navigate to the appropriate tab
    // For now, we'll just show a success message
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "connecting":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "Connected"
      case "connecting":
        return "Connecting..."
      case "error":
        return "Error"
      default:
        return "Disconnected"
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">API Hub</h1>
        <p className="text-muted-foreground">Manage your API integrations and connections</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search integrations..." className="pl-10" value={searchQuery} onChange={handleSearch} />
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddIntegration}>
          <Plus className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="disconnected">Disconnected</TabsTrigger>
          <TabsTrigger value="error">Error</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="cloud">Cloud</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="version-control">Version Control</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-6">
          {filteredIntegrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Plug className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No integrations found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search or add a new integration.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredIntegrations.map((integration) => {
                const IconComponent = integration.icon
                return (
                  <Card key={integration.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {integration.name}
                            <Badge variant="outline" className={getStatusColor(integration.status)}>
                              {integration.status === "connecting" && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                              {getStatusText(integration.status)}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {integration.id === "github" && "Connect to your GitHub repositories"}
                            {integration.id === "openai" && "AI-powered code generation and assistance"}
                            {integration.id === "mongodb" && "NoSQL database integration"}
                            {integration.id === "vercel" && "Deployment and hosting platform"}
                            {integration.id === "stripe" && "Payment processing integration"}
                            {integration.id === "aws" && "Cloud infrastructure and deployment"}
                            {integration.id === "supabase" && "Open source Firebase alternative"}
                            {integration.id === "huggingface" && "AI models and datasets"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last sync: {integration.lastSync}</span>
                        <Badge variant="outline">{integration.category}</Badge>
                      </div>
                      {integration.error && (
                        <div className="mt-2 flex items-center gap-1 text-sm text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          {integration.error}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      {integration.status === "connected" ? (
                        <>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 bg-transparent"
                              onClick={() => handleSync(integration.id)}
                              disabled={integration.status === "connecting"}
                            >
                              {integration.status === "connecting" ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3 w-3" />
                              )}
                              Sync
                            </Button>

                            {integration.id === "github" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 bg-transparent"
                                onClick={handleGitHubClone}
                              >
                                <Download className="h-3 w-3" />
                                Clone & Push
                              </Button>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 bg-transparent"
                              onClick={() => handleConfigure(integration.id)}
                            >
                              <SettingsIcon className="h-3 w-3" />
                              Configure
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-destructive hover:text-destructive bg-transparent"
                              onClick={() => handleDisconnect(integration.id)}
                            >
                              <X className="h-3 w-3" />
                              Disconnect
                            </Button>
                          </div>
                        </>
                      ) : integration.status === "error" ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-destructive hover:text-destructive bg-transparent"
                          >
                            <AlertCircle className="h-3 w-3" />
                            View Error
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 bg-transparent"
                            onClick={() => handleConnect(integration.id)}
                          >
                            <RefreshCw className="h-3 w-3" />
                            Retry
                          </Button>
                        </>
                      ) : (
                        <Button
                          className="w-full gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => handleConnect(integration.id)}
                          disabled={integration.status === "connecting"}
                        >
                          {integration.status === "connecting" ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Plug className="h-3 w-3" />
                          )}
                          Connect
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Integration Insights</CardTitle>
          <CardDescription>Performance and usage statistics for your connected APIs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {integrationsList
              .filter((api) => api.status === "connected")
              .slice(0, 3)
              .map((api, i) => {
                const IconComponent = api.icon
                return (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-medium">{api.name}</h3>
                        <p className="text-sm text-muted-foreground">Last sync: {api.lastSync}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Healthy
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      >
                        <Zap className="mr-1 h-3 w-3" />
                        {Math.floor(Math.random() * 100) + 1} API calls today
                      </Badge>
                      <Button variant="outline" size="sm" className="h-6 gap-1 bg-transparent">
                        <ExternalLink className="h-3 w-3" />
                        Dashboard
                      </Button>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full bg-transparent">
            View All Analytics
          </Button>
        </CardFooter>
      </Card>

      {/* Add Integration Dialog */}
      <Dialog open={showAddIntegrationDialog} onOpenChange={setShowAddIntegrationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Integration</DialogTitle>
            <DialogDescription>Connect a new API or service to enhance your development workflow.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="integration-type">Integration Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select integration type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai">AI Services</SelectItem>
                  <SelectItem value="database">Databases</SelectItem>
                  <SelectItem value="cloud">Cloud Services</SelectItem>
                  <SelectItem value="version-control">Version Control</SelectItem>
                  <SelectItem value="deployment">Deployment</SelectItem>
                  <SelectItem value="payment">Payment Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input id="api-key" type="password" placeholder="Enter your API key" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="auto-sync" />
              <Label htmlFor="auto-sync">Enable automatic synchronization</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddIntegrationDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Connect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Integration Configuration Modal */}
      <IntegrationConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        integration={selectedIntegration ? getIntegration(selectedIntegration) : null}
      />

      {/* GitHub Clone Modal */}
      <GitHubCloneModal
        open={githubCloneModalOpen}
        onOpenChange={setGithubCloneModalOpen}
        onCloneComplete={handleCloneComplete}
      />
    </div>
  )
}
