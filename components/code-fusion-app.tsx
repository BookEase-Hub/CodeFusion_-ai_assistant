"use client"

import * as React from "react"
import { useState, useEffect, useRef, useCallback, useImperativeHandle } from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import {
  Copy,
  Sparkles,
  FileCode2,
  FileIcon,
  Plus,
  PlusSquare,
  Folder,
  FolderPlus,
  Settings,
  Save,
  X,
  RefreshCw,
  ToggleRight,
  RotateCcw,
  RotateCw,
  Scissors,
  Clipboard,
  Search,
  Replace,
  Command,
  Layout,
  ArrowLeft,
  ArrowRight,
  Play,
  Bug,
  Square,
  StepForward,
  ArrowUp,
  ArrowDown,
  Terminal,
  Trash2,
  Info,
  BookOpen,
  FolderMinus,
  MoreHorizontal,
  Clock,
  FileText,
  Split,
  Maximize2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Package,
  ZoomIn,
  ZoomOut,
  Download,
  GitBranch,
  Edit3,
  FolderOpen,
  Check,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { cn } from "@/lib/utils"
import mermaid from "mermaid"
import CodeMirror from "@uiw/react-codemirror"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import { javascript } from "@codemirror/lang-javascript"
import { json } from "@codemirror/lang-json"
import { html } from "@codemirror/lang-html"
import { python } from "@codemirror/lang-python"
import { css } from "@codemirror/lang-css"
import { useToast } from "@/components/ui/use-toast"
import { useAppState, AppStateProvider } from "@/contexts/app-state-context"
import type { EditorTab, ChatMessage, FileNode, Project, Workspace } from "@/contexts/app-state-context"

// Initialize Mermaid for architecture diagrams
mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
  themeVariables: {
    primaryColor: "#007acc",
    primaryTextColor: "#ffffff",
    primaryBorderColor: "#3c3c3c",
    lineColor: "#3c3c3c",
    sectionBkgColor: "#252526",
    altSectionBkgColor: "#1e1e1e",
    gridColor: "#3c3c3c",
    secondaryColor: "#252526",
    tertiaryColor: "#3c3c3c",
  },
})

// Mock authentication hook
const useRequireAuth = () => ({
  requireAuth: (feature: string) => true,
})

// Types and Interfaces
interface MenuItem {
  label: string
  shortcut?: string
  icon?: React.ElementType
  action?: () => void
  submenu?: MenuItem[]
  divider?: boolean
  disabled?: boolean
  checked?: boolean
}

interface MenuCategory {
  label: string
  icon: React.ElementType
  items: MenuItem[]
}

interface FileTreeItem {
  id: string
  name: string
  type: "file" | "folder"
  path: string
  children?: FileTreeItem[]
  isOpen?: boolean
  language?: string
  content?: string
  isDirty?: boolean
}

// ScrollArea Component
const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">{children}</ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar
      orientation="vertical"
      className="flex select-none touch-none p-0.5 bg-[#252526] transition-colors duration-[160ms] ease-out hover:bg-[#2a2d2e] data-[orientation=vertical]:w-2.5"
    >
      <ScrollAreaPrimitive.Thumb className="flex-1 bg-[#3c3c3c] rounded-[10px] relative" />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Scrollbar
      orientation="horizontal"
      className="flex select-none touch-none p-0.5 bg-[#252526] transition-colors duration-[160ms] ease-out hover:bg-[#2a2d2e] data-[orientation=horizontal]:h-2.5"
    >
      <ScrollAreaPrimitive.Thumb className="flex-1 bg-[#3c3c3c] rounded-[10px] relative" />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

// CodeEditor Component
function CodeEditor({
  value,
  language,
  height,
  onChange,
  readOnly,
}: {
  value: string
  language: string
  height: string
  onChange?: (value: string) => void
  readOnly?: boolean
}) {
  const extensions = React.useMemo(() => {
    switch (language?.toLowerCase()) {
      case "js":
      case "javascript":
      case "tsx":
      case "typescript":
        return [javascript({ jsx: true, typescript: true })]
      case "json":
        return [json()]
      case "html":
        return [html()]
      case "python":
        return [python()]
      case "css":
        return [css()]
      default:
        return []
    }
  }, [language])

  return (
    <CodeMirror
      value={value}
      height={height}
      theme={vscodeDark}
      extensions={extensions}
      editable={!readOnly}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        foldGutter: true,
      }}
      onChange={(val) => onChange?.(val)}
      style={{ fontSize: 14, fontFamily: `"Fira Code", "JetBrains Mono", monospace` }}
      className="touch-none"
    />
  )
}

// EditorToolbar Component
interface EditorToolbarProps {
  onSave: () => Promise<void>
  onSaveAs: (name: string) => Promise<void>
  projectName: string
  onUndo?: () => void
  onRedo?: () => void
  onCut?: () => void
  onCopy?: () => void
  onPaste?: () => void
  onFind?: () => void
  onReplace?: () => void
  canUndo?: boolean
  canRedo?: boolean
}

