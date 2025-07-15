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
  Clock,
  FileText,
  Split,
  Maximize2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Package,
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
import CodeMirror from "@uiw/react-codemirror"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import { javascript } from "@codemirror/lang-javascript"
import { json } from "@codemirror/lang-json"
import { html } from "@codemirror/lang-html"
import { python } from "@codemirror/lang-python"
import { css } from "@codemirror/lang-css"
import { useToast } from "@/hooks/use-toast"

// Types and Interfaces
interface EditorTab {
  id: string
  name: string
  content: string
  language?: string
  path?: string
  isDirty?: boolean
}

interface FileTreeItem {
  id: string
  name: string
  type: "file" | "folder"
  path: string
  children?: FileTreeItem[]
  isOpen?: boolean
  language?: string
}

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
    />
  )
}

// File Management Functions
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

// Sample File Tree Data
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
          },
          {
            id: "header.tsx",
            name: "Header.tsx",
            type: "file",
            path: "src/components/Header.tsx",
            language: "typescript",
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
          },
        ],
      },
    ],
  },
  {
    id: "package.json",
    name: "package.json",
    type: "file",
    path: "package.json",
    language: "json",
  },
]

// Sample File Contents
const sampleFileContents: Record<string, { content: string; language: string }> = {
  "src/components/App.tsx": {
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
  "src/components/Header.tsx": {
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
  "src/hooks/useAuth.ts": {
    language: "typescript",
    content: `import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = localStorage.getItem('user');
        if (user) {
          setUser(JSON.parse(user));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, isAuthenticated, loading };
}`,
  },
  "package.json": {
    language: "json",
    content: `{
  "name": "codefusion-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^4.9.5"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  }
}`,
  },
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
  onFileSelect,
  onNewFile,
  onNewFolder,
  onRefresh,
}: {
  onFileSelect: (path: string) => void
  onNewFile: () => void
  onNewFolder: () => void
  onRefresh: () => void
}) {
  const [fileTree, setFileTree] = useState(sampleFileTree)

  const toggleFolder = (path: string) => {
    const updateTree = (items: FileTreeItem[]): FileTreeItem[] => {
      return items.map((item) => {
        if (item.path === path) {
          return { ...item, isOpen: !item.isOpen }
        } else if (item.children) {
          return { ...item, children: updateTree(item.children) }
        }
        return item
      })
    }
    setFileTree(updateTree(fileTree))
  }

  const renderFileTree = (items: FileTreeItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.id} style={{ paddingLeft: `${level * 16}px` }}>
        <div
          className={`flex items-center py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer rounded-sm ${level === 0 ? "mt-1" : ""}`}
          onClick={() => {
            if (item.type === "folder") {
              toggleFolder(item.path)
            } else {
              onFileSelect(item.path)
            }
          }}
        >
          {item.type === "folder" ? (
            <>
              {item.isOpen ? (
                <ChevronDown className="h-4 w-4 mr-1 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1 text-gray-400" />
              )}
              <Folder className="h-4 w-4 mr-1 text-blue-400" />
              <span>{item.name}</span>
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-1 text-gray-400" />
              <span>{item.name}</span>
            </>
          )}
        </div>
        {item.type === "folder" && item.isOpen && item.children && (
          <div>{renderFileTree(item.children, level + 1)}</div>
        )}
      </div>
    ))
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
        <div className="p-2">{renderFileTree(fileTree)}</div>
      </ScrollArea>
    </div>
  )
}

// Terminal Component
function TerminalComponent() {
  const [commandHistory, setCommandHistory] = useState<string[]>([
    "Welcome to CodeFusion Terminal",
    "Type 'help' to see available commands",
  ])
  const [currentCommand, setCurrentCommand] = useState("")
  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [commandHistory])

  const executeCommand = (cmd: string) => {
    setCommandHistory((prev) => [...prev, `$ ${cmd}`])
    const command = cmd.trim().toLowerCase()

    if (command === "help") {
      setCommandHistory((prev) => [...prev, "Available commands: help, clear, ls, pwd, echo, date, npm, git"])
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
    } else if (command === "") {
      // Do nothing for empty command
    } else {
      setCommandHistory((prev) => [...prev, `Command not found: ${cmd}. Type 'help' for available commands.`])
    }
    setCurrentCommand("")
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
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              executeCommand(currentCommand)
            }
          }}
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
    initialState?: any
  }
