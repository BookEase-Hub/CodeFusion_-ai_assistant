"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Star, Calendar, Search, FolderOpen, MessageSquare } from "lucide-react"
import { GitHubIntegration } from "@/lib/integrations/github"
import { useProjects } from "@/contexts/project-context"
import { useIntegrations } from "@/contexts/integration-context"
import { toast } from "@/components/ui/use-toast"

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string
  private: boolean
  clone_url: string
  html_url: string
  language: string
  stargazers_count: number
  updated_at: string
}

interface GitHubCloneModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCloneComplete: (project: any, action: "editor" | "chat") => void
}

export function GitHubCloneModal({ open, onOpenChange, onCloneComplete }: GitHubCloneModalProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(false)
  const [cloning, setCloning] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)

  const { createProject } = useProjects()
  const { getIntegration } = useIntegrations()

  useEffect(() => {
    if (open) {
      loadRepositories()
    }
  }, [open])

  useEffect(() => {
    if (searchQuery) {
      setFilteredRepos(
        repos.filter(
          (repo) =>
            repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            repo.language?.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    } else {
      setFilteredRepos(repos)
    }
  }, [searchQuery, repos])

  const loadRepositories = async () => {
    setLoading(true)
    try {
      const githubIntegration = getIntegration("github")
      if (!githubIntegration?.config?.token) {
        throw new Error("GitHub not connected")
      }

      const repositories = await GitHubIntegration.getUserRepos(githubIntegration.config.token)
      setRepos(repositories)
      setFilteredRepos(repositories)
    } catch (error) {
      console.error("Failed to load repositories:", error)
      toast({
        title: "Error",
        description: "Failed to load GitHub repositories. Please check your connection.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCloneRepository = async (repo: GitHubRepo, action: "editor" | "chat") => {
    setCloning(repo.id.toString())
    try {
      const githubIntegration = getIntegration("github")
      if (!githubIntegration?.config?.token) {
        throw new Error("GitHub not connected")
      }

      // Clone the repository
      const clonedProject = await GitHubIntegration.cloneRepository(githubIntegration.config.token, repo)

      // Create project in our system
      const project = await createProject({
        name: clonedProject.name,
        description: clonedProject.description || `Cloned from ${repo.full_name}`,
        primaryLanguage: clonedProject.language || "JavaScript",
        template: "github-clone",
        metadata: {
          ...clonedProject.metadata,
          githubUrl: repo.html_url,
          cloneUrl: repo.clone_url,
        },
      })

      // Store the file tree in the project
      const projectWithFiles = {
        ...project,
        files: clonedProject.files,
        metadata: clonedProject.metadata,
      }

      toast({
        title: "Repository Cloned",
        description: `${repo.name} has been successfully cloned and is ready to use.`,
      })

      onCloneComplete(projectWithFiles, action)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to clone repository:", error)
      toast({
        title: "Clone Failed",
        description: `Failed to clone ${repo.name}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setCloning(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Clone GitHub Repository</DialogTitle>
          <DialogDescription>
            Select a repository from your GitHub account to clone and work with in CodeFusion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-96">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading repositories...</span>
              </div>
            ) : filteredRepos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No repositories match your search." : "No repositories found."}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedRepo?.id === repo.id ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setSelectedRepo(repo)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-sm truncate">{repo.name}</h3>
                          {repo.private && (
                            <Badge variant="secondary" className="text-xs">
                              Private
                            </Badge>
                          )}
                          {repo.language && (
                            <Badge variant="outline" className="text-xs">
                              {repo.language}
                            </Badge>
                          )}
                        </div>

                        {repo.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{repo.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {repo.stargazers_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Updated {formatDate(repo.updated_at)}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={cloning === repo.id.toString()}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCloneRepository(repo, "editor")
                          }}
                        >
                          {cloning === repo.id.toString() ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <FolderOpen className="h-4 w-4" />
                          )}
                          <span className="ml-1">Open in Editor</span>
                        </Button>

                        <Button
                          size="sm"
                          disabled={cloning === repo.id.toString()}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCloneRepository(repo, "chat")
                          }}
                        >
                          {cloning === repo.id.toString() ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MessageSquare className="h-4 w-4" />
                          )}
                          <span className="ml-1">Analyze in Chat</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
