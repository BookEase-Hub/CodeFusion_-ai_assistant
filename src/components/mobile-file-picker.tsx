"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Upload,
  Clock,
  Search,
  X,
  Settings,
  Cloud,
  Smartphone,
  HardDrive,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { fileManager, type FileHandle, type FolderHandle } from "@/services/file-manager"
import { useAppState } from "@/contexts/app-state-context"

interface MobileFilePickerProps {
  onFileSelect?: (file: FileHandle) => void
  onFolderSelect?: (folder: FolderHandle) => void
  mode?: "file" | "folder" | "both"
  isOpen: boolean
  onClose: () => void
}

export function MobileFilePicker({
  onFileSelect,
  onFolderSelect,
  mode = "both",
  isOpen,
  onClose,
}: MobileFilePickerProps) {
  const [activeTab, setActiveTab] = useState("recent")
  const [recentFiles, setRecentFiles] = useState<FileHandle[]>([])
  const [workspaces, setWorkspaces] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { addEditorTab } = useAppState()

  useEffect(() => {
    if (isOpen) {
      loadRecentFiles()
      loadWorkspaces()
    }
  }, [isOpen])

  const loadRecentFiles = () => {
    const recent = fileManager.getRecentFiles()
    setRecentFiles(recent)
  }

  const loadWorkspaces = () => {
    const workspaceNames = fileManager.getWorkspaces()
    setWorkspaces(workspaceNames)
  }

  const handleOpenFile = async () => {
    setIsLoading(true)
    try {
      const file = await fileManager.openFile()
      if (file) {
        onFileSelect?.(file)
        // Add to editor tabs
        addEditorTab({
          id: `tab-${Date.now()}`,
          name: file.name,
          content: file.content,
          language: getLanguageFromFileName(file.name),
          path: file.path,
        })
        toast({
          title: "File Opened",
          description: `Successfully opened ${file.name}`,
          duration: 3000,
        })
        onClose()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open file. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenFolder = async () => {
    setIsLoading(true)
    try {
      const folder = await fileManager.openFolder()
      if (folder) {
        onFolderSelect?.(folder)
        toast({
          title: "Folder Opened",
          description: `Successfully opened ${folder.name}`,
          duration: 3000,
        })
        onClose()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open folder. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenRecentFile = (file: FileHandle) => {
    onFileSelect?.(file)
    addEditorTab({
      id: `tab-${Date.now()}`,
      name: file.name,
      content: file.content,
      language: getLanguageFromFileName(file.name),
      path: file.path,
    })
    toast({
      title: "File Opened",
      description: `Successfully opened ${file.name}`,
      duration: 3000,
    })
    onClose()
  }

  const handleOpenWorkspace = async (workspaceName: string) => {
    setIsLoading(true)
    try {
      const workspace = await fileManager.openWorkspace(workspaceName)
      if (workspace) {
        onFolderSelect?.(workspace)
        toast({
          title: "Workspace Opened",
          description: `Successfully opened ${workspaceName}`,
          duration: 3000,
        })
        onClose()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open workspace. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNewFile = () => {
    const newFile = fileManager.createNewFile()
    onFileSelect?.(newFile)
    addEditorTab({
      id: `tab-${Date.now()}`,
      name: newFile.name,
      content: newFile.content,
      language: "text",
      path: newFile.path,
    })
    toast({
      title: "New File Created",
      description: `Created ${newFile.name}`,
      duration: 3000,
    })
    onClose()
  }

  const getLanguageFromFileName = (fileName: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "js":
      case "jsx":
        return "javascript"
      case "ts":
      case "tsx":
        return "typescript"
      case "html":
        return "html"
      case "css":
        return "css"
      case "json":
        return "json"
      case "py":
        return "python"
      case "md":
        return "markdown"
      default:
        return "text"
    }
  }

  const filteredRecentFiles = recentFiles.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>File Manager</CardTitle>
            <CardDescription>Open files, folders, or create new content</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="workspace">Workspace</TabsTrigger>
              <TabsTrigger value="cloud">Cloud</TabsTrigger>
            </TabsList>

            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <TabsContent value="recent" className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Button onClick={handleCreateNewFile} className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    New File
                  </Button>
                  {(mode === "file" || mode === "both") && (
                    <Button variant="outline" onClick={handleOpenFile} disabled={isLoading}>
                      <Upload className="mr-2 h-4 w-4" />
                      Open File
                    </Button>
                  )}
                  {(mode === "folder" || mode === "both") && (
                    <Button variant="outline" onClick={handleOpenFolder} disabled={isLoading}>
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Open Folder
                    </Button>
                  )}
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredRecentFiles.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No recent files found</p>
                      <p className="text-sm">Open a file to see it here</p>
                    </div>
                  ) : (
                    filteredRecentFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => handleOpenRecentFile(file)}
                      >
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {file.lastModified.toLocaleDateString()} • {file.type}
                          </p>
                        </div>
                        <Badge variant="outline">{getLanguageFromFileName(file.name)}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="browse" className="space-y-4">
                <div className="grid gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Device Storage</h3>
                    </div>
                    <div className="grid gap-2">
                      <Button variant="outline" onClick={handleOpenFile} disabled={isLoading}>
                        <FileText className="mr-2 h-4 w-4" />
                        Browse Files
                      </Button>
                      <Button variant="outline" onClick={handleOpenFolder} disabled={isLoading}>
                        <Folder className="mr-2 h-4 w-4" />
                        Browse Folders
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <HardDrive className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Quick Access</h3>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <p className="text-muted-foreground">• Downloads folder</p>
                      <p className="text-muted-foreground">• WhatsApp documents</p>
                      <p className="text-muted-foreground">• Photos & Videos</p>
                      <p className="text-muted-foreground">• Recent documents</p>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="workspace" className="space-y-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {workspaces.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No workspaces found</p>
                      <p className="text-sm">Open a folder to create a workspace</p>
                    </div>
                  ) : (
                    workspaces.map((workspace, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => handleOpenWorkspace(workspace)}
                      >
                        <FolderOpen className="h-5 w-5 text-yellow-500" />
                        <div className="flex-1">
                          <p className="font-medium">{workspace}</p>
                          <p className="text-sm text-muted-foreground">Workspace</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="cloud" className="space-y-4">
                <div className="grid gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Cloud className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Cloud Storage</h3>
                    </div>
                    <div className="grid gap-2">
                      <Button variant="outline" disabled>
                        <Cloud className="mr-2 h-4 w-4" />
                        Google Drive (Coming Soon)
                      </Button>
                      <Button variant="outline" disabled>
                        <Cloud className="mr-2 h-4 w-4" />
                        Dropbox (Coming Soon)
                      </Button>
                      <Button variant="outline" disabled>
                        <Cloud className="mr-2 h-4 w-4" />
                        OneDrive (Coming Soon)
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Settings className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Sync Settings</h3>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Auto-sync enabled</p>
                      <p>• Last sync: Just now</p>
                      <p>• Storage used: 2.3 MB</p>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