>(({ onCodeChange, initialState }, ref) => {
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [tabs, setTabs] = useState<EditorTab[]>(initialState?.openFiles || [])
  const [showExplorer, setShowExplorer] = useState(true)
  const [showTerminal, setShowTerminal] = useState(false)
  const [showProblems, setShowProblems] = useState(false)
  const [activePanel, setActivePanel] = useState<string | null>("terminal")
  const [activeIcon, setActiveIcon] = useState("explorer")
  const [terminalHeight, setTerminalHeight] = useState(200)
  const [isResizing, setIsResizing] = useState(false)
  const [startY, setStartY] = useState(0)
  const [autoSave, setAutoSave] = useState(true)
  const [recentFiles, setRecentFiles] = useState<string[]>([])

  const fileManager = useFileManager()
  const { toast } = useToast()

  // Restore active file from initial state
  useEffect(() => {
    if (initialState?.activeFile && tabs.length > 0) {
      setActiveTab(initialState.activeFile)
    }
  }, [initialState, tabs])

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && activeTab) {
      const interval = setInterval(() => {
        const currentTab = tabs.find((tab) => tab.id === activeTab)
        if (currentTab && currentTab.isDirty) {
          setTabs(tabs.map((tab) => (tab.id === activeTab ? { ...tab, isDirty: false } : tab)))
          toast({
            title: "Auto Saved",
            description: `${currentTab.name} has been auto-saved.`,
          })
        }
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [autoSave, activeTab, tabs, toast])

  const handleFileSelect = (path: string) => {
    const existingTab = tabs.find((tab) => tab.path === path)
    if (existingTab) {
      setActiveTab(existingTab.id)
      return
    }

    const fileData = sampleFileContents[path]
    if (!fileData) return

    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      name: path.split("/").pop() || "",
      content: fileData.content,
      language: fileData.language,
      path: path,
    }

    setTabs([...tabs, newTab])
    setActiveTab(newTab.id)

    // Add to recent files
    setRecentFiles((prev) => [path, ...prev.filter((p) => p !== path)].slice(0, 10))
  }

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newTabs = tabs.filter((tab) => tab.id !== id)
    if (newTabs.length === 0) {
      setActiveTab(null)
    } else if (id === activeTab) {
      setActiveTab(newTabs[newTabs.length - 1].id)
    }
    setTabs(newTabs)
  }

  const handleContentChange = (value: string, tabId: string) => {
    setTabs(tabs.map((tab) => (tab.id === tabId ? { ...tab, content: value, isDirty: true } : tab)))
    onCodeChange?.(value)
  }

  const insertCodeIntoEditor = (code: string, language = "javascript") => {
    if (activeTab) {
      const currentTab = tabs.find((tab) => tab.id === activeTab)
      if (currentTab) {
        const newContent = currentTab.content + "\n\n" + code
        handleContentChange(newContent, activeTab)
      }
    } else {
      const newTab: EditorTab = {
        id: `tab-${Date.now()}`,
        name: `ai-generated.${language === "python" ? "py" : "js"}`,
        content: code,
        language: language,
      }
      setTabs([...tabs, newTab])
      setActiveTab(newTab.id)
    }
  }

  const createNewFile = () => {
    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      name: "untitled.js",
      content: "// Start coding here\n\n",
      language: "javascript",
    }
    setTabs([...tabs, newTab])
    setActiveTab(newTab.id)
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
    const currentTab = tabs.find((tab) => tab.id === activeTab)
    if (currentTab) {
      if (currentTab.path) {
        fileManager.saveFile(currentTab.content, currentTab.name)
        setTabs(tabs.map((tab) => (tab.id === activeTab ? { ...tab, isDirty: false } : tab)))
      } else {
        fileManager.saveAs(currentTab.content, currentTab.name, (filename) => {
          setTabs(tabs.map((tab) => (tab.id === activeTab ? { ...tab, name: filename, isDirty: false } : tab)))
        })
      }
    }
  }

  const handleSaveAs = () => {
    const currentTab = tabs.find((tab) => tab.id === activeTab)
    if (currentTab) {
      fileManager.saveAs(currentTab.content, currentTab.name, (filename) => {
        setTabs(tabs.map((tab) => (tab.id === activeTab ? { ...tab, name: filename, isDirty: false } : tab)))
      })
    }
  }

  const handleSaveAll = () => {
    tabs.forEach((tab) => {
      if (tab.isDirty) {
        fileManager.saveFile(tab.content, tab.name)
      }
    })
    setTabs(tabs.map((tab) => ({ ...tab, isDirty: false })))
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
    setTabs([...tabs, newTab])
    setActiveTab(newTab.id)
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
    onOpenFile: fileManager.openFile,
    onOpenFolder: fileManager.openFolder,
    onSave: handleSave,
    onSaveAs: handleSaveAs,
    onSaveAll: handleSaveAll,
    autoSave,
    onToggleAutoSave: () => setAutoSave(!autoSave),
    onNewWindow: () => toast({ title: "New Window", description: "Opening new window..." }),
    onOpenWorkspace: () => toast({ title: "Open Workspace", description: "Opening workspace..." }),
    onOpenRecent: () => toast({ title: "Open Recent", description: "Showing recent files..." }),
    onAddFolderToWorkspace: () => toast({ title: "Add Folder", description: "Adding folder to workspace..." }),
    onRevertFile: () => toast({ title: "Revert File", description: "File reverted to last saved version." }),
    onCloseEditor: () => activeTab && closeTab(activeTab, { stopPropagation: () => {} } as React.MouseEvent),
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
    onToggleExplorer: () => setShowExplorer(!showExplorer),
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
    onNewTerminal: () => setShowTerminal(true),
    onSplitTerminal: () => toast({ title: "Split Terminal", description: "Splitting terminal..." }),
    onClearTerminal: () => toast({ title: "Clear Terminal", description: "Terminal cleared." }),
    onKillTerminal: () => setShowTerminal(false),
    onShowWelcome: () => toast({ title: "Welcome", description: "Showing welcome page..." }),
    onShowDocumentation: () => toast({ title: "Documentation", description: "Opening documentation..." }),
    onCheckUpdates: () => toast({ title: "Check Updates", description: "Checking for updates..." }),
    onShowAbout: () => toast({ title: "About", description: "Showing about dialog..." }),
  }

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    insertCode: insertCodeIntoEditor,
    getCurrentCode: () => {
      const currentTab = tabs.find((tab) => tab.id === activeTab)
      return currentTab?.content || ""
    },
    getOpenFiles: () => tabs,
    getActiveFile: () => activeTab,
    restoreState: (state: any) => {
      if (state.openFiles) {
        setTabs(state.openFiles)
      }
      if (state.activeFile) {
        setActiveTab(state.activeFile)
      }
    },
  }))

  const toggleSidebar = (icon: string) => {
    if (icon === "explorer") {
      setShowExplorer(!showExplorer)
    }
    setActiveIcon(icon)
  }

  const togglePanel = (panel: string) => {
    if (panel === "terminal") {
      setShowTerminal(!showTerminal)
      setActivePanel("terminal")
    } else if (panel === "problems") {
      setShowProblems(!showProblems)
      setActivePanel("problems")
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
      setTerminalHeight((prev) => Math.min(Math.max(prev + deltaY, 100), 500))
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
  }, [isResizing, startY])

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
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`flex items-center h-9 px-3 border-r border-[#252526] ${
                      activeTab === tab.id ? "bg-[#1e1e1e]" : "bg-[#2d2d2d] hover:bg-[#2a2a2a]"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
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
            {activeTab ? (
              <Tabs value={activeTab} className="h-full">
                {tabs.map((tab) => (
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
                        <TerminalComponent />
                      </TabsContent>
                      <TabsContent value="problems" className="h-full">
                        <ProblemsPanel />
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
                        setShowTerminal(false)
                        setShowProblems(false)
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
              <span>{activeTab ? tabs.find((t) => t.id === activeTab)?.language || "JavaScript" : ""}</span>
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

VSCodeEditor.displayName = "VSCodeEditor"

