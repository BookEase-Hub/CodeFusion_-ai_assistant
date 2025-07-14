"use client"

import { useState, useEffect } from "react"
import { 
  FileText, Folder, FolderOpen, Plus, Upload, Clock, 
  Search, X, Settings, Cloud, Smartphone, HardDrive 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { fileManager, type FileHandle, type FolderHandle } from "@/services/file-manager"
import { useAppState } from "@/contexts/app-state-context"

// ... (keep all existing types/interfaces)

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
  const [isSupported, setIsSupported] = useState(true) // Track browser support
  const { toast } = useToast()
  const { addEditorTab } = useAppState()

  useEffect(() => {
    // Check if File System Access API is supported
    setIsSupported('showOpenFilePicker' in window)
    
    if (isOpen && isSupported) {
      loadRecentFiles()
      loadWorkspaces()
    }
  }, [isOpen])

  // ... (keep all existing handlers, but add error handling)

  const handleOpenFile = async () => {
    if (!isSupported) {
      toast({
        title: "Unsupported Feature",
        description: "File access is not supported in your browser.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const file = await fileManager.openFile()
      if (file) {
        onFileSelect?.(file)
        addEditorTab({
          id: `tab-${Date.now()}`,
          name: file.name,
          content: file.content,
          language: getLanguageFromFileName(file.name),
          path: file.path,
        })
        toast({ title: "File Opened", description: `Opened ${file.name}` })
        onClose()
      }
    } catch (error) {
      console.error("Error opening file:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to open file",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add similar error handling to other file operations

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-2xl max-h-[90dvh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
          <div>
            <CardTitle className="text-lg sm:text-xl">File Manager</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Open files, folders, or create new content
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {!isSupported ? (
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Browser Not Supported</h3>
              <p className="text-muted-foreground mb-4">
                File system access is not supported in your browser. Please use Chrome or Edge.
              </p>
              <Button onClick={onClose}>Close</Button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 rounded-none">
                <TabsTrigger value="recent" className="py-2 text-xs sm:text-sm">
                  Recent
                </TabsTrigger>
                <TabsTrigger value="browse" className="py-2 text-xs sm:text-sm">
                  Browse
                </TabsTrigger>
                <TabsTrigger value="workspace" className="py-2 text-xs sm:text-sm">
                  Workspace
                </TabsTrigger>
                <TabsTrigger value="cloud" className="py-2 text-xs sm:text-sm">
                  Cloud
                </TabsTrigger>
              </TabsList>

              <div className="p-4">
                {/* Search and controls */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    className="pl-10 text-sm sm:text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Rest of your tab content... */}
                {/* ... */}
              </div>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
