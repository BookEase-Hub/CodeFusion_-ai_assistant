"use client"

import type React from "react"
import { useState } from "react"
import {
  FileCode2,
  FolderGit2,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Plus,
  Search,
  Star,
  Clock,
  Code,
  MoreHorizontal,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

const projects = [
  {
    id: "1",
    name: "E-commerce Platform",
    description: "A modern e-commerce platform with React and Node.js",
    language: "TypeScript",
    stars: 24,
    lastUpdated: "2 hours ago",
    progress: 75,
  },
  {
    id: "2",
    name: "API Gateway",
    description: "Microservices API gateway with authentication and rate limiting",
    language: "Go",
    stars: 18,
    lastUpdated: "1 day ago",
    progress: 45,
  },
  {
    id: "3",
    name: "Mobile App",
    description: "Cross-platform mobile application for task management",
    language: "React Native",
    stars: 32,
    lastUpdated: "3 days ago",
    progress: 90,
  },
  {
    id: "4",
    name: "Data Visualization Dashboard",
    description: "Interactive dashboard for visualizing complex datasets",
    language: "JavaScript",
    stars: 15,
    lastUpdated: "1 week ago",
    progress: 60,
  },
  {
    id: "5",
    name: "Machine Learning Pipeline",
    description: "Automated ML pipeline for data processing and model training",
    language: "Python",
    stars: 42,
    lastUpdated: "2 weeks ago",
    progress: 80,
  },
]

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
    if (requireAuth("project search")) {
      setSearchQuery(e.target.value)
    }
  }

  const handleTabChange = (value: string) => {
    if (requireAuth(`the ${value} projects tab`)) {
      setActiveTab(value)
    }
  }

  const handleProjectAction = (action: string, projectName?: string) => {
    if (requireAuth(`project ${action}`)) {
      toast({
        title: "Action Completed",
        description: projectName ? `Successfully ${action} ${projectName}.` : `Project ${action} completed.`,
        duration: 3000,
      })
    }
  }

  const handleCreateProject = () => {
    if (!newProject.name || !newProject.description || !newProject.language) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    toast({
      title: "Project Created",
      description: `Successfully created ${newProject.name}.`,
      duration: 3000,
    })

    setShowNewProjectDialog(false)
    setNewProject({ name: "", description: "", language: "", template: "" })
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
          <TabsTrigger value="starred">Starred</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderGit2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No projects found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search or create a new project.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
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
                          <DropdownMenuItem onClick={() => handleProjectAction("editing", project.name)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleProjectAction("duplication", project.name)}>
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleProjectAction("archiving", project.name)}>
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleProjectAction("deletion", project.name)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                          <span className="text-sm">{project.language}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-accent" />
                          <span className="text-sm">{project.stars}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {project.lastUpdated}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 bg-transparent"
                      onClick={() => handleProjectAction("opening", project.name)}
                    >
                      <Code className="h-3 w-3" />
                      Open
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((project) => (
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
                        <DropdownMenuItem onClick={() => handleProjectAction("editing", project.name)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleProjectAction("duplication", project.name)}>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleProjectAction("archiving", project.name)}>
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleProjectAction("deletion", project.name)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <span className="text-sm">{project.language}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-accent" />
                        <span className="text-sm">{project.stars}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {project.lastUpdated}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 bg-transparent"
                    onClick={() => handleProjectAction("opening", project.name)}
                  >
                    <Code className="h-3 w-3" />
                    Open
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="starred" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects
              .filter((p) => p.stars > 20)
              .map((project) => (
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
                          <DropdownMenuItem onClick={() => handleProjectAction("editing", project.name)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleProjectAction("duplication", project.name)}>
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleProjectAction("archiving", project.name)}>
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleProjectAction("deletion", project.name)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                          <span className="text-sm">{project.language}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-accent" />
                          <span className="text-sm">{project.stars}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {project.lastUpdated}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 bg-transparent"
                      onClick={() => handleProjectAction("opening", project.name)}
                    >
                      <Code className="h-3 w-3" />
                      Open
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="archived" className="mt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FolderGit2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No archived projects</h3>
            <p className="text-muted-foreground mt-2">Projects you archive will appear here.</p>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent actions across all projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {[
              {
                icon: GitPullRequest,
                title: "Pull Request Merged",
                description: "PR #42: Add authentication feature to E-commerce Platform",
                time: "2 hours ago",
                color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
              },
              {
                icon: GitCommit,
                title: "Commit Pushed",
                description: "feat: implement responsive dashboard in Mobile App",
                time: "5 hours ago",
                color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
              },
              {
                icon: GitBranch,
                title: "Branch Created",
                description: "feature/user-dashboard from main in API Gateway",
                time: "1 day ago",
                color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
              },
              {
                icon: FileCode2,
                title: "File Modified",
                description: "Updated src/components/Dashboard.tsx in E-commerce Platform",
                time: "2 days ago",
                color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
              },
            ].map((activity, i) => (
              <div key={i} className="relative flex items-start gap-4">
                <div className="absolute left-0 top-0 bottom-0 flex w-6 justify-center">
                  <div className="w-px bg-border" />
                </div>
                <div className={`relative rounded-full p-2 ${activity.color}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
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
