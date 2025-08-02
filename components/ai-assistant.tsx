"use client"

import * as React from "react"
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
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
import { VSCodeArchitecture } from "@/components/ui/vscode-architecture"
import { useAppState } from "@/contexts/app-state-context"
import type { EditorTab, ChatMessage } from "@/contexts/app-state-context"

// Initialize Mermaid
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

// Mock useRequireAuth hook
const useRequireAuth = () => ({
  requireAuth: (feature: string) => true,
})

import { useActiveProject, useProjectsActions, Folder as ProjectFolder, File as ProjectFile } from "@/store/projects-store"

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

// CodeEditor Component – CodeMirror-based (no WASM)
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
  /* Map language prop to CodeMirror extensions */
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
      default:
        return [] // fallback – plain‐text
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
    />
  )
}

// VS Code Menu Component
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
}) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const menuData: MenuCategory[] = [
    {
      label: "File",
      icon: FileIcon,
      items: [
        {
          label: "New File",
          shortcut: "Ctrl+N",
          icon: Plus,
          action: onNewFile,
        },
        {
          label: "New Window",
          shortcut: "Ctrl+Shift+N",
          icon: PlusSquare,
          action: onNewWindow,
        },
        { divider: true },
        {
          label: "Open File...",
          shortcut: "Ctrl+O",
          icon: FileIcon,
          action: onOpenFile,
        },
        {
          label: "Open Folder...",
          shortcut: "Ctrl+K Ctrl+O",
          icon: Folder,
          action: onOpenFolder,
        },
        {
          label: "Open Workspace...",
          icon: Layout,
          action: onOpenWorkspace,
        },
        {
          label: "Open Recent",
          icon: Clock,
          action: onOpenRecent,
        },
        { divider: true },
        {
          label: "Add Folder to Workspace...",
          icon: FolderPlus,
          action: onAddFolderToWorkspace,
        },
        { divider: true },
        {
          label: "Save",
          shortcut: "Ctrl+S",
          icon: Save,
          action: onSave,
        },
        {
          label: "Save As...",
          shortcut: "Ctrl+Shift+S",
          icon: Save,
          action: onSaveAs,
        },
        {
          label: "Save All",
          shortcut: "Ctrl+K S",
          icon: Save,
          action: onSaveAll,
        },
        {
          label: "Auto Save",
          checked: autoSave,
          icon: ToggleRight,
          action: onToggleAutoSave,
        },
        { divider: true },
        {
          label: "Revert File",
          icon: RefreshCw,
          action: onRevertFile,
        },
        { divider: true },
        {
          label: "Close Editor",
          shortcut: "Ctrl+F4",
          icon: X,
          action: onCloseEditor,
        },
        {
          label: "Close Folder",
          shortcut: "Ctrl+K F",
          icon: FolderMinus,
          action: onCloseFolder,
        },
        {
          label: "Close Window",
          shortcut: "Alt+F4",
          icon: X,
          action: onCloseWindow,
        },
        { divider: true },
        {
          label: "Exit",
          action: onExit,
        },
      ],
    },
    {
      label: "Edit",
      icon: FileIcon,
      items: [
        {
          label: "Undo",
          shortcut: "Ctrl+Z",
          icon: RotateCcw,
          action: onUndo,
        },
        {
          label: "Redo",
          shortcut: "Ctrl+Y",
          icon: RotateCw,
          action: onRedo,
        },
        { divider: true },
        {
          label: "Cut",
          shortcut: "Ctrl+X",
          icon: Scissors,
          action: onCut,
        },
        {
          label: "Copy",
          shortcut: "Ctrl+C",
          icon: Copy,
          action: onCopy,
        },
        {
          label: "Paste",
          shortcut: "Ctrl+V",
          icon: Clipboard,
          action: onPaste,
        },
        { divider: true },
        {
          label: "Find",
          shortcut: "Ctrl+F",
          icon: Search,
          action: onFind,
        },
        {
          label: "Replace",
          shortcut: "Ctrl+H",
          icon: Replace,
          action: onReplace,
        },
      ],
    },
    {
      label: "Selection",
      icon: FileIcon,
      items: [
        {
          label: "Select All",
          shortcut: "Ctrl+A",
          action: onSelectAll,
        },
        {
          label: "Expand Selection",
          shortcut: "Shift+Alt+Right",
          action: onExpandSelection,
        },
        {
          label: "Shrink Selection",
          shortcut: "Shift+Alt+Left",
          action: onShrinkSelection,
        },
      ],
    },
    {
      label: "View",
      icon: FileIcon,
      items: [
        {
          label: "Command Palette",
          shortcut: "Ctrl+Shift+P",
          icon: Command,
          action: onCommandPalette,
        },
        { divider: true },
        {
          label: "Explorer",
          shortcut: "Ctrl+Shift+E",
          action: onToggleExplorer,
        },
        {
          label: "Search",
          shortcut: "Ctrl+Shift+F",
          action: onToggleSearch,
        },
        {
          label: "Source Control",
          shortcut: "Ctrl+Shift+G",
          action: onToggleSourceControl,
        },
      ],
    },
    {
      label: "Go",
      icon: FileIcon,
      items: [
        {
          label: "Back",
          shortcut: "Alt+Left",
          icon: ArrowLeft,
          action: onGoBack,
        },
        {
          label: "Forward",
          shortcut: "Alt+Right",
          icon: ArrowRight,
          action: onGoForward,
        },
        { divider: true },
        {
          label: "Go to File",
          shortcut: "Ctrl+P",
          action: onGoToFile,
        },
        {
          label: "Go to Symbol",
          shortcut: "Ctrl+Shift+O",
          action: onGoToSymbol,
        },
      ],
    },
    {
      label: "Run",
      icon: Play,
      items: [
        {
          label: "Start Debugging",
          shortcut: "F5",
          icon: Bug,
          action: onStartDebugging,
        },
        {
          label: "Run Without Debugging",
          shortcut: "Ctrl+F5",
          icon: Play,
          action: onRunWithoutDebugging,
        },
        {
          label: "Stop Debugging",
          shortcut: "Shift+F5",
          icon: Square,
          action: onStopDebugging,
        },
        { divider: true },
        {
          label: "Step Over",
          shortcut: "F10",
          icon: StepForward,
          action: onStepOver,
        },
        {
          label: "Step Into",
          shortcut: "F11",
          icon: ArrowDown,
          action: onStepInto,
        },
        {
          label: "Step Out",
          shortcut: "Shift+F11",
          icon: ArrowUp,
          action: onStepOut,
        },
      ],
    },
    {
      label: "Terminal",
      icon: Terminal,
      items: [
        {
          label: "New Terminal",
          shortcut: "Ctrl+`",
          icon: Terminal,
          action: onNewTerminal,
        },
        {
          label: "Split Terminal",
          icon: Layout,
          action: onSplitTerminal,
        },
        { divider: true },
        {
          label: "Clear Terminal",
          action: onClearTerminal,
        },
        {
          label: "Kill Terminal",
          icon: Trash2,
          action: onKillTerminal,
        },
      ],
    },
    {
      label: "Help",
      icon: Info,
      items: [
        {
          label: "Welcome",
          action: onShowWelcome,
        },
        {
          label: "Documentation",
          icon: BookOpen,
          action: onShowDocumentation,
        },
        { divider: true },
        {
          label: "Check for Updates",
          action: onCheckUpdates,
        },
        { divider: true },
        {
          label: "About",
          icon: Info,
          action: onShowAbout,
        },
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

// File Explorer Component
function FileExplorer({
  fileTree,
  onFileSelect,
  onNewFile,
  onNewFolder,
  onRefresh,
}: {
  fileTree: ProjectFolder | null
  onFileSelect: (path: string, file: ProjectFile) => void
  onNewFile: () => void
  onNewFolder: () => void
  onRefresh: () => void
}) {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({})

  const toggleFolder = (folderId: string) => {
    setOpenFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }))
  }

  const renderFileTree = (items: (ProjectFolder | ProjectFile)[], level = 0, pathPrefix = '') => {
    return items.map((item) => {
      const currentPath = pathPrefix ? `${pathPrefix}/${item.name}` : item.name;
      if (item.type === 'folder') {
        const isOpen = openFolders[item.id] ?? true;
        return (
          <div key={item.id}>
            <div
              className={`flex items-center py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer rounded-sm`}
              style={{ paddingLeft: `${level * 16}px` }}
              onClick={() => toggleFolder(item.id)}
            >
              {isOpen ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
              <Folder className="h-4 w-4 mr-1 text-blue-400" />
              <span>{item.name}</span>
            </div>
            {isOpen && item.children && (
              <div>{renderFileTree(item.children, level + 1, currentPath)}</div>
            )}
          </div>
        )
      } else {
        return (
          <div key={item.id} style={{ paddingLeft: `${level * 16}px` }}>
            <div
              className={`flex items-center py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer rounded-sm`}
              onClick={() => onFileSelect(currentPath, item)}
            >
              <FileText className="h-4 w-4 mr-1 text-gray-400" />
              <span>{item.name}</span>
            </div>
          </div>
        )
      }
    })
  }

  return (
    <div className="h-full bg-[#252526] text-gray-300 text-sm overflow-y-auto">
      <div className="p-2 font-semibold border-b border-[#3c3c3c] flex items-center justify-between">
        <span>EXPLORER</span>
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onNewFile}>
                  <FileText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New File</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onNewFolder}>
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New Folder</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <ScrollArea className="h-full">
        <div className="p-2">
          {fileTree ? renderFileTree(fileTree.children) : <p className="p-2">No project selected.</p>}
        </div>
      </ScrollArea>
    </div>
  )
}



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

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>, onFolderLoad: (files: FileList) => void) => {
    const files = event.target.files
    if (files) {
      onFolderLoad(files)
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

  return {
    openFile,
    openFolder,
    handleFileSelect,
    handleFolderSelect,
    saveFile,
    saveAs,
    fileInputRef,
    folderInputRef,
  }
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useProjectsList } from "@/store/projects-store"

// ... (keep all the existing components like ScrollArea, CodeEditor, VSCodeMenu, etc.)

// Project Open Modal Component
function ProjectOpenModal({ open, onOpenChange, onSelectProject }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectProject: (projectId: string) => void
}) {
  const projects = useProjectsList()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Open Project</DialogTitle>
          <DialogDescription>Select a project to open in the workspace.</DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-96 overflow-y-auto">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-2 hover:bg-gray-700 cursor-pointer rounded"
              onClick={() => {
                onSelectProject(project.id)
                onOpenChange(false)
              }}
            >
              <p className="font-semibold">{project.name}</p>
              <p className="text-sm text-gray-400">{project.description}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Main VS Code Editor Component
export const VSCodeEditor = forwardRef<
  {
    insertCode: (code: string, language?: string) => void
    getCurrentCode: () => string
    getOpenFiles: () => EditorTab[]
    getActiveFile: () => string | null
    restoreState?: (state: any) => void
  },
  {
    onCodeChange?: (code: string) => void
  }
>(({ onCodeChange }, ref) => {
  const {
    state: {
      aiAssistant: { editorTabs, activeEditorTab, showExplorer, showTerminal, showProblems, activePanel, terminalHeight },
    },
    updateAIAssistant,
    addEditorTab,
    updateEditorTab,
    removeEditorTab,
  } = useAppState()

  const activeProject = useActiveProject()
  const { setActiveProject, updateFileContent } = useProjectsActions()

  const [activeIcon, setActiveIcon] = useState("explorer")
  const [isResizing, setIsResizing] = useState(false)
  const [startY, setStartY] = useState(0)
  const [autoSave, setAutoSave] = useState(true)
  const [recentFiles, setRecentFiles] = useState<string[]>([])
  const [isProjectModalOpen, setProjectModalOpen] = useState(false)

  const fileManager = useFileManager()
  const { toast } = useToast()

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && activeEditorTab) {
      const interval = setInterval(() => {
        const currentTab = editorTabs.find((tab) => tab.id === activeEditorTab)
        if (currentTab && currentTab.isDirty) {
          updateEditorTab(activeEditorTab, { isDirty: false })
          toast({
            title: "Auto Saved",
            description: `${currentTab.name} has been auto-saved.`,
          })
        }
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [autoSave, activeEditorTab, editorTabs, toast, updateEditorTab])

  // Effect to sync editor tabs with the project store
  useEffect(() => {
    if (activeProject) {
      editorTabs.forEach(tab => {
        if (tab.path) {
          const findFile = (nodes: (ProjectFile | ProjectFolder)[], path: string): ProjectFile | null => {
            for (const node of nodes) {
              if (node.type === 'file' && node.name === path) {
                return node;
              }
              if (node.type === 'folder') {
                const found = findFile(node.children, path.startsWith(node.name + '/') ? path.substring(node.name.length + 1) : path)
                if (found) return found;
              }
            }
            return null;
          }
          const fileInStore = findFile(activeProject.fileTree.children, tab.path)
          if (fileInStore && fileInStore.content !== tab.content) {
            updateEditorTab(tab.id, { content: fileInStore.content })
          }
        }
      })
    }
  }, [activeProject, editorTabs, updateEditorTab])

  const handleFileSelect = (path: string, file: ProjectFile) => {
    const existingTab = editorTabs.find((tab) => tab.path === path)
    if (existingTab) {
      updateAIAssistant({ activeEditorTab: existingTab.id })
      return
    }

    const language = file.name.split(".").pop() || "text"

    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      name: file.name,
      content: file.content,
      language: language,
      path: path,
    }

    addEditorTab(newTab)

    // Add to recent files
    setRecentFiles((prev) => [path, ...prev.filter((p) => p !== path)].slice(0, 10))
  }

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeEditorTab(id)
  }

  const handleContentChange = (value: string, tabId: string) => {
    updateEditorTab(tabId, { content: value, isDirty: true })
    if (activeProject) {
        const currentTab = editorTabs.find((tab) => tab.id === tabId)
        if(currentTab?.path){
            updateFileContent(activeProject.id, currentTab.path, value)
        }
    }
    onCodeChange?.(value)
  }

  const insertCodeIntoEditor = (code: string, language = "javascript") => {
    if (activeEditorTab) {
      const currentTab = editorTabs.find((tab) => tab.id === activeEditorTab)
      if (currentTab) {
        const newContent = currentTab.content + "\n\n" + code
        handleContentChange(newContent, activeEditorTab)
      }
    } else {
      const newTab: EditorTab = {
        id: `tab-${Date.now()}`,
        name: `ai-generated.${language === "python" ? "py" : "js"}`,
        content: code,
        language: language,
      }
      addEditorTab(newTab)
    }
  }

  const createNewFile = () => {
    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      name: "untitled.js",
      content: "// Start coding here\n\n",
      language: "javascript",
    }
    addEditorTab(newTab)
  }

  const createNewFolder = () => {
    toast({
      title: "New Folder",
      description: "New folder functionality would be implemented here.",
    })
  }

  const refreshExplorer = () => {
    toast({
      title: "Refreshed",
      description: "File explorer has been refreshed.",
    })
  }

  const handleSave = () => {
    const currentTab = editorTabs.find((tab) => tab.id === activeEditorTab)
    if (currentTab && activeProject && currentTab.path) {
        updateFileContent(activeProject.id, currentTab.path, currentTab.content)
        updateEditorTab(activeEditorTab!, { isDirty: false })
        toast({
            title: "File Saved",
            description: `${currentTab.name} has been saved.`,
        })
    } else {
        toast({
            title: "Cannot Save",
            description: "No active file or project to save.",
            variant: "destructive"
        })
    }
  }

  const handleSaveAs = () => {
    const currentTab = editorTabs.find((tab) => tab.id === activeEditorTab)
    if (currentTab) {
      fileManager.saveAs(currentTab.content, currentTab.name, (filename) => {
        updateEditorTab(activeEditorTab!, { name: filename, isDirty: false })
      })
    }
  }

  const handleSaveAll = () => {
    editorTabs.forEach((tab) => {
      if (tab.isDirty && activeProject && tab.path) {
        updateFileContent(activeProject.id, tab.path, tab.content)
        updateEditorTab(tab.id, { isDirty: false })
      }
    })
    toast({
      title: "All Files Saved",
      description: "All modified files have been saved successfully.",
    })
  }

  const handleFileLoad = (file: File, content: string) => {
    const language = file.name.split(".").pop() || "text"
    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      name: file.name,
      content: content,
      language: language,
      path: file.name,
    }
    addEditorTab(newTab)
    toast({
      title: "File Opened",
      description: `${file.name} has been opened successfully.`,
    })
  }

  const handleFolderLoad = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        handleFileLoad(file, content)
      }
      reader.readAsText(file)
    })
  }

  // All menu action handlers
  const menuHandlers = {
    onNewFile: createNewFile,
    onOpenFile: () => setProjectModalOpen(true),
    onOpenFolder: () => setProjectModalOpen(true),
    onSave: handleSave,
    onSaveAs: handleSaveAs,
    onSaveAll: handleSaveAll,
    autoSave,
    onToggleAutoSave: () => setAutoSave(!autoSave),
    onNewWindow: () => toast({ title: "New Window", description: "Opening new window..." }),
    onOpenWorkspace: () => setProjectModalOpen(true),
    onOpenRecent: () => toast({ title: "Open Recent", description: "Showing recent files..." }),
    onAddFolderToWorkspace: () => toast({ title: "Add Folder", description: "Adding folder to workspace..." }),
    onRevertFile: () => toast({ title: "Revert File", description: "File reverted to last saved version." }),
    onCloseEditor: () => activeEditorTab && closeTab(activeEditorTab, { stopPropagation: () => {} } as React.MouseEvent),
    onCloseFolder: () => toast({ title: "Close Folder", description: "Folder closed." }),
    onCloseWindow: () => toast({ title: "Close Window", description: "Window closed." }),
    onExit: () => toast({ title: "Exit", description: "Exiting application..." }),
    onUndo: () => toast({ title: "Undo", description: "Undo action performed." }),
    onRedo: () => toast({ title: "Redo", description: "Redo action performed." }),
    onCut: () => toast({ title: "Cut", description: "Content cut to clipboard." }),
    onCopy: () => toast({ title: "Copy", description: "Content copied to clipboard." }),
    onPaste: () => toast({ title: "Paste", description: "Content pasted from clipboard." }),
    onFind: () => toast({ title: "Find", description: "Opening find dialog..." }),
    onReplace: () => toast({ title: "Replace", description: "Opening replace dialog..." }),
    onSelectAll: () => toast({ title: "Select All", description: "All content selected." }),
    onExpandSelection: () => toast({ title: "Expand Selection", description: "Selection expanded." }),
    onShrinkSelection: () => toast({ title: "Shrink Selection", description: "Selection shrunk." }),
    onCommandPalette: () => toast({ title: "Command Palette", description: "Opening command palette..." }),
    onToggleExplorer: () => updateAIAssistant({ showExplorer: !showExplorer }),
    onToggleSearch: () => toast({ title: "Search", description: "Toggling search panel..." }),
    onToggleSourceControl: () => toast({ title: "Source Control", description: "Toggling source control..." }),
    onGoBack: () => toast({ title: "Go Back", description: "Navigating back..." }),
    onGoForward: () => toast({ title: "Go Forward", description: "Navigating forward..." }),
    onGoToFile: () => toast({ title: "Go to File", description: "Opening file picker..." }),
    onGoToSymbol: () => toast({ title: "Go to Symbol", description: "Opening symbol picker..." }),
    onStartDebugging: () => toast({ title: "Start Debugging", description: "Starting debugger..." }),
    onRunWithoutDebugging: () => toast({ title: "Run", description: "Running without debugging..." }),
    onStopDebugging: () => toast({ title: "Stop Debugging", description: "Stopping debugger..." }),
    onStepOver: () => toast({ title: "Step Over", description: "Stepping over..." }),
    onStepInto: () => toast({ title: "Step Into", description: "Stepping into..." }),
    onStepOut: () => toast({ title: "Step Out", description: "Stepping out..." }),
    onNewTerminal: () => updateAIAssistant({ showTerminal: true }),
    onSplitTerminal: () => toast({ title: "Split Terminal", description: "Splitting terminal..." }),
    onClearTerminal: () => toast({ title: "Clear Terminal", description: "Terminal cleared." }),
    onKillTerminal: () => updateAIAssistant({ showTerminal: false }),
    onShowWelcome: () => toast({ title: "Welcome", description: "Showing welcome page..." }),
    onShowDocumentation: () => toast({ title: "Documentation", description: "Opening documentation..." }),
    onCheckUpdates: () => toast({ title: "Check Updates", description: "Checking for updates..." }),
    onShowAbout: () => toast({ title: "About", description: "Showing about dialog..." }),
  }

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    insertCode: insertCodeIntoEditor,
    getCurrentCode: () => {
      const currentTab = editorTabs.find((tab) => tab.id === activeEditorTab)
      return currentTab?.content || ""
    },
    getOpenFiles: () => editorTabs,
    getActiveFile: () => activeEditorTab,
  }))

  const toggleSidebar = (icon: string) => {
    if (icon === "explorer") {
      updateAIAssistant({ showExplorer: !showExplorer })
    }
    setActiveIcon(icon)
  }

  const togglePanel = (panel: string) => {
    if (panel === "terminal") {
      updateAIAssistant({ showTerminal: !showTerminal, activePanel: "terminal" })
    } else if (panel === "problems") {
      updateAIAssistant({ showProblems: !showProblems, activePanel: "problems" })
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    setStartY(e.clientY)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const deltaY = startY - e.clientY
      updateAIAssistant({ terminalHeight: Math.min(Math.max(terminalHeight + deltaY, 100), 500) })
      setStartY(e.clientY)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, startY, terminalHeight, updateAIAssistant])

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border rounded-md overflow-hidden">
      {/* Hidden file inputs for file/folder selection */}
      <input
        ref={fileManager.fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={(e) => fileManager.handleFileSelect(e, handleFileLoad)}
        accept=".js,.jsx,.ts,.tsx,.html,.css,.json,.md,.txt,.py"
      />
      <input
        ref={fileManager.folderInputRef}
        type="file"
        style={{ display: "none" }}
        webkitdirectory=""
        onChange={(e) => fileManager.handleFolderSelect(e, handleFolderLoad)}
      />

      <VSCodeMenu {...menuHandlers} />

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <div className="w-12 h-full flex flex-col items-center bg-[#333333] py-4 gap-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 rounded-md ${activeIcon === "explorer" ? "bg-[#37373d]" : ""}`}
                  onClick={() => toggleSidebar("explorer")}
                >
                  <FileText className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Explorer</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 rounded-md ${activeIcon === "search" ? "bg-[#37373d]" : ""}`}
                  onClick={() => toggleSidebar("search")}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Search</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 rounded-md ${activeIcon === "git" ? "bg-[#37373d]" : ""}`}
                  onClick={() => toggleSidebar("git")}
                >
                  <GitBranch className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Source Control</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 rounded-md ${activeIcon === "debug" ? "bg-[#37373d]" : ""}`}
                  onClick={() => toggleSidebar("debug")}
                >
                  <Bug className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Run and Debug</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 rounded-md ${activeIcon === "extensions" ? "bg-[#37373d]" : ""}`}
                  onClick={() => toggleSidebar("extensions")}
                >
                  <Package className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Extensions</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex-1" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-md">
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Sidebar */}
        {showExplorer && (
          <div className="w-64 h-full border-r border-[#252526]">
            <FileExplorer
              onFileSelect={handleFileSelect}
              onNewFile={createNewFile}
              onNewFolder={createNewFolder}
              onRefresh={refreshExplorer}
            />
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Bar */}
          <div className="flex items-center border-b border-[#252526] bg-[#252526]">
            <ScrollArea orientation="horizontal" className="w-full">
              <div className="flex">
                {editorTabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`flex items-center h-9 px-3 border-r border-[#252526] ${
                      activeEditorTab === tab.id ? "bg-[#1e1e1e]" : "bg-[#2d2d2d] hover:bg-[#2a2a2a]"
                    }`}
                    onClick={() => updateAIAssistant({ activeEditorTab: tab.id })}
                  >
                    <FileText className="h-4 w-4 mr-2 text-blue-400" />
                    <span className="mr-2">
                      {tab.name}
                      {tab.isDirty ? " •" : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 opacity-50 hover:opacity-100 hover:bg-[#3c3c3c] rounded-sm"
                      onClick={(e) => closeTab(tab.id, e)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center ml-auto">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none">
                <Split className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden">
            {activeEditorTab ? (
              <Tabs value={activeEditorTab} className="h-full">
                {editorTabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="h-full">
                    <CodeEditor
                      value={tab.content}
                      language={tab.language || "javascript"}
                      height="100%"
                      onChange={(value) => handleContentChange(value || "", tab.id)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <FileCode2 className="h-16 w-16 mb-4 opacity-20" />
                <h2 className="text-xl font-semibold mb-2">No file is open</h2>
                <p className="text-sm max-w-md text-center">
                  Open a file from the explorer or create a new file to start coding
                </p>
                <Button variant="outline" className="mt-6 bg-transparent" onClick={createNewFile}>
                  <Plus className="h-4 w-4 mr-2" />
                  New File
                </Button>
              </div>
            )}
          </div>

          {/* Panel Area */}
          {(showTerminal || showProblems) && (
            <>
              <div
                className="h-1 bg-[#252526] cursor-ns-resize flex items-center justify-center hover:bg-blue-500"
                onMouseDown={handleMouseDown}
              >
                <div className="w-16 h-1 bg-[#3c3c3c]" />
              </div>
              <div style={{ height: `${terminalHeight}px` }} className="border-t border-[#252526]">
                <div className="flex items-center bg-[#252526] border-b border-[#3c3c3c] relative">
                  <Tabs value={activePanel || "terminal"} className="w-full">
                    <TabsList className="bg-transparent h-9 p-0">
                      <TabsTrigger
                        value="terminal"
                        className="rounded-none data-[state=active]:bg-[#1e1e1e] data-[state=active]:shadow-none px-4 h-9"
                        onClick={() => togglePanel("terminal")}
                      >
                        TERMINAL
                      </TabsTrigger>
                      <TabsTrigger
                        value="problems"
                        className="rounded-none data-[state=active]:bg-[#1e1e1e] data-[state=active]:shadow-none px-4 h-9"
                        onClick={() => togglePanel("problems")}
                      >
                        PROBLEMS
                      </TabsTrigger>
                    </TabsList>
                    <div className="h-[calc(100%-36px)]">
                      <TabsContent value="terminal" className="h-full">
                        <div>Terminal</div>
                      </TabsContent>
                      <TabsContent value="problems" className="h-full">
                        <div>Problems</div>
                      </TabsContent>
                    </div>
                  </Tabs>
                  <div className="flex items-center absolute right-0 top-0">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-none"
                      onClick={() => {
                        updateAIAssistant({ showTerminal: false, showProblems: false })
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Status Bar */}
          <div className="h-6 bg-[#007acc] text-white flex items-center px-2 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <GitBranch className="h-3.5 w-3.5 mr-1" />
                <span>main</span>
              </div>
              <div className="flex items-center">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                <span>AI: Ready</span>
              </div>
              {autoSave && (
                <div className="flex items-center">
                  <Save className="h-3.5 w-3.5 mr-1" />
                  <span>Auto Save: ON</span>
                </div>
              )}
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <span>{activeEditorTab ? editorTabs.find((t) => t.id === activeEditorTab)?.language || "JavaScript" : ""}</span>
              <span>UTF-8</span>
              <span>LF</span>
              <span>Ln 1, Col 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

// Chat Panel Component
function ChatPanel({ onInsertCode }: { onInsertCode: (code: string, language: string) => void }) {
  const {
    state: {
      aiAssistant: { chatMessages, chatInput },
    },
    updateAIAssistant,
    addChatMessage,
  } = useAppState()

  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { requireAuth } = useRequireAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const generateAIResponse = (userInput: string): ChatMessage => {
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes("function") || lowerInput.includes("create") || lowerInput.includes("write")) {
      if (lowerInput.includes("react") || lowerInput.includes("component")) {
        return {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Here's a React component based on your request:",
          code: {
            language: "javascript",
            value: `import React, { useState } from 'react';

function MyComponent() {
  const [count, setCount] = useState(0);

  return (
    <div className="component">
      <h2>My Component</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
    </div>
  );
}

export default MyComponent;`,
          },
        }
      } else if (lowerInput.includes("python")) {
        return {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Here's a Python function for you:",
          code: {
            language: "python",
            value: `def process_data(data):
    """
    Process and analyze data
    """
    if not data:
        return None
    
    # Process the data
    processed = []
    for item in data:
        if isinstance(item, (int, float)):
            processed.append(item * 2)
        else:
            processed.append(str(item).upper())
    
    return processed

# Example usage
sample_data = [1, 2, "hello", 3.14, "world"]
result = process_data(sample_data)
print(result)`,
          },
        }
      } else {
        return {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Here's a JavaScript function that might help:",
          code: {
            language: "javascript",
            value: `function processArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return [];
  }
  
  return arr
    .filter(item => item !== null && item !== undefined)
    .map(item => {
      if (typeof item === 'string') {
        return item.trim().toLowerCase();
      }
      if (typeof item === 'number') {
        return Math.round(item * 100) / 100;
      }
      return item;
    })
    .sort();
}

// Example usage
const data = [3.14159, "  Hello  ", null, "WORLD", 2.71828];
const result = processArray(data);
console.log(result);`,
          },
        }
      }
    } else if (lowerInput.includes("debug") || lowerInput.includes("fix") || lowerInput.includes("error")) {
      return {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I've analyzed your code and found a potential issue. Here's a suggestion to fix it:",
        code: {
          language: "javascript",
          value: `// Original code
function calculateArea(width, height) {
  return width * height;
}

// Fixed code
function calculateArea(width, height) {
  if (typeof width !== 'number' || typeof height !== 'number') {
    return 'Invalid input. Width and height must be numbers.';
  }
  return width * height;
}`,
        },
      }
    } else if (lowerInput.includes("optimize") || lowerInput.includes("performance") || lowerInput.includes("faster")) {
      return {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Here's an optimized version of your code for better performance:",
        code: {
          language: "javascript",
          value: `// Original code
function slowFunction(arr) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] % 2 === 0) {
      result.push(arr[i]);
    }
  }
  return result;
}

// Optimized code
function fastFunction(arr) {
  return arr.filter(num => num % 2 === 0);
}`,
        },
      }
    } else {
      return {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I can help you with coding tasks, debugging, and optimization. Please provide more specific instructions or code snippets.",
      }
    }
  }

  const sendMessage = async () => {
    if (!chatInput.trim()) return

    setIsLoading(true)
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput,
    }

    addChatMessage(userMessage)
    updateAIAssistant({ chatInput: "" })

    // Simulate AI response (replace with actual API call later)
    setTimeout(() => {
      const aiResponse = generateAIResponse(chatInput)
      addChatMessage(aiResponse)
      setIsLoading(false)
    }, 1500)
  }

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => {
      setCopied(null)
    }, 2000)
  }

  const handleInsert = (code: string, language: string) => {
    onInsertCode(code, language)
  }

  return (
    <div className="flex flex-col h-full bg-[#252526] text-white">
      <div className="flex-1 overflow-y-auto p-4">
        {chatMessages.map((message) => (
          <div key={message.id} className={`mb-4 ${message.role === "user" ? "text-right" : ""}`}>
            <div
              className={`inline-block rounded-lg p-3 max-w-[80%] break-words ${
                message.role === "user" ? "bg-[#3c3c3c]" : "bg-[#1e1e1e]"
              }`}
            >
              {message.content}
            </div>
            {message.code && (
              <div className="relative mt-2 rounded-md overflow-hidden">
                <CodeEditor value={message.code.value} language={message.code.language || "javascript"} height="200px" readOnly />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyCode(message.code!.value, message.id)}
                    disabled={copied === message.id}
                  >
                    {copied === message.id ? <Clipboard className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleInsert(message.code!.value, message.code!.language || "javascript")}
                  >
                    <FileCode2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-[#3c3c3c] bg-[#1e1e1e]">
        <div className="flex items-center">
          <input
            type="text"
            className="flex-1 bg-[#333333] text-white border border-[#3c3c3c] rounded-md py-2 px-3 outline-none"
            placeholder="Ask me anything..."
            value={chatInput}
            onChange={(e) => updateAIAssistant({ chatInput: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage()
              }
            }}
          />
          <Button variant="primary" className="ml-2" onClick={sendMessage} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Top-level AI Assistant screen that combines:
 *  – Code editor (with VS-Code-like UX)
 *  – Chat panel (AI prompt / response)
 *  – Architecture diagrams
 */
export function AIAssistant() {
  const editorRef = React.useRef<{
    insertCode: (code: string, language?: string) => void
  } | null>(null)

  // helper passed to ChatPanel so the AI can drop code into editor
  const handleInsertCode = React.useCallback((code: string, language = "javascript") => {
    editorRef.current?.insertCode(code, language)
  }, [])

  return (
    <div className="grid lg:grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
      <div className="lg:col-span-8 h-full">
        <VSCodeEditor
          ref={editorRef as any} // satisfy TS
        />
      </div>

      <div className="lg:col-span-4 flex flex-col h-full">
        <div className="flex-1 overflow-hidden border rounded-md">
          <ChatPanel onInsertCode={handleInsertCode} />
        </div>
        <div className="mt-4 h-[35%]">
          <VSCodeArchitecture />
        </div>
      </div>
    </div>
  )
}
// default export for backwards compatibility
export default AIAssistant