function EditorToolbar({
  onSave,
  onSaveAs,
  projectName,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onFind,
  onReplace,
  canUndo = false,
  canRedo = false,
}: EditorToolbarProps) {
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true)
      await onSave()
      toast({
        title: "Project Saved",
        description: `${projectName} has been saved successfully`,
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save project",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }, [onSave, projectName, toast])

  const handleSaveAs = useCallback(() => {
    setNewProjectName(projectName)
    setShowSaveAsDialog(true)
  }, [projectName])

  const confirmSaveAs = useCallback(async () => {
    if (newProjectName.trim()) {
      try {
        setIsSaving(true)
        await onSaveAs(newProjectName.trim())
        setShowSaveAsDialog(false)
        toast({
          title: "Project Saved As",
          description: `Project saved as ${newProjectName}`,
        })
      } catch (error) {
        toast({
          title: "Save As Failed",
          description: "Failed to save project with new name",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
      }
    }
  }, [newProjectName, onSaveAs, toast])

  const handleKeyboardShortcut = useCallback(
    (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey

      if (ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "s":
            e.preventDefault()
            if (e.shiftKey) {
              handleSaveAs()
            } else {
              handleSave()
            }
            break
          case "z":
            e.preventDefault()
            if (e.shiftKey) {
              onRedo?.()
            } else {
              onUndo?.()
            }
            break
          case "y":
            e.preventDefault()
            onRedo?.()
            break
          case "x":
            e.preventDefault()
            onCut?.()
            break
          case "c":
            e.preventDefault()
            onCopy?.()
            break
          case "v":
            e.preventDefault()
            onPaste?.()
            break
          case "f":
            e.preventDefault()
            if (e.shiftKey) {
              onReplace?.()
            } else {
              onFind?.()
            }
            break
          case "h":
            e.preventDefault()
            onReplace?.()
            break
        }
      }
    },
    [handleSave, handleSaveAs, onUndo, onRedo, onCut, onCopy, onPaste, onFind, onReplace],
  )

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyboardShortcut)
    return () => document.removeEventListener("keydown", handleKeyboardShortcut)
  }, [handleKeyboardShortcut])

  return (
    <TooltipProvider>
      <div className="h-12 bg-[#2d2d30] border-b border-[#3c3c3c] flex items-center px-4 gap-2">
        <div className="flex items-center gap-2 mr-4">
          <Folder className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-300 truncate max-w-48">{projectName}</span>
        </div>

        <Separator orientation="vertical" className="h-6 bg-[#3c3c3c]" />

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving} className="h-8 px-3">
                <Save className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save (Ctrl+S)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleSaveAs} disabled={isSaving} className="h-8 px-3">
                <Download className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Save As</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save As (Ctrl+Shift+S)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 bg-[#3c3c3c]" />

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo} className="h-8 w-8 p-0">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onRedo} disabled={!canRedo} className="h-8 w-8 p-0">
                <RotateCw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 bg-[#3c3c3c]" />

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onCut} className="h-8 w-8 p-0">
                <Scissors className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cut (Ctrl+X)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onCopy} className="h-8 w-8 p-0">
                <Copy className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy (Ctrl+C)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onPaste} className="h-8 w-8 p-0">
                <Clipboard className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Paste (Ctrl+V)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 bg-[#3c3c3c]" />

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onFind} className="h-8 w-8 p-0">
                <Search className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Find (Ctrl+F)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onReplace} className="h-8 w-8 p-0">
                <Replace className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Replace (Ctrl+H)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Play className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Run</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Bug className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Debug</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Terminal className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Terminal</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Dialog open={showSaveAsDialog} onOpenChange={setShowSaveAsDialog}>
          <DialogContent className="bg-[#252526] border-[#3c3c3c]">
            <DialogHeader>
              <DialogTitle className="text-white">Save Project As</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Workspace Name</label>
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter workspace name..."
                  className="bg-[#3c3c3c] border-[#3c3c3c] text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      confirmSaveAs()
                    }
                  }}
                />
              </div>
              <p className="text-xs text-gray-500">This will create a new workspace or overwrite an existing one.</p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSaveAsDialog(false)}
                className="bg-transparent border-[#3c3c3c]"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmSaveAs}
                className="bg-[#007acc] hover:bg-[#005f99]"
                disabled={isSaving || !newProjectName.trim()}
              >
                {isSaving ? "Saving..." : "Save As"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

// WorkspaceSelector Component
function WorkspaceSelector({
  workspaces,
  currentWorkspaceId,
  onSwitchWorkspace,
  onCreateWorkspace,
  onDuplicateWorkspace,
  onExportWorkspace,
  onImportWorkspace,
}: {
  workspaces: Workspace[]
  currentWorkspaceId: string | null
  onSwitchWorkspace: (workspaceId: string) => void
  onCreateWorkspace: () => void
  onDuplicateWorkspace: (workspaceId: string) => void
  onExportWorkspace: (workspaceId: string) => void
  onImportWorkspace: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleSelect = (workspaceId: string) => {
    onSwitchWorkspace(workspaceId)
    setIsOpen(false)
    toast({ title: "Workspace Switched", description: `Switched to workspace: ${workspaces.find(w => w.id === workspaceId)?.name}` })
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 px-3 text-sm flex items-center gap-2">
          <Folder className="w-4 h-4" />
          <span className="truncate max-w-32">
            {workspaces.find(w => w.id === currentWorkspaceId)?.name || "Select Workspace"}
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#252526] border-[#3c3c3c] text-gray-300 min-w-[200px]">
        {workspaces.map(workspace => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => handleSelect(workspace.id)}
            className="flex items-center gap-2"
          >
            <Folder className="w-4 h-4" />
            <span>{workspace.name}</span>
            {workspace.id === currentWorkspaceId && <Check className="w-4 h-4 ml-auto" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onCreateWorkspace} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Workspace
        </DropdownMenuItem>
        {currentWorkspaceId && (
          <>
            <DropdownMenuItem
              onClick={() => onDuplicateWorkspace(currentWorkspaceId)}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Duplicate Workspace
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onExportWorkspace(currentWorkspaceId)}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Workspace
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onClick={onImportWorkspace} className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Import Workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ProjectExplorer Component
function ProjectExplorer({
  onFileSelect,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
  onConvertToFolder,
  onConvertToFile,
}: {
  onFileSelect: (path: string) => void
  onNewFile: (path: string, content: string) => void
  onNewFolder: (path: string) => void
  onRename: (path: string, newName: string) => void
  onDelete: (path: string) => void
  onConvertToFolder: (path: string) => void
  onConvertToFile: (path: string) => void
}) {
  const { state: { currentProject }, updateProject } = useAppState()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [contextMenuNode, setContextMenuNode] = useState<FileTreeItem | null>(null)
  const { toast } = useToast()

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }, [])

  const handleNodeClick = useCallback(
    (node: FileTreeItem) => {
      if (node.type === "folder") {
        toggleFolder(node.id)
      } else {
        setSelectedNode(node.id)
        onFileSelect(node.path)
      }
    },
    [toggleFolder, onFileSelect],
  )

  const handleDragStart = useCallback((e: React.DragEvent, nodeId: string) => {
    setDraggedNode(nodeId)
    e.dataTransfer.effectAllowed = "move"
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, targetNodeId: string) => {
      e.preventDefault()
      if (draggedNode && draggedNode !== targetNodeId) {
        toast({
          title: "Move Operation",
          description: `Moving ${draggedNode} to ${targetNodeId}`,
        })
        // Implement move logic here
      }
      setDraggedNode(null)
    },
    [draggedNode, toast],
  )

  const handleContextMenu = useCallback((node: FileTreeItem) => {
    setContextMenuNode(node)
  }, [])

  const handleNewFile = useCallback(() => {
    setShowNewFileDialog(true)
    setNewItemName("")
  }, [])

  const handleNewFolder = useCallback(() => {
    setShowNewFolderDialog(true)
    setNewItemName("")
  }, [])

  const handleRename = useCallback(() => {
    if (contextMenuNode) {
      setShowRenameDialog(true)
      setNewItemName(contextMenuNode.name)
    }
  }, [contextMenuNode])

  const handleDelete = useCallback(() => {
    if (contextMenuNode) {
      onDelete(contextMenuNode.path)
      toast({
        title: "Delete",
        description: `Deleted ${contextMenuNode.name}`,
      })
    }
  }, [contextMenuNode, onDelete, toast])

  const handleConvertToFolder = useCallback(() => {
    if (contextMenuNode && contextMenuNode.type === "file") {
      onConvertToFolder(contextMenuNode.path)
      toast({
        title: "Convert to Folder",
        description: `Converted ${contextMenuNode.name} to folder`,
      })
    }
  }, [contextMenuNode, onConvertToFolder, toast])

  const handleConvertToFile = useCallback(() => {
    if (contextMenuNode && contextMenuNode.type === "folder") {
      onConvertToFile(contextMenuNode.path)
      toast({
        title: "Convert to File",
        description: `Converted ${contextMenuNode.name} to file`,
      })
    }
  }, [contextMenuNode, onConvertToFile, toast])

  const confirmNewFile = useCallback(() => {
    if (newItemName.trim()) {
      const path = contextMenuNode ? `${contextMenuNode.path}/${newItemName}` : `src/${newItemName}`
      onNewFile(path, "")
      toast({
        title: "New File",
        description: `Created ${newItemName}`,
      })
      setShowNewFileDialog(false)
      setNewItemName("")
    }
  }, [newItemName, contextMenuNode, onNewFile, toast])

  const confirmNewFolder = useCallback(() => {
    if (newItemName.trim()) {
      const path = contextMenuNode ? `${contextMenuNode.path}/${newItemName}` : `src/${newItemName}`
      onNewFolder(path)
      toast({
        title: "New Folder",
        description: `Created folder ${newItemName}`,
      })
      setShowNewFolderDialog(false)
      setNewItemName("")
    }
  }, [newItemName, contextMenuNode, onNewFolder, toast])

  const confirmRename = useCallback(() => {
    if (newItemName.trim() && contextMenuNode) {
      onRename(contextMenuNode.path, newItemName)
      toast({
        title: "Rename",
        description: `Renamed ${contextMenuNode.name} to ${newItemName}`,
      })
      setShowRenameDialog(false)
      setNewItemName("")
    }
  }, [newItemName, contextMenuNode, onRename, toast])

  const renderFileTree = useCallback(
    (nodes: FileTreeItem[], level = 0) => {
      return nodes.map((node) => (
        <div key={node.id}>
          <ContextMenu>
            <ContextMenuTrigger>
              <div
                className={`flex items-center py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer select-none ${
                  selectedNode === node.id ? "bg-[#37373d]" : ""
                } ${draggedNode === node.id ? "opacity-50" : ""}`}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={() => handleNodeClick(node)}
                onContextMenu={() => handleContextMenu(node)}
                draggable
                onDragStart={(e) => handleDragStart(e, node.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, node.id)}
              >
                {node.type === "folder" ? (
                  <>
                    {expandedFolders.has(node.id) ? (
                      <ChevronDown className="w-4 h-4 mr-1 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 mr-1 text-gray-400" />
                    )}
                    {expandedFolders.has(node.id) ? (
                      <FolderOpen className="w-4 h-4 mr-2 text-blue-400" />
                    ) : (
                      <Folder className="w-4 h-4 mr-2 text-blue-400" />
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 mr-1" />
                    <FileText className="w-4 h-4 mr-2 text-gray-400" />
                  </>
                )}
                <span className="text-sm text-gray-300 truncate">
                  {node.name}
                  {node.isDirty && <span className="text-orange-400 ml-1">â€¢</span>}
                </span>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="bg-[#252526] border-[#3c3c3c]">
              <ContextMenuItem onClick={handleNewFile}>
                <FileText className="w-4 h-4 mr-2" />
                New File
              </ContextMenuItem>
              <ContextMenuItem onClick={handleNewFolder}>
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={handleRename}>
                <Edit3 className="w-4 h-4 mr-2" />
                Rename
              </ContextMenuItem>
              <ContextMenuItem onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </ContextMenuItem>
              <ContextMenuSeparator />
              {node.type === "file" ? (
                <ContextMenuItem onClick={handleConvertToFolder}>
                  <Folder className="w-4 h-4 mr-2" />
                  Convert to Folder
                </ContextMenuItem>
              ) : (
                <ContextMenuItem onClick={handleConvertToFile}>
                  <FileText className="w-4 h-4 mr-2" />
                  Convert to File
                </ContextMenuItem>
              )}
              <ContextMenuSeparator />
              <ContextMenuItem>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </ContextMenuItem>
              <ContextMenuItem>
                <Scissors className="w-4 h-4 mr-2" />
                Cut
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          {node.type === "folder" && expandedFolders.has(node.id) && node.children && (
            <div>{renderFileTree(node.children, level + 1)}</div>
          )}
        </div>
      ))
    },
    [
      selectedNode,
      draggedNode,
      expandedFolders,
      handleNodeClick,
      handleContextMenu,
      handleDragStart,
      handleDragOver,
      handleDrop,
      handleNewFile,
      handleNewFolder,
      handleRename,
      handleDelete,
      handleConvertToFolder,
      handleConvertToFile,
    ],
  )

  if (!currentProject) {
    return (
      <div className="h-full bg-[#252526] flex items-center justify-center">
        <div className="text-center">
          <Folder className="w-12 h-12 mx-auto mb-3 text-gray-500" />
          <p className="text-gray-400 text-sm mb-4">No workspace loaded</p>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewFile}
              className="bg-transparent border-[#3c3c3c]"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create File
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewFolder}
              className="bg-transparent border-[#3c3c3c]"
            >
              <FolderPlus className="w-4 h-4 mr-1" />
              Create Folder
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-[#252526] flex flex-col">
      <div className="p-3 border-b border-[#3c3c3c] flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-300 truncate flex items-center gap-2">
          <Folder className="w-4 h-4 text-blue-400" />
          {currentProject.name}
        </h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="w-6 h-6 p-0" onClick={handleNewFile}>
            <FileText className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="w-6 h-6 p-0" onClick={handleNewFolder}>
            <FolderPlus className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {currentProject.files.length > 0 ? (
            renderFileTree(currentProject.files)
          ) : (
            <div className="text-center py-8">
              <Folder className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-sm text-gray-400 mb-4">Empty workspace</p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewFile}
                  className="bg-transparent border-[#3c3c3c]"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create File
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewFolder}
                  className="bg-transparent border-[#3c3c3c]"
                >
                  <FolderPlus className="w-4 h-4 mr-1" />
                  Create Folder
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent className="bg-[#252526] border-[#3c3c3c]">
          <DialogHeader>
            <DialogTitle className="text-white">New File</DialogTitle>
          </DialogHeader>
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Enter file name..."
            className="bg-[#3c3c3c] border-[#3c3c3c] text-white"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                confirmNewFile()
              }
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewFileDialog(false)}
              className="bg-transparent border-[#3c3c3c]"
            >
              Cancel
            </Button>
            <Button onClick={confirmNewFile} className="bg-[#007acc] hover:bg-[#005f99]">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="bg-[#252526] border-[#3c3c3c]">
          <DialogHeader>
            <DialogTitle className="text-white">New Folder</DialogTitle>
          </DialogHeader>
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Enter folder name..."
            className="bg-[#3c3c3c] border-[#3c3c3c] text-white"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                confirmNewFolder()
              }
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewFolderDialog(false)}
              className="bg-transparent border-[#3c3c3c]"
            >
              Cancel
            </Button>
            <Button onClick={confirmNewFolder} className="bg-[#007acc] hover:bg-[#005f99]">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="bg-[#252526] border-[#3c3c3c]">
          <DialogHeader>
            <DialogTitle className="text-white">Rename</DialogTitle>
          </DialogHeader>
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Enter new name..."
            className="bg-[#3c3c3c] border-[#3c3c3c] text-white"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                confirmRename()
              }
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRenameDialog(false)}
              className="bg-transparent border-[#3c3c3c]"
            >
              Cancel
            </Button>
            <Button onClick={confirmRename} className="bg-[#007acc] hover:bg-[#005f99]">
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// VSCodeMenu Component
function VSCodeMenu({
  onNewFile,
  onOpenFile,
  onOpenFolder,
  onSave,
  onSaveAs,
  onSaveAll,
  autoSave,
  onToggleAutoSave,
  onNewWindow,
  onOpenWorkspace,
  onOpenRecent,
  onAddFolderToWorkspace,
  onRevertFile,
  onCloseEditor,
  onCloseFolder,
  onCloseWindow,
  onExit,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onFind,
  onReplace,
  onSelectAll,
  onExpandSelection,
  onShrinkSelection,
  onCommandPalette,
  onToggleExplorer,
  onToggleSearch,
  onToggleSourceControl,
  onGoBack,
  onGoForward,
  onGoToFile,
  onGoToSymbol,
  onStartDebugging,
  onRunWithoutDebugging,
  onStopDebugging,
  onStepOver,
  onStepInto,
  onStepOut,
  onNewTerminal,
  onSplitTerminal,
  onClearTerminal,
  onKillTerminal,
  onShowWelcome,
  onShowDocumentation,
  onCheckUpdates,
  onShowAbout,
  onCreateWorkspace,
  onSwitchWorkspace,
  onDuplicateWorkspace,
  onExportWorkspace,
  onImportWorkspace,
}: {
  onNewFile: () => void
  onOpenFile: () => void
  onOpenFolder: () => void
  onSave: () => void
  onSaveAs: () => void
  onSaveAll: () => void
  autoSave: boolean
  onToggleAutoSave: () => void
  onNewWindow: () => void
  onOpenWorkspace: () => void
  onOpenRecent: () => void
  onAddFolderToWorkspace: () => void
  onRevertFile: () => void
  onCloseEditor: () => void
  onCloseFolder: () => void
  onCloseWindow: () => void
  onExit: () => void
  onUndo: () => void
  onRedo: () => void
  onCut: () => void
  onCopy: () => void
  onPaste: () => void
  onFind: () => void
  onReplace: () => void
  onSelectAll: () => void
  onExpandSelection: () => void
  onShrinkSelection: () => void
  onCommandPalette: () => void
  onToggleExplorer: () => void
  onToggleSearch: () => void
  onToggleSourceControl: () => void
  onGoBack: () => void
  onGoForward: () => void
  onGoToFile: () => void
  onGoToSymbol: () => void
  onStartDebugging: () => void
  onRunWithoutDebugging: () => void
  onStopDebugging: () => void
  onStepOver: () => void
  onStepInto: () => void
  onStepOut: () => void
  onNewTerminal: () => void
  onSplitTerminal: () => void
  onClearTerminal: () => void
  onKillTerminal: () => void
  onShowWelcome: () => void
  onShowDocumentation: () => void
  onCheckUpdates: () => void
  onShowAbout: () => void
  onCreateWorkspace: () => void
  onSwitchWorkspace: (workspaceId: string) => void
  onDuplicateWorkspace: (workspaceId: string) => void
  onExportWorkspace: (workspaceId: string) => void
  onImportWorkspace: () => void
}) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const { state: { workspaces, currentWorkspaceId } } = useAppState()

  const menuData: MenuCategory[] = [
    {
      label: "File",
      icon: FileIcon,
      items: [
        { label: "New File", shortcut: "Ctrl+N", icon: Plus, action: onNewFile },
        { label: "New Workspace", icon: PlusSquare, action: onCreateWorkspace },
        { label: "New Window", shortcut: "Ctrl+Shift+N", icon: PlusSquare, action: onNewWindow },
        { divider: true },
        { label: "Open File...", shortcut: "Ctrl+O", icon: FileIcon, action: onOpenFile },
        { label: "Open Folder...", shortcut: "Ctrl+K Ctrl+O", icon: Folder, action: onOpenFolder },
        { label: "Open Workspace...", icon: Layout, action: onOpenWorkspace },
        {
          label: "Open Recent",
          icon: Clock,
          submenu: [
            ...workspaces.map(w => ({
              label: w.name,
              action: () => onSwitchWorkspace(w.id),
            })),
            { divider: true },
            { label: "More...", action: onOpenRecent },
          ],
        },
        { divider: true },
        { label: "Add Folder to Workspace...", icon: FolderPlus, action: onAddFolderToWorkspace },
        { divider: true },
        { label: "Save", shortcut: "Ctrl+S", icon: Save, action: onSave },
        { label: "Save As...", shortcut: "Ctrl+Shift+S", icon: Save, action: onSaveAs },
        { label: "Save All", shortcut: "Ctrl+K S", icon: Save, action: onSaveAll },
        { label: "Auto Save", checked: autoSave, icon: ToggleRight, action: onToggleAutoSave },
        { divider: true },
        { label: "Export Workspace", icon: Download, action: () => currentWorkspaceId && onExportWorkspace(currentWorkspaceId) },
        { label: "Import Workspace", icon: Upload, action: onImportWorkspace },
        { divider: true },
        { label: "Preferences", shortcut: "Ctrl+,", icon: Settings, action: onShowAbout },
        { divider: true },
        { label: "Revert File", icon: RefreshCw, action: onRevertFile },
        { divider: true },
        { label: "Close Editor", shortcut: "Ctrl+F4", icon: X, action: onCloseEditor },
        { label: "Close Folder", shortcut: "Ctrl+K F", icon: FolderMinus, action: onCloseFolder },
        { label: "Close Window", shortcut: "Ctrl+Shift+W", icon: X, action: onCloseWindow },
        { divider: true },
        { label: "Exit", action: onExit },
      ],
    },
    {
      label: "Edit",
      icon: FileIcon,
      items: [
        { label: "Undo", shortcut: "Ctrl+Z", icon: RotateCcw, action: onUndo },
        { label: "Redo", shortcut: "Ctrl+Y", icon: RotateCw, action: onRedo },
        { divider: true },
        { label: "Cut", shortcut: "Ctrl+X", icon: Scissors, action: onCut },
        { label: "Copy", shortcut: "Ctrl+C", icon: Copy, action: onCopy },
        { label: "Paste", shortcut: "Ctrl+V", icon: Clipboard, action: onPaste },
        { divider: true },
        { label: "Find", shortcut: "Ctrl+F", icon: Search, action: onFind },
        { label: "Replace", shortcut: "Ctrl+H", icon: Replace, action: onReplace },
      ],
    },
    {
      label: "Selection",
      icon: FileIcon,
      items: [
        { label: "Select All", shortcut: "Ctrl+A", action: onSelectAll },
        { label: "Expand Selection", shortcut: "Shift+Alt+Right", action: onExpandSelection },
        { label: "Shrink Selection", shortcut: "Shift+Alt+Left", action: onShrinkSelection },
      ],
    },
    {
      label: "View",
      icon: FileIcon,
      items: [
        { label: "Command Palette", shortcut: "Ctrl+Shift+P", icon: Command, action: onCommandPalette },
        { divider: true },
        { label: "Explorer", shortcut: "Ctrl+Shift+E", action: onToggleExplorer },
        { label: "Search", shortcut: "Ctrl+Shift+F", action: onToggleSearch },
        { label: "Source Control", shortcut: "Ctrl+Shift+G", action: onToggleSourceControl },
      ],
    },
    {
      label: "Go",
      icon: FileIcon,
      items: [
        { label: "Back", shortcut: "Alt+Left", icon: ArrowLeft, action: onGoBack },
        { label: "Forward", shortcut: "Alt+Right", icon: ArrowRight, action: onGoForward },
        { divider: true },
        { label: "Go to File", shortcut: "Ctrl+P", action: onGoToFile },
        { label: "Go to Symbol", shortcut: "Ctrl+Shift+O", action: onGoToSymbol },
      ],
    },
    {
      label: "Run",
      icon: Play,
      items: [
        { label: "Start Debugging", shortcut: "F5", icon: Bug, action: onStartDebugging },
        { label: "Run Without Debugging", shortcut: "Ctrl+F5", icon: Play, action: onRunWithoutDebugging },
        { label: "Stop Debugging", shortcut: "Shift+F5", icon: Square, action: onStopDebugging },
        { divider: true },
        { label: "Step Over", shortcut: "F10", icon: StepForward, action: onStepOver },
        { label: "Step Into", shortcut: "F11", icon: ArrowDown, action: onStepInto },
        { label: "Step Out", shortcut: "Shift+F11", icon: ArrowUp, action: onStepOut },
      ],
    },
    {
      label: "Terminal",
      icon: Terminal,
      items: [
        { label: "New Terminal", shortcut: "Ctrl+`", icon: Terminal, action: onNewTerminal },
        { label: "Split Terminal", icon: Layout, action: onSplitTerminal },
        { divider: true },
        { label: "Clear Terminal", action: onClearTerminal },
        { label: "Kill Terminal", icon: Trash2, action: onKillTerminal },
      ],
    },
    {
      label: "Help",
      icon: Info,
      items: [
        { label: "Welcome", action: onShowWelcome },
        { label: "Documentation", icon: BookOpen, action: onShowDocumentation },
        { divider: true },
        { label: "Check for Updates", action: onCheckUpdates },
        { divider: true },
        { label: "About", icon: Info, action: onShowAbout },
      ],
    },
  ]

  const renderMenuItem = (item: MenuItem) => {
    if (item.divider) {
      return <DropdownMenuSeparator key="divider" />
    }

    if (item.submenu) {
      return (
        <DropdownMenuSub key={item.label}>
          <DropdownMenuSubTrigger className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.label}</span>
            </div>
            {item.shortcut && <span className="text-xs text-muted-foreground ml-4">{item.shortcut}</span>}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-[220px]">
            {item.submenu.map((subItem, index) => (
              <div key={index}>{renderMenuItem(subItem)}</div>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )
    }

    if (item.checked !== undefined) {
      return (
        <DropdownMenuCheckboxItem key={item.label} checked={item.checked} onCheckedChange={item.action}>
          <div className="flex items-center gap-2">
            {item.icon && <item.icon className="h-4 w-4" />}
            <span>{item.label}</span>
          </div>
          {item.shortcut && <span className="text-xs text-muted-foreground ml-4">{item.shortcut}</span>}
        </DropdownMenuCheckboxItem>
      )
    }

    return (
      <DropdownMenuItem
        key={item.label}
        disabled={item.disabled}
        onClick={item.action}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {item.icon && <item.icon className="h-4 w-4" />}
          <span>{item.label}</span>
        </div>
        {item.shortcut && <span className="text-xs text-muted-foreground ml-4">{item.shortcut}</span>}
      </DropdownMenuItem>
    )
  }

  return (
    <div className="flex items-center border-b bg-[#333333] text-gray-300">
      <WorkspaceSelector
        workspaces={workspaces}
        currentWorkspaceId={currentWorkspaceId}
        onSwitchWorkspace={onSwitchWorkspace}
        onCreateWorkspace={onCreateWorkspace}
        onDuplicateWorkspace={onDuplicateWorkspace}
        onExportWorkspace={onExportWorkspace}
        onImportWorkspace={onImportWorkspace}
      />
      <div className="flex">
        {menuData.map((category) => (
          <DropdownMenu
            key={category.label}
            open={activeMenu === category.label}
            onOpenChange={(open) => {
              if (open) {
                setActiveMenu(category.label)
              } else if (activeMenu === category.label) {
                setActiveMenu(null)
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                ref={(el) => (menuRefs.current[category.label] = el)}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 text-sm rounded-none",
                  activeMenu === category.label ? "bg-[#3c3c3c]" : "hover:bg-[#3c3c3c]",
                )}
              >
                {category.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[220px] bg-[#252526] border-[#3c3c3c] text-gray-300" align="start">
              {category.items.map((item, index) => (
                <div key={index}>{renderMenuItem(item)}</div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
    </div>
  )
}

// Terminal Component
function TerminalComponent({
  onNewFile,
  onNewFolder,
}: {
  onNewFile: (path: string, content: string) => void
  onNewFolder: (path: string) => void
}) {
  const [commandHistory, setCommandHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("terminalHistory")
    return saved
      ? JSON.parse(saved)
      : ["Welcome to CodeFusion Terminal", "Type 'help' to see available commands"]
  })
  const [currentCommand, setCurrentCommand] = useState("")
  const [historyIndex, setHistoryIndex] = useState(-1)
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [commandHistory])

  useEffect(() => {
    localStorage.setItem("terminalHistory", JSON.stringify(commandHistory))
  }, [commandHistory])

  const executeCommand = (cmd: string) => {
    if (cmd.trim() === "") return

    setCommandHistory((prev) => [...prev, `$ ${cmd}`])
    const command = cmd.trim().toLowerCase()

    if (command === "help") {
      setCommandHistory((prev) => [
        ...prev,
        "Available commands: help, clear, ls, pwd, echo, date, npm, git, mkdir, touch",
      ])
    } else if (command === "clear") {
      setCommandHistory(["Terminal cleared", "Type 'help' to see available commands"])
    } else if (command === "ls") {
      setCommandHistory((prev) => [...prev, "src/ public/ package.json tsconfig.json README.md"])
    } else if (command === "pwd") {
      setCommandHistory((prev) => [...prev, "/home/user/codefusion"])
    } else if (command.startsWith("echo ")) {
      const message = cmd.substring(5)
      setCommandHistory((prev) => [...prev, message])
    } else if (command === "date") {
      setCommandHistory((prev) => [...prev, new Date().toString()])
    } else if (command === "npm start") {
      setCommandHistory((prev) => [...prev, "Starting development server...", "Local: http://localhost:3000"])
    } else if (command === "git status") {
      setCommandHistory((prev) => [
        ...prev,
        "On branch main",
        "Your branch is up to date with 'origin/main'.",
        "nothing to commit, working tree clean",
      ])
    } else if (command.startsWith("mkdir ")) {
      const folderName = cmd.substring(6).trim()
      if (folderName) {
        onNewFolder(`src/${folderName}`)
        setCommandHistory((prev) => [...prev, `Created directory: src/${folderName}`])
      } else {
        setCommandHistory((prev) => [...prev, "mkdir: missing directory name"])
      }
    } else if (command.startsWith("touch ")) {
      const fileName = cmd.substring(6).trim()
      if (fileName) {
        onNewFile(`src/${fileName}`, "")
        setCommandHistory((prev) => [...prev, `Created file: src/${fileName}`])
      } else {
        setCommandHistory((prev) => [...prev, "touch: missing file name"])
      }
    } else {
      setCommandHistory((prev) => [...prev, `Command not found: ${cmd}. Type 'help' for available commands.`])
    }
    setCurrentCommand("")
    setHistoryIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(currentCommand)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1)
      if (newIndex >= 0 && commandHistory[newIndex].startsWith("$ ")) {
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[newIndex].substring(2))
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      const newIndex = Math.max(historyIndex - 1, -1)
      setHistoryIndex(newIndex)
      setCurrentCommand(newIndex >= 0 && commandHistory[newIndex].startsWith("$ ") ? commandHistory[newIndex].substring(2) : "")
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-white font-mono text-sm p-2">
      <div className="flex-1 overflow-auto">
        {commandHistory.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap mb-1">
            {line}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>
      <div className="flex items-center mt-2">
        <span className="text-green-400 mr-2">$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none border-none text-white"
          autoFocus
          placeholder="Type a command..."
        />
      </div>
    </div>
  )
}

// Problems Panel Component
function ProblemsPanel() {
  const problems = [
    { id: 1, type: "error", message: "Cannot find module 'react-router-dom'", file: "src/components/App.tsx", line: 2 },
    {
      id: 2,
      type: "warning",
      message: "Variable 'data' is declared but never used",
      file: "src/hooks/useAuth.ts",
      line: 15,
    },
    { id: 3, type: "info", message: "Consider using const instead of let here", file: "src/index.tsx", line: 5 },
  ]

  return (
    <div className="h-full bg-[#1e1e1e] text-gray-300 text-sm p-2 overflow-y-auto">
      <div className="mb-2 font-semibold">PROBLEMS (3)</div>
      {problems.map((problem) => (
        <div key={problem.id} className="flex items-start py-1 px-2 hover:bg-[#2a2d2e] rounded-sm cursor-pointer">
          {problem.type === "error" ? (
            <AlertCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
          ) : problem.type === "warning" ? (
            <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500 mt-0.5" />
          ) : (
            <Info className="h-4 w-4 mr-2 text-blue-500 mt-0.5" />
          )}
          <div>
            <div>{problem.message}</div>
            <div className="text-gray-500 text-xs">
              {problem.file}:{problem.line}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Storage Manager for IndexedDB and Cloud Sync
const useStorageManager = () => {
  const { toast } = useToast()

  const saveToIndexedDB = async (workspace: Workspace) => {
    try {
      const dbRequest = indexedDB.open("CodeFusionDB", 1)
      dbRequest.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        db.createObjectStore("workspaces", { keyPath: "id" })
      }
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        dbRequest.onsuccess = () => resolve(dbRequest.result)
        dbRequest.onerror = () => reject(dbRequest.error)
      })
      const transaction = db.transaction(["workspaces"], "readwrite")
      const store = transaction.objectStore("workspaces")
      await new Promise<void>((resolve, reject) => {
        const request = store.put(workspace)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      toast({ title: "Saved to Local Storage", description: `Workspace ${workspace.name} saved to IndexedDB.` })
    } catch (error) {
      toast({ title: "Storage Error", description: "Failed to save to IndexedDB.", variant: "destructive" })
    }
  }

  const loadFromIndexedDB = async (workspaceId: string): Promise<Workspace | null> => {
    try {
      const dbRequest = indexedDB.open("CodeFusionDB", 1)
      dbRequest.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        db.createObjectStore("workspaces", { keyPath: "id" })
      }
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        dbRequest.onsuccess = () => resolve(dbRequest.result)
        dbRequest.onerror = () => reject(dbRequest.error)
      })
      const transaction = db.transaction(["workspaces"], "readonly")
      const store = transaction.objectStore("workspaces")
      const request = store.get(workspaceId)
      return await new Promise<Workspace | null>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || null)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      toast({ title: "Storage Error", description: "Failed to load from IndexedDB.", variant: "destructive" })
      return null
    }
  }

  const loadAllWorkspaces = async (): Promise<Workspace[]> => {
    try {
      const dbRequest = indexedDB.open("CodeFusionDB", 1)
      dbRequest.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        db.createObjectStore("workspaces", { keyPath: "id" })
      }
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        dbRequest.onsuccess = () => resolve(dbRequest.result)
        dbRequest.onerror = () => reject(dbRequest.error)
      })
      const transaction = db.transaction(["workspaces"], "readonly")
      const store = transaction.objectStore("workspaces")
      const request = store.getAll()
      return await new Promise<Workspace[]>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || [])
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      toast({ title: "Storage Error", description: "Failed to load workspaces from IndexedDB.", variant: "destructive" })
      return []
    }
  }

  const deleteWorkspace = async (workspaceId: string) => {
    try {
      const dbRequest = indexedDB.open("CodeFusionDB", 1)
      dbRequest.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        db.createObjectStore("workspaces", { keyPath: "id" })
      }
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        dbRequest.onsuccess = () => resolve(dbRequest.result)
        dbRequest.onerror = () => reject(dbRequest.error)
      })
      const transaction = db.transaction(["workspaces"], "readwrite")
      const store = transaction.objectStore("workspaces")
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(workspaceId)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      toast({ title: "Workspace Deleted", description: `Workspace ${workspaceId} deleted from IndexedDB.` })
    } catch (error) {
      toast({ title: "Storage Error", description: "Failed to delete workspace from IndexedDB.", variant: "destructive" })
    }
  }

  const saveToCloud = async (workspace: Workspace) => {
    // Placeholder for cloud sync (e.g., Supabase)
    toast({ title: "Cloud Sync", description: `Workspace ${workspace.name} synced to cloud (stub).` })
  }

  return { saveToIndexedDB, loadFromIndexedDB, loadAllWorkspaces, deleteWorkspace, saveToCloud }
}

// File Manager for Uploads and Downloads
const useFileManager = () => {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const openFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const openFolder = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click()
    }
  }

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    onFileLoad: (file: File, content: string) => void,
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        onFileLoad(file, content)
      }
      reader.readAsText(file)
    }
  }

  const handleFolderSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    onFolderLoad: (files: FileList, fileTree: FileTreeItem[], folderName: string) => void,
  ) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const fileTree: FileTreeItem[] = []
      const paths = Array.from(files).map((file) => file.webkitRelativePath)
      const rootFolderName = paths[0].split("/")[0]

      paths.forEach((path, index) => {
        const parts = path.split("/")
        let currentLevel = fileTree
        parts.forEach((part, partIndex) => {
          if (partIndex === parts.length - 1) {
            const reader = new FileReader()
            reader.onload = (e) => {
              const content = e.target?.result as string
              currentLevel.push({
                id: `file-${Date.now()}-${part}`,
                name: part,
                type: "file",
                path: path,
                language: part.split(".").pop() || "text",
                content,
                isDirty: false,
              })
            }
            reader.readAsText(files[index])
          } else {
            let folder = currentLevel.find((item) => item.name === part && item.type === "folder")
            if (!folder) {
              folder = {
                id: `folder-${Date.now()}-${part}`,
                name: part,
                type: "folder",
                path: parts.slice(0, partIndex + 1).join("/"),
                children: [],
                isOpen: partIndex === 0, // Root folder is open by default
              }
              currentLevel.push(folder)
            }
            currentLevel = folder.children!
          }
        })
      })
      setTimeout(() => onFolderLoad(files, fileTree, rootFolderName), 100)
    }
  }

  const saveFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "File Saved",
      description: `${filename} has been saved successfully.`,
    })
  }

  const saveAs = (content: string, defaultName: string, onSave: (filename: string) => void) => {
    const filename = prompt("Enter filename:", defaultName)
    if (filename) {
      saveFile(content, filename)
      onSave(filename)
    }
  }

  const exportWorkspace = (workspace: Workspace) => {
    const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${workspace.name}.codefusion`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "Workspace Exported",
      description: `Workspace ${workspace.name} has been exported.`,
    })
  }

  const importWorkspace = (onImport: (workspace: Workspace) => void) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".codefusion"
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const workspace = JSON.parse(event.target?.result as string) as Workspace
            onImport(workspace)
            toast({
              title: "Workspace Imported",
              description: `Workspace ${workspace.name} has been imported.`,
            })
          } catch (error) {
            toast({
              title: "Import Failed",
              description: "Invalid workspace file.",
              variant: "destructive",
            })
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return {
    openFile,
    openFolder,
    handleFileSelect,
    handleFolderSelect,
    saveFile,
    saveAs,
    exportWorkspace,
    importWorkspace,
    fileInputRef,
    folderInputRef,
  }
}

const sampleFileTree: FileTreeItem[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    path: "src",
    isOpen: true,
    children: [
      {
        id: "components",
        name: "components",
        type: "folder",
        path: "src/components",
        isOpen: true,
        children: [
          {
            id: "app.tsx",
            name: "App.tsx",
            type: "file",
            path: "src/components/App.tsx",
            language: "typescript",
            content: `import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <h1>Welcome to CodeFusion</h1>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

export default App;`,
          },
          {
            id: "header.tsx",
            name: "Header.tsx",
            type: "file",
            path: "src/components/Header.tsx",
            language: "typescript",
            content: `import React from 'react';

function Header() {
  return (
    <header className="app-header">
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;`,
          },
        ],
      },
      {
        id: "hooks",
        name: "hooks",
        type: "folder",
        path: "src/hooks",
        children: [
          {
            id: "use-auth.ts",
            name: "useAuth.ts",
            type: "file",
            path: "src/hooks/useAuth.ts",
            language: "typescript",
            content: `import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  const login = useCallback(async (username: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // Mock API call
      const response = await new Promise<User>((resolve) =>
        setTimeout(() => resolve({
          id: 'user1',
          username,
          email: \`\${username}@example.com\`,
          role: 'user',
        }), 1000)
      );
      setAuthState({
        user: response,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Login failed. Please check your credentials.',
      }));
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      try {
        // Mock session check
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setAuthState({
            user: JSON.parse(savedUser),
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to verify session.',
        }));
      }
    };
    checkSession();
  }, []);

  return { ...authState, login, logout };
}`,
          },
        ],
      },
      {
        id: "index.tsx",
        name: "index.tsx",
        type: "file",
        path: "src/index.tsx",
        language: "typescript",
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      },
      {
        id: "index.css",
        name: "index.css",
        type: "file",
        path: "src/index.css",
        language: "css",
        content: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #1e1e1e;
  color: #d4d4d4;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

.App {
  text-align: center;
  padding: 20px;
}

.app-header {
  background-color: #252526;
  padding: 10px;
  border-bottom: 1px solid #3c3c3c;
}`,
      },
    ],
  },
  {
    id: "public",
    name: "public",
    type: "folder",
    path: "public",
    children: [
      {
        id: "index.html",
        name: "index.html",
        type: "file",
        path: "public/index.html",
        language: "html",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CodeFusion</title>
    <link rel="stylesheet" href="/index.css" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
      },
    ],
  },
  {
    id: "package.json",
    name: "package.json",
    type: "file",
    path: "package.json",
    language: "json",
    content: `{
  "name": "codefusion-project",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^4.9.5"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}`,
  },
  {
    id: "tsconfig.json",
    name: "tsconfig.json",
    type: "file",
    path: "tsconfig.json",
    language: "json",
    content: `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}`,
  },
  {
    id: "README.md",
    name: "README.md",
    type: "file",
    path: "README.md",
    language: "markdown",
    content: `# CodeFusion Project

Welcome to your CodeFusion project!

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm start
   \`\`\`

## Project Structure

- **src/**: Contains the source code
  - **components/**: React components
  - **hooks/**: Custom React hooks
- **public/**: Static assets
- **package.json**: Project dependencies and scripts
- **tsconfig.json**: TypeScript configuration

## Available Scripts

- \`npm start\`: Runs the app in development mode
- \`npm build\`: Builds the app for production
- \`npm test\`: Launches the test runner
- \`npm eject\`: Ejects from Create React App`,
  },
];

// Main Application Component
function CodeFusionApp() {
  const {
    state: {
      tabs,
      activeTab,
      currentProject,
      currentWorkspaceId,
      workspaces,
      activePanel,
      autoSave,
      zoomLevel,
      isFindReplaceOpen,
      findQuery,
      replaceQuery,
      isCommandPaletteOpen,
      commandQuery,
      isSidebarOpen,
      sidebarWidth,
    },
    setTabs,
    setActiveTab,
    updateProject,
    setWorkspaces,
    setCurrentWorkspaceId,
    setActivePanel,
    setAutoSave,
    setZoomLevel,
    setFindReplaceOpen,
    setFindQuery,
    setReplaceQuery,
    setCommandPaletteOpen,
    setCommandQuery,
    toggleSidebar,
    setSidebarWidth,
  } = useAppState();
  const { saveToIndexedDB, loadFromIndexedDB, loadAllWorkspaces, deleteWorkspace, saveToCloud } = useStorageManager();
  const {
    openFile,
    openFolder,
    handleFileSelect,
    handleFolderSelect,
    saveFile,
    saveAs,
    exportWorkspace,
    importWorkspace,
    fileInputRef,
    folderInputRef,
  } = useFileManager();
  const { requireAuth } = useRequireAuth();
  const { toast } = useToast();
  const [editorHistory, setEditorHistory] = useState<Map<string, string[]>>(new Map());
  const [editorHistoryIndex, setEditorHistoryIndex] = useState<Map<string, number>>(new Map());
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);
  const [splitViewTab, setSplitViewTab] = useState<EditorTab | null>(null);
  const editorRef = useRef<any>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Initialize workspaces
  useEffect(() => {
    const initializeWorkspaces = async () => {
      const loadedWorkspaces = await loadAllWorkspaces();
      if (loadedWorkspaces.length === 0) {
        const defaultWorkspace: Workspace = {
          id: `workspace-${Date.now()}`,
          name: "My Project",
          project: {
            id: `project-${Date.now()}`,
            name: "My Project",
            files: sampleFileTree,
            lastModified: new Date().toISOString(),
          },
          createdAt: new Date().toISOString(),
          syncStatus: "local",
        };
        setWorkspaces([defaultWorkspace]);
        setCurrentWorkspaceId(defaultWorkspace.id);
        updateProject(defaultWorkspace.project);
        await saveToIndexedDB(defaultWorkspace);
      } else {
        setWorkspaces(loadedWorkspaces);
        setCurrentWorkspaceId(loadedWorkspaces[0].id);
        updateProject(loadedWorkspaces[0].project);
      }
    };
    initializeWorkspaces();
  }, [setWorkspaces, setCurrentWorkspaceId, updateProject, saveToIndexedDB, loadAllWorkspaces]);

  // Auto-save effect
  useEffect(() => {
    if (autoSave && currentWorkspaceId && currentProject) {
      const interval = setInterval(async () => {
        const workspace = await loadFromIndexedDB(currentWorkspaceId);
        if (workspace) {
          workspace.project = currentProject;
          workspace.lastModified = new Date().toISOString();
          await saveToIndexedDB(workspace);
          await saveToCloud(workspace);
        }
      }, 30000); // Save every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoSave, currentWorkspaceId, currentProject, saveToIndexedDB, saveToCloud, loadFromIndexedDB]);

  // Handle sidebar resizing
  const handleSidebarDrag = useCallback(
    (e: MouseEvent) => {
      if (isDraggingSidebar && sidebarRef.current) {
        const newWidth = e.clientX;
        if (newWidth >= 200 && newWidth <= 500) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isDraggingSidebar, setSidebarWidth],
  );

  const stopSidebarDrag = useCallback(() => {
    setIsDraggingSidebar(false);
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleSidebarDrag);
    document.addEventListener("mouseup", stopSidebarDrag);
    return () => {
      document.removeEventListener("mousemove", handleSidebarDrag);
      document.removeEventListener("mouseup", stopSidebarDrag);
    };
  }, [handleSidebarDrag, stopSidebarDrag]);

  // File and Folder Operations
  const handleNewFile = useCallback(
    (path: string, content: string) => {
      if (!currentProject) return;
      const pathParts = path.split("/");
      const fileName = pathParts.pop()!;
      let currentLevel = currentProject.files;
      pathParts.forEach((part) => {
        const folder = currentLevel.find((item) => item.name === part && item.type === "folder");
        if (!folder) {
          const newFolder: FileTreeItem = {
            id: `folder-${Date.now()}-${part}`,
            name: part,
            type: "folder",
            path: pathParts.slice(0, pathParts.indexOf(part) + 1).join("/"),
            children: [],
            isOpen: true,
          };
          currentLevel.push(newFolder);
          currentLevel = newFolder.children!;
        } else {
          currentLevel = folder.children!;
        }
      });
      currentLevel.push({
        id: `file-${Date.now()}-${fileName}`,
        name: fileName,
        type: "file",
        path,
        language: fileName.split(".").pop() || "text",
        content,
        isDirty: false,
      });
      updateProject({ ...currentProject });
      setTabs([...tabs, { id: path, name: fileName, path, language: fileName.split(".").pop() || "text", content: "" }]);
      setActiveTab(path);
      toast({ title: "File Created", description: `Created ${fileName}` });
    },
    [currentProject, updateProject, setTabs, tabs, setActiveTab, toast],
  );

  const handleNewFolder = useCallback(
    (path: string) => {
      if (!currentProject) return;
      const pathParts = path.split("/");
      const folderName = pathParts.pop()!;
      let currentLevel = currentProject.files;
      pathParts.forEach((part) => {
        const folder = currentLevel.find((item) => item.name === part && item.type === "folder");
        if (!folder) {
          const newFolder: FileTreeItem = {
            id: `folder-${Date.now()}-${part}`,
            name: part,
            type: "folder",
            path: pathParts.slice(0, pathParts.indexOf(part) + 1).join("/"),
            children: [],
            isOpen: true,
          };
          currentLevel.push(newFolder);
          currentLevel = newFolder.children!;
        } else {
          currentLevel = folder.children!;
        }
      });
      currentLevel.push({
        id: `folder-${Date.now()}-${folderName}`,
        name: folderName,
        type: "folder",
        path,
        children: [],
        isOpen: true,
      });
      updateProject({ ...currentProject });
      toast({ title: "Folder Created", description: `Created ${folderName}` });
    },
    [currentProject, updateProject, toast],
  );

  const handleRename = useCallback(
    (path: string, newName: string) => {
      if (!currentProject) return;
      const findNode = (nodes: FileTreeItem[], targetPath: string): FileTreeItem | null => {
        for (const node of nodes) {
          if (node.path === targetPath) return node;
          if (node.type === "folder" && node.children) {
            const found = findNode(node.children, targetPath);
            if (found) return found;
          }
        }
        return null;
      };
      const node = findNode(currentProject.files, path);
      if (node) {
        const oldPath = node.path;
        const pathParts = oldPath.split("/");
        pathParts[pathParts.length - 1] = newName;
        const newPath = pathParts.join("/");
        node.name = newName;
        node.path = newPath;
        if (node.type === "file") {
          const tab = tabs.find((t) => t.path === oldPath);
          if (tab) {
            setTabs(
              tabs.map((t) =>
                t.path === oldPath
                  ? { ...t, name: newName, path: newPath, language: newName.split(".").pop() || "text" }
                  : t,
              ),
            );
            if (activeTab === oldPath) {
              setActiveTab(newPath);
            }
          }
        } else if (node.type === "folder" && node.children) {
          const updateChildPaths = (children: FileTreeItem[], parentPath: string) => {
            children.forEach((child) => {
              child.path = `${parentPath}/${child.name}`;
              if (child.type === "folder" && child.children) {
                updateChildPaths(child.children, child.path);
              }
              const tab = tabs.find((t) => t.path === child.path);
              if (tab) {
                setTabs(
                  tabs.map((t) =>
                    t.path === child.path
                      ? { ...t, path: child.path, name: child.name, language: child.name.split(".").pop() || "text" }
                      : t,
                  ),
                );
                if (activeTab === child.path) {
                  setActiveTab(child.path);
                }
              }
            });
          };
          updateChildPaths(node.children, newPath);
        }
        updateProject({ ...currentProject });
        toast({ title: "Renamed", description: `Renamed to ${newName}` });
      }
    },
    [currentProject, updateProject, tabs, setTabs, activeTab, setActiveTab, toast],
  );

  const handleDelete = useCallback(
    (path: string) => {
      if (!currentProject) return;
      const removeNode = (nodes: FileTreeItem[]): FileTreeItem[] => {
        return nodes.filter((node) => {
          if (node.path === path) return false;
          if (node.type === "folder" && node.children) {
            node.children = removeNode(node.children);
          }
          return true;
        });
      };
      const updatedFiles = removeNode(currentProject.files);
      updateProject({ ...currentProject, files: updatedFiles });
      setTabs(tabs.filter((t) => t.path !== path));
      if (activeTab === path) {
        setActiveTab(tabs.length > 1 ? tabs[0].path : null);
      }
      toast({ title: "Deleted", description: `Deleted ${path.split("/").pop()}` });
    },
    [currentProject, updateProject, tabs, setTabs, activeTab, setActiveTab, toast],
  );

  const handleConvertToFolder = useCallback(
    (path: string) => {
      if (!currentProject) return;
      const findNode = (nodes: FileTreeItem[]): FileTreeItem | null => {
        for (const node of nodes) {
          if (node.path === path) return node;
          if (node.type === "folder" && node.children) {
            const found = findNode(node.children);
            if (found) return found;
          }
        }
        return null;
      };
      const node = findNode(currentProject.files);
      if (node && node.type === "file") {
        node.type = "folder";
        node.children = [];
        node.isOpen = true;
        delete node.content;
        delete node.language;
        updateProject({ ...currentProject });
        setTabs(tabs.filter((t) => t.path !== path));
        if (activeTab === path) {
          setActiveTab(tabs.length > 1 ? tabs[0].path : null);
        }
        toast({ title: "Converted to Folder", description: `${node.name} is now a folder` });
      }
    },
    [currentProject, updateProject, tabs, setTabs, activeTab, setActiveTab, toast],
  );

  const handleConvertToFile = useCallback(
    (path: string) => {
      if (!currentProject) return;
      const findNode = (nodes: FileTreeItem[]): FileTreeItem | null => {
        for (const node of nodes) {
          if (node.path === path) return node;
          if (node.type === "folder" && node.children) {
            const found = findNode(node.children);
            if (found) return found;
          }
        }
        return null;
      };
      const node = findNode(currentProject.files);
      if (node && node.type === "folder") {
        if (node.children && node.children.length > 0) {
          toast({
            title: "Cannot Convert",
            description: "Cannot convert a non-empty folder to a file.",
            variant: "destructive",
          });
          return;
        }
        node.type = "file";
        node.language = node.name.split(".").pop() || "text";
        node.content = "";
        node.isDirty = false;
        delete node.children;
        delete node.isOpen;
        updateProject({ ...currentProject });
        setTabs([...tabs, { id: node.path, name: node.name, path: node.path, language: node.language, content: "" }]);
        setActiveTab(node.path);
        toast({ title: "Converted to File", description: `${node.name} is now a file` });
      }
    },
    [currentProject, updateProject, tabs, setTabs, setActiveTab, toast],
  );

  const handleFileSelectFromExplorer = useCallback(
    (path: string) => {
      if (!currentProject) return;
      const findNode = (nodes: FileTreeItem[]): FileTreeItem | null => {
        for (const node of nodes) {
          if (node.path === path) return node;
          if (node.type === "folder" && node.children) {
            const found = findNode(node.children);
            if (found) return found;
          }
        }
        return null;
      };
      const node = findNode(currentProject.files);
      if (node && node.type === "file") {
        const existingTab = tabs.find((t) => t.path === path);
        if (!existingTab) {
          setTabs([...tabs, { id: path, name: node.name, path, language: node.language || "text", content: node.content || "" }]);
        }
        setActiveTab(path);
      }
    },
    [currentProject, tabs, setTabs, setActiveTab],
  );

  const handleFileChange = useCallback(
    (path: string, content: string) => {
      if (!currentProject) return;
      const findNode = (nodes: FileTreeItem[]): FileTreeItem | null => {
        for (const node of nodes) {
          if (node.path === path) return node;
          if (node.type === "folder" && node.children) {
            const found = findNode(node.children);
            if (found) return found;
          }
        }
        return null;
      };
      const node = findNode(currentProject.files);
      if (node && node.type === "file") {
        node.content = content;
        node.isDirty = true;
        updateProject({ ...currentProject });
        setTabs(
          tabs.map((t) => (t.path === path ? { ...t, content, isDirty: true } : t)),
        );
        const history = editorHistory.get(path) || [];
        history.push(content);
        setEditorHistory(new Map(editorHistory.set(path, history.slice(-50))));
        setEditorHistoryIndex(new Map(editorHistoryIndex.set(path, history.length - 1)));
      }
    },
    [currentProject, updateProject, tabs, setTabs, editorHistory, editorHistoryIndex],
  );

  const handleSave = useCallback(async () => {
    if (!currentWorkspaceId || !currentProject) return;
    const workspace = await loadFromIndexedDB(currentWorkspaceId);
    if (workspace) {
      workspace.project = {
        ...currentProject,
        files: currentProject.files.map((node) => ({
          ...node,
          isDirty: false,
          children: node.children
            ? node.children.map((child) => ({ ...child, isDirty: false }))
            : undefined,
        })),
        lastModified: new Date().toISOString(),
      };
      await saveToIndexedDB(workspace);
      await saveToCloud(workspace);
      updateProject(workspace.project);
      setTabs(tabs.map((t) => ({ ...t, isDirty: false })));
      toast({ title: "Saved", description: "All changes have been saved." });
    }
  }, [currentWorkspaceId, currentProject, loadFromIndexedDB, saveToIndexedDB, saveToCloud, updateProject, tabs, setTabs, toast]);

  const handleSaveAs = useCallback(
    async (newName: string) => {
      if (!currentWorkspaceId || !currentProject) return;
      const workspace = await loadFromIndexedDB(currentWorkspaceId);
      if (workspace) {
        const newWorkspace: Workspace = {
          id: `workspace-${Date.now()}`,
          name: newName,
          project: {
            ...currentProject,
            id: `project-${Date.now()}`,
            name: newName,
            lastModified: new Date().toISOString(),
          },
          createdAt: new Date().toISOString(),
          syncStatus: "local",
        };
        setWorkspaces([...workspaces, newWorkspace]);
        setCurrentWorkspaceId(newWorkspace.id);
        updateProject(newWorkspace.project);
        await saveToIndexedDB(newWorkspace);
        await saveToCloud(newWorkspace);
        toast({ title: "Saved As", description: `Workspace saved as ${newName}` });
      }
    },
    [
      currentWorkspaceId,
      currentProject,
      loadFromIndexedDB,
      workspaces,
      setWorkspaces,
      setCurrentWorkspaceId,
      updateProject,
      saveToIndexedDB,
      saveToCloud,
      toast,
    ],
  );

  const handleCreateWorkspace = useCallback(async () => {
    const newWorkspace: Workspace = {
      id: `workspace-${Date.now()}`,
      name: `New Workspace ${workspaces.length + 1}`,
      project: {
        id: `project-${Date.now()}`,
        name: `New Project ${workspaces.length + 1}`,
        files: [],
        lastModified: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      syncStatus: "local",
    };
    setWorkspaces([...workspaces, newWorkspace]);
    setCurrentWorkspaceId(newWorkspace.id);
    updateProject(newWorkspace.project);
    await saveToIndexedDB(newWorkspace);
    await saveToCloud(newWorkspace);
    toast({ title: "Workspace Created", description: `Created ${newWorkspace.name}` });
  }, [workspaces, setWorkspaces, setCurrentWorkspaceId, updateProject, saveToIndexedDB, saveToCloud, toast]);

  const handleSwitchWorkspace = useCallback(
    async (workspaceId: string) => {
      const workspace = await loadFromIndexedDB(workspaceId);
      if (workspace) {
        setCurrentWorkspaceId(workspaceId);
        updateProject(workspace.project);
        setTabs([]);
        setActiveTab(null);
        setEditorHistory(new Map());
        setEditorHistoryIndex(new Map());
        toast({ title: "Workspace Switched", description: `Switched to ${workspace.name}` });
      }
    },
    [setCurrentWorkspaceId, updateProject, setTabs, setActiveTab, toast, loadFromIndexedDB],
  );

  const handleDuplicateWorkspace = useCallback(
    async (workspaceId: string) => {
      const workspace = await loadFromIndexedDB(workspaceId);
      if (workspace) {
        const newWorkspace: Workspace = {
          ...workspace,
          id: `workspace-${Date.now()}`,
          name: `${workspace.name} (Copy)`,
          project: {
            ...workspace.project,
            id: `project-${Date.now()}`,
            name: `${workspace.project.name} (Copy)`,
            lastModified: new Date().toISOString(),
          },
          createdAt: new Date().toISOString(),
          syncStatus: "local",
        };
        setWorkspaces([...workspaces, newWorkspace]);
        setCurrentWorkspaceId(newWorkspace.id);
        updateProject(newWorkspace.project);
        await saveToIndexedDB(newWorkspace);
        await saveToCloud(newWorkspace);
        toast({ title: "Workspace Duplicated", description: `Created ${newWorkspace.name}` });
      }
    },
    [workspaces, setWorkspaces, setCurrentWorkspaceId, updateProject, saveToIndexedDB, saveToCloud, toast, loadFromIndexedDB],
  );

  const handleExportWorkspace = useCallback(
    (workspaceId: string) => {
      const workspace = workspaces.find((w) => w.id === workspaceId);
      if (workspace) {
        exportWorkspace(workspace);
      }
    },
    [workspaces, exportWorkspace],
  );

  const handleImportWorkspace = useCallback(
    (workspace: Workspace) => {
      const newWorkspace = {
        ...workspace,
        id: `workspace-${Date.now()}`,
        project: {
          ...workspace.project,
          id: `project-${Date.now()}`,
          lastModified: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        syncStatus: "local",
      };
      setWorkspaces([...workspaces, newWorkspace]);
      setCurrentWorkspaceId(newWorkspace.id);
      updateProject(newWorkspace.project);
      saveToIndexedDB(newWorkspace);
      saveToCloud(newWorkspace);
    },
    [workspaces, setWorkspaces, setCurrentWorkspaceId, updateProject, saveToIndexedDB, saveToCloud],
  );

  const handleOpenFile = useCallback(() => {
    if (requireAuth("open-file")) {
      openFile();
    }
  }, [requireAuth, openFile]);

  const handleOpenFolder = useCallback(() => {
    if (requireAuth("open-folder")) {
      openFolder();
    }
  }, [requireAuth, openFolder]);

  const handleFileLoad = useCallback(
    (file: File, content: string) => {
      if (!currentProject) return;
      const path = `src/${file.name}`;
      handleNewFile(path, content);
    },
    [currentProject, handleNewFile],
  );

  const handleFolderLoad = useCallback(
    (files: FileList, fileTree: FileTreeItem[], folderName: string) => {
      const newWorkspace: Workspace = {
        id: `workspace-${Date.now()}`,
        name: folderName,
        project: {
          id: `project-${Date.now()}`,
          name: folderName,
          files: fileTree,
          lastModified: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        syncStatus: "local",
      };
      setWorkspaces([...workspaces, newWorkspace]);
      setCurrentWorkspaceId(newWorkspace.id);
      updateProject(newWorkspace.project);
      saveToIndexedDB(newWorkspace);
      saveToCloud(newWorkspace);
      toast({ title: "Folder Loaded", description: `Loaded folder ${folderName}` });
    },
    [workspaces, setWorkspaces, setCurrentWorkspaceId, updateProject, saveToIndexedDB, saveToCloud, toast],
  );

  const handleCloseTab = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (tab?.isDirty) {
        if (!confirm(`Unsaved changes in ${tab.name}. Close without saving?`)) {
          return;
        }
      }
      const newTabs = tabs.filter((t) => t.id !== tabId);
      setTabs(newTabs);
      if (activeTab === tabId) {
        setActiveTab(newTabs.length > 0 ? newTabs[0].id : null);
      }
    },
    [tabs, activeTab, setTabs, setActiveTab],
  );

  const handleUndo = useCallback(() => {
    if (!activeTab) return;
    const history = editorHistory.get(activeTab) || [];
    const currentIndex = editorHistoryIndex.get(activeTab) || 0;
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const content = history[newIndex];
      handleFileChange(activeTab, content);
      setEditorHistoryIndex(new Map(editorHistoryIndex.set(activeTab, newIndex)));
    }
  }, [activeTab, editorHistory, editorHistoryIndex, handleFileChange]);

  const handleRedo = useCallback(() => {
    if (!activeTab) return;
    const history = editorHistory.get(activeTab) || [];
    const currentIndex = editorHistoryIndex.get(activeTab) || 0;
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      const content = history[newIndex];
      handleFileChange(activeTab, content);
      setEditorHistoryIndex(new Map(editorHistoryIndex.set(activeTab, newIndex)));
    }
  }, [activeTab, editorHistory, editorHistoryIndex, handleFileChange]);

  const handleFind = useCallback(() => {
    setFindReplaceOpen(true);
  }, [setFindReplaceOpen]);

  const handleReplace = useCallback(() => {
    setFindReplaceOpen(true);
  }, [setFindReplaceOpen]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  }, [setZoomLevel]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  }, [setZoomLevel]);

  const handleSplitView = useCallback(() => {
    if (activeTab) {
      setIsSplitView(true);
      setSplitViewTab(tabs.find((t) => t.id === activeTab) || null);
    }
  }, [activeTab, tabs]);

  const handleCloseSplitView = useCallback(() => {
    setIsSplitView(false);
    setSplitViewTab(null);
  }, []);

  const handleCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true);
  }, [setCommandPaletteOpen]);

  const executeCommandFromPalette = useCallback(
    (command: string) => {
      const normalizedCommand = command.toLowerCase().trim();
      if (normalizedCommand === "new file") {
        handleNewFile(`src/new-file-${Date.now()}.txt`, "");
      } else if (normalizedCommand === "new folder") {
        handleNewFolder(`src/new-folder-${Date.now()}`);
      } else if (normalizedCommand === "save") {
        handleSave();
      } else if (normalizedCommand === "save as") {
        handleSaveAs(`Project-${Date.now()}`);
      } else if (normalizedCommand === "zoom in") {
        handleZoomIn();
      } else if (normalizedCommand === "zoom out") {
        handleZoomOut();
      } else if (normalizedCommand === "split editor") {
        handleSplitView();
      } else if (normalizedCommand === "close split") {
        handleCloseSplitView();
      } else {
        toast({ title: "Unknown Command", description: `Command "${command}" not found.` });
      }
      setCommandPaletteOpen(false);
      setCommandQuery("");
    },
    [
      handleNewFile,
      handleNewFolder,
      handleSave,
      handleSaveAs,
      handleZoomIn,
      handleZoomOut,
      handleSplitView,
      handleCloseSplitView,
      toast,
      setCommandPaletteOpen,
      setCommandQuery,
    ],
  );

  const handleTabContextMenu = useCallback(
    (tabId: string) => {
      return (
        <ContextMenuContent className="bg-[#252526] border-[#3c3c3c]">
          <ContextMenuItem onClick={() => handleCloseTab(tabId)}>
            <X className="w-4 h-4 mr-2" />
            Close
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setTabs(tabs.filter(t => t.id === tabId))}>
            <X className="w-4 h-4 mr-2" />
            Close Others
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setTabs([])}>
            <X className="w-4 h-4 mr-2" />
            Close All
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => saveFile(tabs.find((t) => t.id === tabId)?.content || "", tabs.find((t) => t.id === tabId)?.name || "file.txt")}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() =>
              saveAs(
                tabs.find((t) => t.id === tabId)?.content || "",
                tabs.find((t) => t.id === tabId)?.name || "file.txt",
                (filename) => {
                  handleRename(tabId, filename);
                },
              )
            }
          >
            <Save className="w-4 h-4 mr-2" />
            Save As...
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleSplitView}>
            <Split className="w-4 h-4 mr-2" />
            Split Editor
          </ContextMenuItem>
        </ContextMenuContent>
      );
    },
    [tabs, handleCloseTab, setTabs, saveFile, saveAs, handleRename, handleSplitView],
  );

  if (!currentProject) {
    return (
      <div className="h-screen bg-[#1e1e1e] flex items-center justify-center text-gray-300">
        <div className="text-center">
          <Folder className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="text-xl mb-4">Welcome to CodeFusion</h2>
          <p className="text-sm mb-6">Open a folder or create a new workspace to start coding.</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleOpenFolder} className="bg-[#007acc] hover:bg-[#005f99]">
              <Folder className="w-4 h-4 mr-2" />
              Open Folder
            </Button>
            <Button onClick={handleCreateWorkspace} className="bg-[#007acc] hover:bg-[#005f99]">
              <Plus className="w-4 h-4 mr-2" />
              New Workspace
            </Button>
          </div>
          <input
            type="file"
            ref={folderInputRef}
            onChange={(e) => handleFolderSelect(e, handleFolderLoad)}
            style={{ display: "none" }}
            // @ts-ignore
            webkitdirectory="true"
            directory=""
            multiple
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-gray-300 font-sans" style={{ fontSize: `${zoomLevel * 14}px` }}>
      {/* Menu Bar */}
      <VSCodeMenu
        onNewFile={() => handleNewFile(`src/new-file-${Date.now()}.txt`, "")}
        onOpenFile={handleOpenFile}
        onOpenFolder={handleOpenFolder}
        onSave={handleSave}
        onSaveAs={() => handleSaveAs(`Project-${Date.now()}`)}
        onSaveAll={handleSave}
        autoSave={autoSave}
        onToggleAutoSave={() => setAutoSave(!autoSave)}
        onNewWindow={() => window.open(window.location.href, "_blank")}
        onOpenWorkspace={() => toast({ title: "Not Implemented", description: "Workspace opening not yet implemented." })}
        onOpenRecent={() => toast({ title: "Not Implemented", description: "Recent files not yet implemented." })}
        onAddFolderToWorkspace={handleOpenFolder}
        onRevertFile={() => toast({ title: "Not Implemented", description: "File revert not yet implemented." })}
        onCloseEditor={() => activeTab && handleCloseTab(activeTab)}
        onCloseFolder={() => {
          setCurrentWorkspaceId(null);
          updateProject(null);
          setTabs([]);
          setActiveTab(null);
        }}
        onCloseWindow={() => window.close()}
        onExit={() => window.close()}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCut={() => editorRef.current?.cut()}
        onCopy={() => editorRef.current?.copy()}
        onPaste={() => editorRef.current?.paste()}
        onFind={handleFind}
        onReplace={handleReplace}
        onSelectAll={() => editorRef.current?.selectAll()}
        onExpandSelection={() => toast({ title: "Not Implemented", description: "Expand selection not yet implemented." })}
        onShrinkSelection={() => toast({ title: "Not Implemented", description: "Shrink selection not yet implemented." })}
        onCommandPalette={handleCommandPalette}
        onToggleExplorer={() => toggleSidebar()}
        onToggleSearch={() => setFindReplaceOpen(true)}
        onToggleSourceControl={() => toast({ title: "Not Implemented", description: "Source control not yet implemented." })}
        onGoBack={() => toast({ title: "Not Implemented", description: "Go back not yet implemented." })}
        onGoForward={() => toast({ title: "Not Implemented", description: "Go forward not yet implemented." })}
        onGoToFile={() => handleCommandPalette()}
        onGoToSymbol={() => toast({ title: "Not Implemented", description: "Go to symbol not yet implemented." })}
        onStartDebugging={() => toast({ title: "Not Implemented", description: "Debugging not yet implemented." })}
        onRunWithoutDebugging={() => toast({ title: "Not Implemented", description: "Run without debugging not yet implemented." })}
        onStopDebugging={() => toast({ title: "Not Implemented", description: "Stop debugging not yet implemented." })}
        onStepOver={() => toast({ title: "Not Implemented", description: "Step over not yet implemented." })}
        onStepInto={() => toast({ title: "Not Implemented", description: "Step into not yet implemented." })}
        onStepOut={() => toast({ title: "Not Implemented", description: "Step out not yet implemented." })}
        onNewTerminal={() => setActivePanel("terminal")}
        onSplitTerminal={() => toast({ title: "Not Implemented", description: "Split terminal not yet implemented." })}
        onClearTerminal={() => toast({ title: "Not Implemented", description: "Clear terminal not yet implemented." })}
        onKillTerminal={() => setActivePanel(null)}
        onShowWelcome={() => toast({ title: "Not Implemented", description: "Welcome page not yet implemented." })}
        onShowDocumentation={() => window.open("https://codefusion-docs.example.com", "_blank")}
        onCheckUpdates={() => toast({ title: "Not Implemented", description: "Check for updates not yet implemented." })}
        onShowAbout={() => toast({ title: "About CodeFusion", description: "Version 1.0.0" })}
        onCreateWorkspace={handleCreateWorkspace}
        onSwitchWorkspace={handleSwitchWorkspace}
        onDuplicateWorkspace={handleDuplicateWorkspace}
        onExportWorkspace={handleExportWorkspace}
        onImportWorkspace={() => importWorkspace(handleImportWorkspace)}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {isSidebarOpen && (
          <div
            ref={sidebarRef}
            className="bg-[#252526] border-r border-[#3c3c3c] flex flex-col relative"
            style={{ width: `${sidebarWidth}px`, minWidth: "200px", maxWidth: "500px" }}
          >
            <ProjectExplorer
              onFileSelect={handleFileSelectFromExplorer}
              onNewFile={handleNewFile}
              onNewFolder={handleNewFolder}
              onRename={handleRename}
              onDelete={handleDelete}
              onConvertToFolder={handleConvertToFolder}
              onConvertToFile={handleConvertToFile}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-1 bg-[#3c3c3c] cursor-col-resize"
              onMouseDown={() => setIsDraggingSidebar(true)}
            />
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Toolbar */}
          <EditorToolbar
            onSave={handleSave}
            onSaveAs={handleSaveAs}
            projectName={currentProject.name}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onCut={() => editorRef.current?.cut()}
            onCopy={() => editorRef.current?.copy()}
            onPaste={() => editorRef.current?.paste()}
            onFind={handleFind}
            onReplace={handleReplace}
            canUndo={activeTab ? (editorHistoryIndex.get(activeTab) || 0) > 0 : false}
            canRedo={activeTab ? (editorHistoryIndex.get(activeTab) || 0) < (editorHistory.get(activeTab)?.length || 0) - 1 : false}
          />

          {/* Tabs */}
          {tabs.length > 0 && (
            <div className="h-10 bg-[#252526] border-b border-[#3c3c3c] flex items-center px-2 overflow-x-auto">
              {tabs.map((tab) => (
                <ContextMenu key={tab.id}>
                  <ContextMenuTrigger>
                    <div
                      className={cn(
                        "h-8 flex items-center px-3 mr-1 rounded-t-md cursor-pointer",
                        activeTab === tab.id ? "bg-[#1e1e1e] text-gray-300" : "bg-[#2a2d2e] text-gray-500 hover:bg-[#37373d]",
                      )}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span className="text-sm truncate">{tab.name}</span>
                      {tab.isDirty && <span className="text-orange-400 ml-2">â€¢</span>}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 w-5 h-5 p-0 hover:bg-[#3c3c3c]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseTab(tab.id);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </ContextMenuTrigger>
                  {handleTabContextMenu(tab.id)}
                </ContextMenu>
              ))}
              <div className="flex-1" />
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="w-6 h-6 p-0" onClick={handleSplitView}>
                  <Split className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="w-6 h-6 p-0" onClick={handleZoomIn}>
                  <ZoomIn className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="w-6 h-6 p-0" onClick={handleZoomOut}>
                  <ZoomOut className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Editor Content */}
          <div className="flex-1 flex overflow-hidden">
            <div className={cn("flex-1", isSplitView ? "w-1/2" : "w-full")}>
              {activeTab ? (
                <CodeEditor
                  value={tabs.find((t) => t.id === activeTab)?.content || ""}
                  language={tabs.find((t) => t.id === activeTab)?.language || "text"}
                  height="100%"
                  onChange={(value) => handleFileChange(activeTab, value)}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>No file open. Select a file from the explorer or create a new one.</p>
                </div>
              )}
            </div>
            {isSplitView && splitViewTab && (
              <div className="w-1/2 border-l border-[#3c3c3c]">
                <div className="h-10 bg-[#252526] border-b border-[#3c3c3c] flex items-center px-2">
                  <span className="text-sm text-gray-300">{splitViewTab.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto w-5 h-5 p-0 hover:bg-[#3c3c3c]"
                    onClick={handleCloseSplitView}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <CodeEditor
                  value={splitViewTab.content}
                  language={splitViewTab.language}
                  height="100%"
                  readOnly={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      {activePanel && (
        <div className="h-1/3 bg-[#1e1e1e] border-t border-[#3c3c3c] flex flex-col">
          <div className="h-8 bg-[#252526] border-b border-[#3c3c3c] flex items-center px-2">
            <Tabs
              value={activePanel}
              onValueChange={(value) => setActivePanel(value as "terminal" | "problems" | null)}
              className="flex items-center"
            >
              <TabsList className="bg-transparent">
                <TabsTrigger value="terminal" className="text-gray-300 data-[state=active]:bg-[#1e1e1e]">
                  <Terminal className="w-4 h-4 mr-1" />
                  Terminal
                </TabsTrigger>
                <TabsTrigger value="problems" className="text-gray-300 data-[state=active]:bg-[#1e1e1e]">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Problems
                </TabsTrigger>
              </TabsList>
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0 hover:bg-[#3c3c3c]"
                onClick={() => setActivePanel(null)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Tabs>
          </div>
          <TabsContent value="terminal" className="flex-1 m-0">
            <TerminalComponent onNewFile={handleNewFile} onNewFolder={handleNewFolder} />
          </TabsContent>
          <TabsContent value="problems" className="flex-1 m-0">
            <ProblemsPanel />
          </TabsContent>
        </div>
      )}

      {/* Find/Replace Dialog */}
      <Dialog open={isFindReplaceOpen} onOpenChange={setFindReplaceOpen}>
        <DialogContent className="bg-[#252526] border-[#3c3c3c]">
          <DialogHeader>
            <DialogTitle className="text-white">Find and Replace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Find</label>
              <Input
                value={findQuery}
                onChange={(e) => setFindQuery(e.target.value)}
                placeholder="Enter search term..."
                className="bg-[#3c3c3c] border-[#3c3c3c] text-white"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Replace</label>
              <Input
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Enter replacement..."
                className="bg-[#3c3c3c] border-[#3c3c3c] text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFindReplaceOpen(false)}
              className="bg-transparent border-[#3c3c3c]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (activeTab) {
                  const tab = tabs.find((t) => t.id === activeTab);
                  if (tab && findQuery) {
                    const newContent = tab.content.replace(new RegExp(findQuery, "g"), replaceQuery);
                    handleFileChange(activeTab, newContent);
                    toast({ title: "Replace", description: `Replaced "${findQuery}" with "${replaceQuery}"` });
                  }
                }
                setFindReplaceOpen(false);
              }}
              className="bg-[#007acc] hover:bg-[#005f99]"
            >
              Replace All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Command Palette */}
      <Dialog open={isCommandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
        <DialogContent className="bg-[#252526] border-[#3c3c3c] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Command Palette</DialogTitle>
          </DialogHeader>
          <Input
            value={commandQuery}
            onChange={(e) => setCommandQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="bg-[#3c3c3c] border-[#3c3c3c] text-white"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                executeCommandFromPalette(commandQuery);
              }
            }}
          />
          <div className="mt-2 max-h-64 overflow-y-auto">
            {[
              "New File",
              "New Folder",
              "Save",
              "Save As",
              "Zoom In",
              "Zoom Out",
              "Split Editor",
              "Close Split",
            ].filter((cmd) => cmd.toLowerCase().includes(commandQuery.toLowerCase())).map((cmd) => (
              <div
                key={cmd}
                className="py-2 px-4 hover:bg-[#3c3c3c] cursor-pointer text-gray-300"
                onClick={() => executeCommandFromPalette(cmd)}
              >
                {cmd}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileSelect(e, handleFileLoad)}
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={(e) => handleFolderSelect(e, handleFolderLoad)}
        style={{ display: "none" }}
        // @ts-ignore
        webkitdirectory="true"
        directory=""
        multiple
      />
    </div>
  );
}

// Root Component
export default function App() {
  return (
    <AppStateProvider>
      <CodeFusionApp />
    </AppStateProvider>
  );
}
