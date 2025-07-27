"use client"

import type React from "react"
import { useState } from "react"
import { Plug, Plus, Check, X, AlertCircle, RefreshCw, ExternalLink, SettingsIcon, Search, Zap } from "lucide-react"
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
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"

const apiIntegrations = [
  {
    id: "1",
    name: "GitHub",
    description: "Connect to your GitHub repositories",
    status: "connected",
    icon: "/placeholder.svg?height=40&width=40",
    lastSync: "10 minutes ago",
    category: "version-control",
    apiCalls: 156,
  },
  {
    id: "2",
    name: "OpenAI",
    description: "AI-powered code generation and assistance",
    status: "connected",
    icon: "/placeholder.svg?height=40&width=40",
    lastSync: "1 hour ago",
    category: "ai",
    apiCalls: 89,
  },
  {
    id: "3",
    name: "AWS",
    description: "Cloud infrastructure and deployment",
    status: "disconnected",
    icon: "/placeholder.svg?height=40&width=40",
    lastSync: "Never",
    category: "cloud",
    apiCalls: 0,
  },
  {
    id: "4",
    name: "MongoDB",
    description: "NoSQL database integration",
    status: "connected",
    icon: "/placeholder.svg?height=40&width=40",
    lastSync: "2 days ago",
    category: "database",
    apiCalls: 234,
  },
  {
    id: "5",
    name: "Stripe",
    description: "Payment processing integration",
    status: "error",
    icon: "/placeholder.svg?height=40&width=40",
    lastSync: "Failed 3 hours ago",
    category: "payment",
    apiCalls: 45,
  },
  {
    id: "6",
    name: "Vercel",
    description: "Deployment and hosting platform",
    status: "connected",
    icon: "/placeholder.svg?height=40&width=40",
    lastSync: "5 hours ago",
    category: "deployment",
    apiCalls: 67,
  },
  {
    id: "7",
    name: "Supabase",
    description: "Open source Firebase alternative",
    status: "disconnected",
    icon: "/placeholder.svg?height=40&width=40",
    lastSync: "Never",
    category: "database",
    apiCalls: 0,
  },
  {
    id: "8",
    name: "Hugging Face",
    description: "AI models and datasets",
    status: "disconnected",
    icon: "/placeholder.svg?height=40&width=40",
    lastSync: "Never",
    category: "ai",
    apiCalls: 0,
  },
]

export function APIHub() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showAddIntegrationDialog, setShowAddIntegrationDialog] = useState(false)
  const [newIntegration, setNewIntegration] = useState({
    type: "",
    apiKey: "",
    autoSync: false,
  })
  const { requireAuth } = useRequireAuth()
  const { toast } = useToast()

  const filteredIntegrations = apiIntegrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleIntegrationAction = (action: string, integration: string) => {
    if (requireAuth(`${action} the ${integration} integration`)) {
      toast({
        title: "Action Completed",
        description: `Successfully ${action} ${integration} integration.`,
        duration: 3000,
      })
    }
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

  const connectedIntegrations = apiIntegrations.filter((api) => api.status === "connected")
  const totalApiCalls = connectedIntegrations.reduce((sum, api) => sum + api.apiCalls, 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">API Hub</h1>
        <p className="text-muted-foreground">Manage your API integrations and connections</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected APIs</CardTitle>
            <Plug className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedIntegrations.length}</div>
            <p className="text-xs text-muted-foreground">
              {apiIntegrations.filter((api) => api.status === "error").length} with errors
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls Today</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApiCalls}</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Check className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <RefreshCw className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245ms</div>
            <p className="text-xs text-muted-foreground">Average response</p>
          </CardContent>
        </Card>
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
              {filteredIntegrations.map((integration) => (
                <Card key={integration.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                        <Image
                          src={integration.icon || "/placeholder.svg"}
                          alt={integration.name}
                          className="h-8 w-8 object-contain"
                          width={32}
                          height={32}
                        />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {integration.name}
                          {integration.status === "connected" && (
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            >
                              Connected
                            </Badge>
                          )}
                          {integration.status === "disconnected" && (
                            <Badge
                              variant="outline"
                              className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                            >
                              Disconnected
                            </Badge>
                          )}
                          {integration.status === "error" && (
                            <Badge
                              variant="outline"
                              className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            >
                              Error
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last sync:</span>
                        <span>{integration.lastSync}</span>
                      </div>
                      {integration.status === "connected" && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">API calls today:</span>
                          <span className="font-medium">{integration.apiCalls}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{integration.category}</Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    {integration.status === "connected" ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 bg-transparent"
                          onClick={() => handleIntegrationAction("syncing", integration.name)}
                        >
                          <RefreshCw className="h-3 w-3" />
                          Sync
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 bg-transparent"
                            onClick={() => handleIntegrationAction("configuring", integration.name)}
                          >
                            <SettingsIcon className="h-3 w-3" />
                            Configure
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-destructive hover:text-destructive bg-transparent"
                            onClick={() => handleIntegrationAction("disconnecting", integration.name)}
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
                          onClick={() => handleIntegrationAction("viewing error details for", integration.name)}
                        >
                          <AlertCircle className="h-3 w-3" />
                          View Error
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 bg-transparent"
                          onClick={() => handleIntegrationAction("retrying", integration.name)}
                        >
                          <RefreshCw className="h-3 w-3" />
                          Retry
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="w-full gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => handleIntegrationAction("connecting", integration.name)}
                      >
                        <Plug className="h-3 w-3" />
                        Connect
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
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
            {connectedIntegrations.slice(0, 3).map((api, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                    <Image src={api.icon || "/placeholder.svg"} alt={api.name} className="h-8 w-8 object-contain" width={32} height={32} />
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
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    <Zap className="mr-1 h-3 w-3" />
                    {api.apiCalls} API calls today
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 gap-1 bg-transparent"
                    onClick={() => handleIntegrationAction("viewing dashboard for", api.name)}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Dashboard
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => requireAuth("viewing all analytics")}
          >
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
              <Select
                value={newIntegration.type}
                onValueChange={(value) => setNewIntegration((prev) => ({ ...prev, type: value }))}
              >
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
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key"
                value={newIntegration.apiKey}
                onChange={(e) => setNewIntegration((prev) => ({ ...prev, apiKey: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-sync"
                checked={newIntegration.autoSync}
                onCheckedChange={(checked) => setNewIntegration((prev) => ({ ...prev, autoSync: checked }))}
              />
              <Label htmlFor="auto-sync">Enable automatic synchronization</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddIntegrationDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleCreateIntegration}
            >
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default APIHub
