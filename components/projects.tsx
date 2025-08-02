"use client"

import type React from "react"
import { useState } from "react"
import {
  FileCode2,
  FolderGit2,
  Plus,
  Search,
  Clock,
  Code,
  MoreHorizontal,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useToast } from "@/components/ui/use-toast"
import { useProjects } from "@/hooks/use-projects"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const timeAgo = (date: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + " years ago"
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + " months ago"
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + " days ago"
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + " hours ago"
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + " minutes ago"
  return Math.floor(seconds) + " seconds ago"
}

export function Projects() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    language: "",
    template: "",
  })

  const { requireAuth } = useRequireAuth()
  const { toast } = useToast()
  const { projects, isLoading, isSyncing, createProject } = useProjects()

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleNewProject = () => {
    if (requireAuth("project creation")) {
      setShowNewProjectDialog(true)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.description || !newProject.language || !newProject.template) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    try {
      await createProject(newProject)
      toast({
        title: "Project Created",
        description: `Successfully created ${newProject.name}.`,
        duration: 3000,
      })
      setShowNewProjectDialog(false)
      setNewProject({ name: "", description: "", language: "", template: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const renderProjectGrid = (projectList: typeof projects) => {
    if (projectList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FolderGit2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search or create a new project.</p>
        </div>
      )
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projectList.map((project) => (
          <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Archive</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-sm">{project.language}</span>
                </div>
                <div>
                  {project.status === "synced" && (
                    <Badge variant="secondary" className="text-green-600">
                      <CheckCircle className="mr-1 h-3 w-3" /> Synced
                    </Badge>
                  )}
                  {project.status === "pending" && (
                    <Badge variant="outline" className="text-blue-600 animate-pulse">
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Syncing...
                    </Badge>
                  )}
                  {project.status === "error" && (
                    <Badge variant="destructive">
                      <AlertTriangle className="mr-1 h-3 w-3" /> Error
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                {timeAgo(project.updatedAt)}
              </div>
              <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                <Code className="h-3 w-3" />
                Open
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">Manage and organize your coding projects</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search projects..." className="pl-10" value={searchQuery} onChange={handleSearch} />
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleNewProject}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="pending">Pending Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                  <CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3 mt-2" /></CardContent>
                  <CardFooter><Skeleton className="h-8 w-1/3" /></CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            renderProjectGrid(filteredProjects)
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          {renderProjectGrid(filteredProjects.slice().sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0,3))}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {renderProjectGrid(filteredProjects.filter(p => p.status === 'pending'))}
        </TabsContent>

      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Project Sync Status</CardTitle>
          <CardDescription>Overview of your project synchronization status.</CardDescription>
        </CardHeader>
        <CardContent>
          {isSyncing ? (
            <div className="flex items-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <p>Syncing projects with the cloud...</p>
            </div>
          ) : (
            <div className="flex items-center text-green-600">
              <CheckCircle className="mr-2 h-4 w-4" />
              <p>All projects are synced.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Set up a new project to start coding with AI assistance.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="My Awesome Project"
                value={newProject.name}
                onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="A brief description of your project"
                value={newProject.description}
                onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Primary Language</Label>
              <Select
                value={newProject.language}
                onValueChange={(value) => setNewProject((prev) => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template">Project Template</Label>
              <Select
                value={newProject.template}
                onValueChange={(value) => setNewProject((prev) => ({ ...prev, template: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blank">Blank Project</SelectItem>
                  <SelectItem value="web-app">Web Application</SelectItem>
                  <SelectItem value="api">API Service</SelectItem>
                  <SelectItem value="mobile">Mobile App</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleCreateProject}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Projects
