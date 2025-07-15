"use client"

import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import {
  Copy, Sparkles, FileCode2, FileIcon, Plus, PlusSquare, Folder, FolderPlus, Settings, Save, X,
  RefreshCw, ToggleRight, RotateCcw, RotateCw, Scissors, Clipboard, Search, Replace, Command,
  Layout, ArrowLeft, ArrowRight, Play, Bug, Square, StepForward, ArrowUp, ArrowDown, Terminal,
  Trash2, Info, BookOpen, FolderMinus, MoreHorizontal, Clock, FileText, Split, Maximize2,
  ChevronDown, ChevronRight, AlertCircle, AlertTriangle, Package, ZoomIn, ZoomOut, Download,
  GitBranch,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import mermaid from "mermaid"
import CodeMirror from "@uiw/react-codemirror"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import { javascript } from "@codemirror/lang-javascript"
import { json } from "@codemirror/lang-json"
import { html } from "@codemirror/lang-html"
import { python } from "@codemirror/lang-python"
import { css } from "@codemirror/lang-css"

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

// Types and Interfaces
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  code?: { language: string; value: string }
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

interface AppState {
  aiAssistant: { messages: Message[]; currentMessage: string }
  editor: { openFiles: EditorTab[]; activeFile: string | null; showExplorer: boolean; showTerminal: boolean; showProblems: boolean; activePanel: string | null }
  apiHub: { endpoints: string[] }
  dashboard: { widgets: string[] }
  settings: { theme: string; autoSave: boolean; fontSize: number }
  project: { details: string }
}

// App Context
const AppContext = React.createContext<{
  state: AppState
  updateState: (newState: Partial<AppState>) => void
}>({
  state: {
    aiAssistant: { messages: [], currentMessage: "" },
    editor: { openFiles: [], activeFile: null, showExplorer: true, showTerminal: false, showProblems: false, activePanel: null },
    apiHub: { endpoints: [] },
    dashboard: { widgets: [] },
    settings: { theme: "dark", autoSave: true, fontSize: 14 },
    project: { details: "" },
  },
  updateState: () => {},
})

// Sample File Tree and Contents (from original)
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
          { id: "app.tsx", name: "App.tsx", type: "file", path: "src/components/App.tsx", language: "typescript" },
          { id: "header.tsx", name: "Header.tsx", type: "file", path: "src/components/Header.tsx", language: "typescript" },
          { id: "footer.tsx", name: "Footer.tsx", type: "file", path: "src/components/Footer.tsx", language: "typescript" },
        ],
      },
      {
        id: "hooks",
        name: "hooks",
        type: "folder",
        path: "src/hooks",
        children: [
          { id: "use-auth.ts", name: "useAuth.ts", type: "file", path: "src/hooks/useAuth.ts", language: "typescript" },
          { id: "use-theme.ts", name: "useTheme.ts", type: "file", path: "src/hooks/useTheme.ts", language: "typescript" },
        ],
      },
      { id: "index.tsx", name: "index.tsx", type: "file", path: "src/index.tsx", language: "typescript" },
    ],
  },
  {
    id: "public",
    name: "public",
    type: "folder",
    path: "public",
    children: [
      { id: "index.html", name: "index.html", type: "file", path: "public/index.html", language: "html" },
      { id: "favicon.ico", name: "favicon.ico", type: "file", path: "public/favicon.ico" },
    ],
  },
  { id: "package.json", name: "package.json", type: "file", path: "package.json", language: "json" },
  { id: "tsconfig.json", name: "tsconfig.json", type: "file", path: "tsconfig.json", language: "json" },
]

const sampleFileContents: Record<string, { content: string; language: string }> = {
  "src/components/App.tsx": {
    language: "typescript",
    content: `import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <Header />
      <main>
        <h1>Welcome to CodeFusion</h1>
        <p>You clicked {count} times</p>
        <button onClick={() => setCount(count + 1)}>
          Click me
        </button>
      </main>
      <Footer />
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
  "src/components/Footer.tsx": {
    language: "typescript",
    content: `import React from 'react';

function Footer() {
  return (
    <footer className="app-footer">
      <p>© {new Date().getFullYear()} CodeFusion. All rights reserved.</p>
    </footer>
  );
}

export default Footer;`,
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
        await new Promise(resolve => setTimeout(resolve, 1000));
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
  "src/hooks/useTheme.ts": {
    language: "typescript",
    content: `import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return { theme, toggleTheme };
}`,
  },
  "src/index.tsx": {
    language: "typescript",
    content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  },
  "public/index.html": {
    language: "html",
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="CodeFusion - Modern Development Environment" />
    <title>CodeFusion App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`,
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
    "react-scripts": "5.0.1",
    "typescript": "^4.9.5"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}`,
  },
  "tsconfig.json": {
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
        bracketMatching: true,
        autocompletion: true,
      }}
      onChange={(val) => onChange?.(val)}
      style={{ fontSize: 14, fontFamily: `"Fira Code", "JetBrains Mono", monospace` }}
    />
  )
}

// VS Code Menu Component
function VSCodeMenu({ onMenuAction }: { onMenuAction: (action: string) => void }) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const { state, updateState } = React.useContext(AppContext)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenu && !menuRefs.current[activeMenu]?.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [activeMenu])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!activeMenu) return
      if (event.key === "Escape") {
        setActiveMenu(null)
        return
      }
      if (event.key === "ArrowRight") {
        const currentIndex = menuData.findIndex((item) => item.label === activeMenu)
        if (currentIndex < menuData.length - 1) {
          setActiveMenu(menuData[currentIndex + 1].label)
          menuRefs.current[menuData[currentIndex + 1].label]?.focus()
        }
      }
      if (event.key === "ArrowLeft") {
        const currentIndex = menuData.findIndex((item) => item.label === activeMenu)
        if (currentIndex > 0) {
          setActiveMenu(menuData[currentIndex - 1].label)
          menuRefs.current[menuData[currentIndex - 1].label]?.focus()
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [activeMenu])

  const renderMenuItem = (item: MenuItem) => {
    if (item.divider) return <DropdownMenuSeparator key="divider" />
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
        <DropdownMenuCheckboxItem
          key={item.label}
          checked={item.label === "Auto Save" ? state.settings.autoSave : item.checked}
          onCheckedChange={() => {
            if (item.label === "Auto Save") {
              updateState({ settings: { ...state.settings, autoSave: !state.settings.autoSave } })
            }
            item.action?.()
            onMenuAction(item.label)
          }}
        >
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
        onClick={() => {
          item.action?.()
          onMenuAction(item.label)
        }}
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
              if (open) setActiveMenu(category.label)
              else if (activeMenu === category.label) setActiveMenu(null)
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                ref={(el) => (menuRefs.current[category.label] = el)}
                variant="ghost"
                size="sm"
                className={cn("h-8 px-3 text-sm rounded-none", activeMenu === category.label ? "bg-[#3c3c3c]" : "hover:bg-[#3c3c3c]")}
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
function FileExplorer({ onFileSelect }: { onFileSelect: (path: string) => void }) {
  const { state, updateState } = React.useContext(AppContext)
  const { toast } = useToast()
  const [contextMenu, setContextMenu] = useState<{ path: string; x: number; y: number } | null>(null)

  const toggleFolder = (path: string) => {
    const updateTree = (items: FileTreeItem[]): FileTreeItem[] => {
      return items.map((item) => {
        if (item.path === path) return { ...item, isOpen: !item.isOpen }
        if (item.children) return { ...item, children: updateTree(item.children) }
        return item
      })
    }
    updateState({ editor: { ...state.editor, fileTree: updateTree(state.editor.fileTree || sampleFileTree) } })
  }

  const handleFileOperation = (action: string, path: string) => {
    if (action === "New File") {
      const newFile: FileTreeItem = {
        id: `file-${Date.now()}`,
        name: `untitled-${Date.now()}.txt`,
        type: "file",
        path: `${path}/untitled-${Date.now()}.txt`,
        language: "text",
      }
      const updateTree = (items: FileTreeItem[]): FileTreeItem[] => {
        return items.map((item) => {
          if (item.path === path && item.type === "folder") {
            return { ...item, children: [...(item.children || []), newFile], isOpen: true }
          }
          if (item.children) return { ...item, children: updateTree(item.children) }
          return item
        })
      }
      updateState({ editor: { ...state.editor, fileTree: updateTree(state.editor.fileTree || sampleFileTree) } })
      toast({ title: "File Created", description: `Created ${newFile.name}` })
    } else if (action === "New Folder") {
      const newFolder: FileTreeItem = {
        id: `folder-${Date.now()}`,
        name: `new-folder-${Date.now()}`,
        type: "folder",
        path: `${path}/new-folder-${Date.now()}`,
        children: [],
        isOpen: false,
      }
      const updateTree = (items: FileTreeItem[]): FileTreeItem[] => {
        return items.map((item) => {
          if (item.path === path && item.type === "folder") {
            return { ...item, children: [...(item.children || []), newFolder], isOpen: true }
          }
          if (item.children) return { ...item, children: updateTree(item.children) }
          return item
        })
      }
      updateState({ editor: { ...state.editor, fileTree: updateTree(state.editor.fileTree || sampleFileTree) } })
      toast({ title: "Folder Created", description: `Created ${newFolder.name}` })
    } else if (action === "Delete") {
      const updateTree = (items: FileTreeItem[]): FileTreeItem[] => {
        return items.filter((item) => {
          if (item.path === path) return false
          if (item.children) return { ...item, children: updateTree(item.children) }
          return true
        })
      }
      updateState({
        editor: {
          ...state.editor,
          fileTree: updateTree(state.editor.fileTree || sampleFileTree),
          openFiles: state.editor.openFiles.filter((tab) => tab.path !== path),
          activeFile: state.editor.activeFile === path ? null : state.editor.activeFile,
        },
      })
      toast({ title: "Deleted", description: `Deleted ${path.split("/").pop()}` })
    } else if (action === "Rename") {
      const newName = prompt("Enter new name:", path.split("/").pop())
      if (newName) {
        const updateTree = (items: FileTreeItem[]): FileTreeItem[] => {
          return items.map((item) => {
            if (item.path === path) return { ...item, name: newName, path: `${path.split("/").slice(0, -1).join("/")}/${newName}` }
            if (item.children) return { ...item, children: updateTree(item.children) }
            return item
          })
        }
        updateState({
          editor: {
            ...state.editor,
            fileTree: updateTree(state.editor.fileTree || sampleFileTree),
            openFiles: state.editor.openFiles.map((tab) =>
              tab.path === path ? { ...tab, name: newName, path: `${path.split("/").slice(0, -1).join("/")}/${newName}` } : tab
            ),
          },
        })
        toast({ title: "Renamed", description: `Renamed to ${newName}` })
      }
    }
    setContextMenu(null)
  }

  const renderFileTree = (items: FileTreeItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.id} style={{ paddingLeft: `${level * 16}px` }}>
        <div
          className={`flex items-center py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer rounded-sm ${level === 0 ? "mt-1" : ""}`}
          onClick={() => {
            if (item.type === "folder") toggleFolder(item.path)
            else onFileSelect(item.path)
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            setContextMenu({ path: item.path, x: e.clientX, y: e.clientY })
          }}
        >
          {item.type === "folder" ? (
            <>
              {item.isOpen ? <ChevronDown className="h-4 w-4 mr-1 text-gray-400" /> : <ChevronRight className="h-4 w-4 mr-1 text-gray-400" />}
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
        {item.type === "folder" && item.isOpen && item.children && <div>{renderFileTree(item.children, level + 1)}</div>}
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
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleFileOperation("New File", "src")}>
                  <FileText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New File</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleFileOperation("New Folder", "src")}>
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New Folder</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <ScrollArea className="h-full">
        <div className="p-2">{renderFileTree(state.editor.fileTree || sampleFileTree)}</div>
      </ScrollArea>
      {contextMenu && (
        <DropdownMenu open={true} onOpenChange={() => setContextMenu(null)}>
          <DropdownMenuContent style={{ position: "absolute", top: contextMenu.y, left: contextMenu.x }} className="bg-[#252526] border-[#3c3c3c] text-gray-300">
            <DropdownMenuItem onClick={() => handleFileOperation("New File", contextMenu.path)}>New File</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFileOperation("New Folder", contextMenu.path)}>New Folder</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFileOperation("Rename", contextMenu.path)}>Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFileOperation("Delete", contextMenu.path)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

// Terminal Component
function TerminalComponent() {
  const { state, updateState } = React.useContext(AppContext)
  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [state.editor.commandHistory])

  const executeCommand = (cmd: string) => {
    const command = cmd.trim().toLowerCase()
    const newHistory = [...state.editor.commandHistory, `$ ${cmd}`]

    if (command === "help") {
      newHistory.push("Available commands: help, clear, ls, pwd, echo, date, npm, git")
    } else if (command === "clear") {
      newHistory.length = 0
      newHistory.push("Terminal cleared", "Type 'help' to see available commands")
    } else if (command === "ls") {
      newHistory.push("src/ public/ package.json tsconfig.json README.md")
    } else if (command === "pwd") {
      newHistory.push("/home/user/codefusion")
    } else if (command.startsWith("echo ")) {
      newHistory.push(cmd.substring(5))
    } else if (command === "date") {
      newHistory.push(new Date().toString())
    } else if (command === "npm start") {
      newHistory.push("Starting development server...", "Local: http://localhost:3000")
    } else if (command === "git status") {
      newHistory.push(
        "On branch main",
        "Your branch is up to date with 'origin/main'.",
        "nothing to commit, working tree clean"
      )
    } else if (command === "") {
      // Do nothing
    } else {
      newHistory.push(`Command not found: ${cmd}. Type 'help' for available commands.`)
    }

    updateState({ editor: { ...state.editor, commandHistory: newHistory, currentCommand: "" } })
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-white font-mono text-sm p-2">
      <div className="flex-1 overflow-auto">
        {state.editor.commandHistory.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap mb-1">{line}</div>
        ))}
        <div ref={terminalEndRef} />
      </div>
      <div className="flex items-center mt-2">
        <span className="text-green-400 mr-2">$</span>
        <input
          type="text"
          value={state.editor.currentCommand}
          onChange={(e) => updateState({ editor: { ...state.editor, currentCommand: e.target.value } })}
          onKeyDown={(e) => {
            if (e.key === "Enter") executeCommand(state.editor.currentCommand)
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
  const { state } = React.useContext(AppContext)
  const problems = [
    { id: 1, type: "error", message: "Cannot find module 'react-router-dom'", file: "src/components/App.tsx", line: 2 },
    { id: 2, type: "warning", message: "Variable 'data' is declared but never used", file: "src/hooks/useAuth.ts", line: 15 },
    { id: 3, type: "info", message: "Consider using const instead of let here", file: "src/index.tsx", line: 5 },
  ]

  return (
    <div className="h-full bg-[#1e1e1e] text-gray-300 text-sm p-2 overflow-y-auto">
      <div className="mb-2 font-semibold">PROBLEMS ({problems.length})</div>
      {problems.map((problem) => (
        <div
          key={problem.id}
          className="flex items-start py-1 px-2 hover:bg-[#2a2d2e] rounded-sm cursor-pointer"
          onClick={() => {
            const tab = state.editor.openFiles.find((t) => t.path === problem.file)
            if (tab) {
              updateState({ editor: { ...state.editor, activeFile: tab.id } })
            }
          }}
        >
          {problem.type === "error" ? (
            <AlertCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
          ) : problem.type === "warning" ? (
            <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500 mt-0.5" />
          ) : (
            <Info className="h-4 w-4 mr-2 text-blue-500 mt-0.5" />
          )}
          <div>
            <div>{problem.message}</div>
            <div className="text-gray-500 text-xs">{problem.file}:{problem.line}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// VS Code Architecture Component
function VSCodeArchitecture() {
  const architectureRef = useRef<HTMLDivElement>(null)
  const workflowRef = useRef<HTMLDivElement>(null)
  const extensionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const renderDiagrams = async () => {
      try {
        if (architectureRef.current) {
          const { svg } = await mermaid.render(
            "architecture-diagram",
            `graph TD
              A["VS Code Menu System"] --> B["File"]
              A --> C["Edit"]
              A --> D["Selection"]
              A --> E["View"]
              A --> F["Go"]
              A --> G["Run"]
              A --> H["Terminal"]
              A --> I["Help"]
              B --> B1["New File/Folder"]
              B --> B2["Open File/Folder"]
              B --> B3["Save Operations"]
              B --> B4["Preferences"]
              C --> C1["Clipboard Operations"]
              C --> C2["Find & Replace"]
              C --> C3["Line Operations"]
              C --> C4["Selection Operations"]
              D --> D1["Selection Operations"]
              E --> E1["Command Palette"]
              E --> E2["Sidebar Panels"]
              E --> E3["Editor Layout"]
              E --> E4["Appearance Settings"]
              F --> F1["Navigation History"]
              F --> F2["Go to Location"]
              F --> F3["Go to Symbol"]
              F --> F4["Go to Problem"]
              G --> G1["Debug Operations"]
              G --> G2["Run Tasks"]
              G --> G3["Breakpoints"]
              H --> H1["Terminal Operations"]
              H --> H2["Terminal Configuration"]
              I --> I1["Documentation"]
              I --> I2["Support"]
              I --> I3["About"]
              J["Editor Component"] --> K["Tabs"]
              J --> L["Editor Area"]
              J --> M["Status Bar"]
              K --> K1["Tab Management"]
              L --> L1["Code Editing"]
              L --> L2["Intellisense"]
              M --> M1["Status Information"]
              N["Sidebar"] --> N1["Explorer"]
              N --> N2["Search"]
              N --> N3["Source Control"]
              N --> N4["Run and Debug"]
              N --> N5["Extensions"]
              O["Panel"] --> O1["Problems"]
              O --> O2["Output"]
              O --> O3["Debug Console"]
              O --> O4["Terminal"]
              A --- J
              J --- N
              J --- O`
          )
          architectureRef.current.innerHTML = svg
        }
        if (workflowRef.current) {
          const { svg } = await mermaid.render(
            "workflow-diagram",
            `flowchart TD
              A["Start VS Code"] --> B{"Check for Updates"}
              B -->|"Updates Available"| C["Install Updates"]
              B -->|"No Updates"| D["Load Workspace"]
              C --> D
              D --> E["Initialize Extensions"]
              E --> F["Load File Explorer"]
              F --> G["Restore Editor State"]
              G --> H{"Open Files?"}
              H -->|"Yes"| I["Load Files in Editor"]
              H -->|"No"| J["Show Welcome Page"]
              I --> K["Ready for Editing"]
              J --> K
              K --> L{"User Action"}
              L -->|"Edit File"| M["Update File in Memory"]
              L -->|"Save File"| N["Write to Disk"]
              L -->|"Run Code"| O["Execute in Terminal"]
              L -->|"Debug"| P["Start Debugger"]
              M --> L
              N --> L
              O --> L
              P --> L
              L -->|"Exit"| Q["Save Workspace State"]
              Q --> R["Close VS Code"]`
          )
          workflowRef.current.innerHTML = svg
        }
        if (extensionsRef.current) {
          const { svg } = await mermaid.render(
            "extensions-diagram",
            `graph TD
              A["VS Code Extension API"] --> B["Language Extensions"]
              A --> C["Debugger Extensions"]
              A --> D["Themes"]
              A --> E["Snippets"]
              A --> F["Custom UI Extensions"]
              B --> B1["Syntax Highlighting"]
              B --> B2["IntelliSense"]
              B --> B3["Formatters"]
              B --> B4["Linters"]
              C --> C1["Language Debuggers"]
              C --> C2["Custom Debug UI"]
              D --> D1["Color Themes"]
              D --> D2["Icon Themes"]
              F --> F1["Webviews"]
              F --> F2["Custom Editors"]
              F --> F3["Tree Views"]
              F --> F4["Status Bar Items"]
              G["Extension Marketplace"] --> G1["Browse Extensions"]
              G --> G2["Install Extensions"]
              G --> G3["Update Extensions"]
              G --> G4["Disable Extensions"]
              H["Extension Lifecycle"] --> H1["Activation Events"]
              H --> H2["Extension Context"]
              H --> H3["Subscriptions"]
              H --> H4["Disposal"]
              A --- G
              A --- H`
          )
          extensionsRef.current.innerHTML = svg
        }
      } catch (error) {
        console.error("Error rendering diagrams:", error)
      }
    }
    renderDiagrams()
  }, [])

  const handleZoomIn = () => {
    const svg = document.querySelector("svg")
    if (svg) {
      const viewBox = svg.getAttribute("viewBox")?.split(" ").map(Number) || [0, 0, 1000, 1000]
      const newWidth = viewBox[2] * 0.8
      const newHeight = viewBox[3] * 0.8
      const newX = viewBox[0] + (viewBox[2] - newWidth) / 2
      const newY = viewBox[1] + (viewBox[3] - newHeight) / 2
      svg.setAttribute("viewBox", `${newX} ${newY} ${newWidth} ${newHeight}`)
    }
  }

  const handleZoomOut = () => {
    const svg = document.querySelector("svg")
    if (svg) {
      const viewBox = svg.getAttribute("viewBox")?.split(" ").map(Number) || [0, 0, 1000, 1000]
      const newWidth = viewBox[2] * 1.2
      const newHeight = viewBox[3] * 1.2
      const newX = viewBox[0] - (newWidth - viewBox[2]) / 2
      const newY = viewBox[1] - (newHeight - viewBox[3]) / 2
      svg.setAttribute("viewBox", `${newX} ${newY} ${newWidth} ${newHeight}`)
    }
  }

  const handleDownload = (format: "svg" | "png") => {
    const svg = document.querySelector("svg")
    if (svg) {
      if (format === "svg") {
        const svgData = new XMLSerializer().serializeToString(svg)
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
        const svgUrl = URL.createObjectURL(svgBlob)
        const downloadLink = document.createElement("a")
        downloadLink.href = svgUrl
        downloadLink.download = "vs-code-architecture.svg"
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
      } else {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()
        const svgData = new XMLSerializer().serializeToString(svg)
        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0)
          const pngUrl = canvas.toDataURL("image/png")
          const downloadLink = document.createElement("a")
          downloadLink.href = pngUrl
          downloadLink.download = "vs-code-architecture.png"
          document.body.appendChild(downloadLink)
          downloadLink.click()
          document.body.removeChild(downloadLink)
        }
      }
    }
  }

  return (
    <div className="p-4 bg-[#1e1e1e] rounded-lg border border-[#3c3c3c] h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Architecture Diagrams</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleDownload("svg")}>Export as SVG</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("png")}>Export as PNG</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Tabs defaultValue="architecture" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="architecture">Component Architecture</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="extensions">Extensions</TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-auto mt-4 bg-[#252526] rounded-md p-4">
          <TabsContent value="architecture" className="h-full">
            <div ref={architectureRef} className="h-full flex items-center justify-center" />
          </TabsContent>
          <TabsContent value="workflow" className="h-full">
            <div ref={workflowRef} className="h-full flex items-center justify-center" />
          </TabsContent>
          <TabsContent value="extensions" className="h-full">
            <div ref={extensionsRef} className="h-full flex items-center justify-center" />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

// Chat Panel Component
function ChatPanel({ onInsertCode }: { onInsertCode: (code: string, language: string) => void }) {
  const { state, updateState } = React.useContext(AppContext)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [state.aiAssistant.messages])

  const generateAIResponse = (userInput: string): Message => {
    const lowerInput = userInput.toLowerCase()
    if (lowerInput.includes("function") || lowerInput.includes("create") || lowerInput.includes("write")) {
      if (lowerInput.includes("react") || lowerInput.includes("component")) {
        return {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Here's a React component based on your request:",
          code: {
            language: "typescript",
            value: `import React, { useState } from 'react';

function MyComponent() {
  const [count, setCount] = useState(0);

  return (
    <div className="component">
      <h2>My Component</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
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
  if (!Array.isArray(arr) || arr.length === 0) return [];
  return arr
    .filter(item => item !== null && item !== undefined)
    .map(item => {
      if (typeof item === 'string') return item.trim().toLowerCase();
      if (typeof item === 'number') return Math.round(item * 100) / 100;
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
    if (arr[i] % 2 === 0) result.push(arr[i]);
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
        content: "I can help with coding tasks, debugging, and optimization. Please provide more specific instructions or code snippets.",
      }
    }
  }

  const sendMessage = async () => {
    if (!state.aiAssistant.currentMessage.trim()) return
    setIsLoading(true)
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: state.aiAssistant.currentMessage,
    }
    updateState({ aiAssistant: { ...state.aiAssistant, messages: [...state.aiAssistant.messages, userMessage], currentMessage: "" } })
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.content)
      updateState({ aiAssistant: { ...state.aiAssistant, messages: [...state.aiAssistant.messages, aiResponse] } })
      setIsLoading(false)
    }, 1500)
  }

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopied(id)
    toast({ title: "Copied", description: "Code copied to clipboard" })
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-[#252526] text-white">
      <div className="flex-1 overflow-y-auto p-4">
        {state.aiAssistant.messages.map((message) => (
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
                <CodeEditor value={message.code.value} language={message.code.language} height="200px" readOnly />
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
                    onClick={() => onInsertCode(message.code!.value, message.code!.language)}
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
            value={state.aiAssistant.currentMessage}
            onChange={(e) => updateState({ aiAssistant: { ...state.aiAssistant, currentMessage: e.target.value } })}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage()
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

// API Hub Component
function APIHub() {
  const { state, updateState } = React.useContext(AppContext)
  const [newEndpoint, setNewEndpoint] = useState("")
  const { toast } = useToast()

  const addEndpoint = () => {
    if (newEndpoint.trim()) {
      updateState({ apiHub: { endpoints: [...state.apiHub.endpoints, newEndpoint] } })
      setNewEndpoint("")
      toast({ title: "Endpoint Added", description: `Added ${newEndpoint}` })
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300">
      <div className="p-4 border-b border-[#3c3c3c]">
        <h2 className="text-lg font-semibold">API Hub</h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="mb-4">
          <input
            type="text"
            value={newEndpoint}
            onChange={(e) => setNewEndpoint(e.target.value)}
            placeholder="Add new API endpoint..."
            className="w-full bg-[#252526] text-gray-300 p-2 rounded-md border border-[#3c3c3c]"
          />
          <Button onClick={addEndpoint} className="mt-2 bg-[#007acc] hover:bg-[#005f99]">
            Add Endpoint
          </Button>
        </div>
        {state.apiHub.endpoints.map((endpoint, index) => (
          <div key={index} className="p-3 mb-2 bg-[#252526] rounded-md">
            {endpoint}
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}

// Dashboard Component
function Dashboard() {
  const { state, updateState } = React.useContext(AppContext)
  const [newWidget, setNewWidget] = useState("")
  const { toast } = useToast()

  const addWidget = () => {
    if (newWidget.trim()) {
      updateState({ dashboard: { widgets: [...state.dashboard.widgets, newWidget] } })
      setNewWidget("")
      toast({ title: "Widget Added", description: `Added ${newWidget}` })
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300">
      <div className="p-4 border-b border-[#3c3c3c]">
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="mb-4">
          <input
            type="text"
            value={newWidget}
            onChange={(e) => setNewWidget(e.target.value)}
            placeholder="Add new widget..."
            className="w-full bg-[#252526] text-gray-300 p-2 rounded-md border border-[#3c3c3c]"
          />
          <Button onClick={addWidget} className="mt-2 bg-[#007acc] hover:bg-[#005f99]">
            Add Widget
          </Button>
        </div>
        {state.dashboard.widgets.map((widget, index) => (
          <div key={index} className="p-3 mb-2 bg-[#252526] rounded-md">
            {widget}
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}

// Settings Component
function Settings() {
  const { state, updateState } = React.useContext(AppContext)
  const { toast } = useToast()

  const handleThemeChange = (theme: string) => {
    updateState({ settings: { ...state.settings, theme } })
    document.documentElement.setAttribute('data-theme', theme)
    toast({ title: "Theme Updated", description: `Switched to ${theme} theme` })
  }

  const handleFontSizeChange = (fontSize: number) => {
    updateState({ settings: { ...state.settings, fontSize } })
    toast({ title: "Font Size Updated", description: `Set font size to ${fontSize}px` })
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300">
      <div className="p-4 border-b border-[#3c3c3c]">
        <h2 className="text-lg font-semibold">Settings</h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Theme</h3>
          <select
            value={state.settings.theme}
            onChange={(e) => handleThemeChange(e.target.value)}
            className="w-full bg-[#252526] text-gray-300 p-2 rounded-md border border-[#3c3c3c]"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="high-contrast">High Contrast</option>
          </select>
        </div>
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Font Size</h3>
          <input
            type="number"
            value={state.settings.fontSize}
            onChange={(e) => handleFontSizeChange(Number(e.target.value))}
            className="w-full bg-[#252526] text-gray-300 p-2 rounded-md border border-[#3c3c3c]"
            min="10"
            max="24"
          />
        </div>
      </ScrollArea>
    </div>
  )
}

// Project Component
function Project() {
  const { state, updateState } = React.useContext(AppContext)
  const { toast } = useToast()

  const handleDetailsChange = (details: string) => {
    updateState({ project: { details } })
    toast({ title: "Project Updated", description: "Project details saved" })
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300">
      <div className="p-4 border-b border-[#3c3c3c]">
        <h2 className="text-lg font-semibold">Project</h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        <textarea
          value={state.project.details}
          onChange={(e) => handleDetailsChange(e.target.value)}
          placeholder="Enter project details (e.g., README, documentation)..."
          className="w-full h-40 bg-[#252526] text-gray-300 p-2 rounded-md border border-[#3c3c3c]"
        />
      </ScrollArea>
    </div>
  )
}

// AI Assistant Component
function AIAssistant() {
  const editorRef = useRef<{
    insertCode: (code: string, language?: string) => void
  }>(null)

  const handleInsertCode = useCallback((code: string, language = "javascript") => {
    editorRef.current?.insertCode(code, language)
  }, [])

  return (
    <div className="grid lg:grid-cols-12 gap-4 h-[calc(100vh-2rem)]">
      <div className="lg:col-span-8 h-full">
        <VSCodeEditor ref={editorRef} />
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

// VS Code Editor Component
function VSCodeEditor({ ref }: { ref?: React.RefObject<any> }) {
  const { state, updateState } = React.useContext(AppContext)
  const [activeIcon, setActiveIcon] = useState("explorer")
  const [terminalHeight, setTerminalHeight] = useState(200)
  const [isResizing, setIsResizing] = useState(false)
  const [startY, setStartY] = useState(0)
  const { toast } = useToast()

  const handleFileSelect = (path: string) => {
    const existingTab = state.editor.openFiles.find((tab) => tab.path === path)
    if (existingTab) {
      updateState({ editor: { ...state.editor, activeFile: existingTab.id } })
      return
    }

    const fileData = sampleFileContents[path]
    if (!fileData) {
      toast({ title: "Error", description: "File content not found", variant: "destructive" })
      return
    }

    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      name: path.split("/").pop() || "",
      content: fileData.content,
      language: fileData.language,
      path: path,
      isDirty: false,
    }

    updateState({
      editor: {
        ...state.editor,
        openFiles: [...state.editor.openFiles, newTab],
        activeFile: newTab.id,
      },
    })
  }

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const tab = state.editor.openFiles.find((t) => t.id === id)
    if (tab?.isDirty) {
      if (!confirm("Unsaved changes will be lost. Close tab?")) return
    }
    const newTabs = state.editor.openFiles.filter((tab) => tab.id !== id)
    const newActiveFile = id === state.editor.activeFile ? (newTabs.length ? newTabs[newTabs.length - 1].id : null) : state.editor.activeFile
    updateState({ editor: { ...state.editor, openFiles: newTabs, activeFile: newActiveFile } })
    toast({ title: "Tab Closed", description: `Closed ${tab?.name}` })
  }

  const handleContentChange = (value: string, tabId: string) => {
    updateState({
      editor: {
        ...state.editor,
        openFiles: state.editor.openFiles.map((tab) =>
          tab.id === tabId ? { ...tab, content: value, isDirty: true } : tab
        ),
      },
    })
    if (state.settings.autoSave) {
      toast({ title: "Auto Saved", description: "Changes saved automatically" })
    }
  }

  const insertCodeIntoEditor = (code: string, language = "javascript") => {
    if (state.editor.activeFile) {
      const currentTab = state.editor.openFiles.find((tab) => tab.id === state.editor.activeFile)
      if (currentTab) {
        const newContent = currentTab.content + "\n\n" + code
        handleContentChange(newContent, state.editor.activeFile)
      }
    } else {
      const newTab: EditorTab = {
        id: `tab-${Date.now()}`,
        name: `ai-generated.${language === "python" ? "py" : "js"}`,
        content: code,
        language,
        isDirty: true,
      }
      updateState({
        editor: {
          ...state.editor,
          openFiles: [...state.editor.openFiles, newTab],
          activeFile: newTab.id,
        },
      })
    }
  }

  React.useImperativeHandle(ref, () => ({
    insertCode: insertCodeIntoEditor,
  }))

  const toggleSidebar = (icon: string) => {
    if (icon === "explorer") {
      updateState({ editor: { ...state.editor, showExplorer: !state.editor.showExplorer } })
    }
    setActiveIcon(icon)
  }

  const togglePanel = (panel: string) => {
    updateState({
      editor: {
        ...state.editor,
        showTerminal: panel === "terminal" ? !state.editor.showTerminal : state.editor.showTerminal,
        showProblems: panel === "problems" ? !state.editor.showProblems : state.editor.showProblems,
        activePanel: panel,
      },
    })
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
    const handleMouseUp = () => setIsResizing(false)
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, startY])

  const handleMenuAction = (action: string) => {
    if (action === "New File") {
      const newTab: EditorTab = {
        id: `tab-${Date.now()}`,
        name: `untitled-${Date.now()}.js`,
        content: "// Start coding here\n\n",
        language: "javascript",
        isDirty: true,
      }
      updateState({
        editor: {
          ...state.editor,
          openFiles: [...state.editor.openFiles, newTab],
          activeFile: newTab.id,
        },
      })
      toast({ title: "New File", description: `Created ${newTab.name}` })
    } else if (action === "Open File...") {
      // Simulate file picker (replace with actual file input logic)
      handleFileSelect("src/index.tsx")
    } else if (action === "Save") {
      const activeTab = state.editor.openFiles.find((t) => t.id === state.editor.activeFile)
      if (activeTab) {
        updateState({
          editor: {
            ...state.editor,
            openFiles: state.editor.openFiles.map((tab) =>
              tab.id === activeTab.id ? { ...tab, isDirty: false } : tab
            ),
          },
        })
        toast({ title: "Saved", description: `Saved ${activeTab.name}` })
      }
    } else if (action === "Close Editor") {
      if (state.editor.activeFile) closeTab(state.editor.activeFile, { stopPropagation: () => {} } as any)
    } else if (action === "Command Palette") {
      toast({ title: "Command Palette", description: "Opened command palette" })
    } else if (action === "Explorer") {
      toggleSidebar("explorer")
    } else if (action === "New Terminal") {
      togglePanel("terminal")
    } else if (action === "Start Debugging") {
      toast({ title: "Debugging", description: "Started debugging session" })
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border rounded-md overflow-hidden">
      <VSCodeMenu onMenuAction={handleMenuAction} />
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
            <div className="flex-1" />
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
        {state.editor.showExplorer && (
          <div className="w-64 h-full border-r border-[#252526]">
            <FileExplorer onFileSelect={handleFileSelect} />
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Bar */}
          <div className="flex items-center border-b border-[#252526] bg-[#252526]">
            <ScrollArea orientation="horizontal" className="w-full">
              <div className="flex">
                {state.editor.openFiles.map((tab) => (
                  <button
                    key={tab.id}
                    className={`flex items-center h-9 px-3 border-r border-[#252526] ${
                      state.editor.activeFile === tab.id ? "bg-[#1e1e1e]" : "bg-[#2d2d2d] hover:bg-[#2a2a2a]"
                    }`}
                    onClick={() => updateState({ editor: { ...state.editor, activeFile: tab.id } })}
>
                    <span className="text-gray-300 text-sm">
                      {tab.isDirty ? "● " : ""}
                      {tab.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 h-5 w-5"
                      onClick={(e) => closeTab(tab.id, e)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center px-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  updateState({
                    editor: {
                      ...state.editor,
                      openFiles: state.editor.openFiles.map((tab) =>
                        tab.id === state.editor.activeFile
                          ? { ...tab, content: tab.content, language: tab.language, isDirty: false }
                          : tab
                      ),
                    },
                  })
                  toast({ title: "Saved", description: "File saved" })
                }}
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  if (state.editor.openFiles.length > 1) {
                    updateState({
                      editor: { ...state.editor, splitView: !state.editor.splitView },
                    })
                  }
                }}
              >
                <Split className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 flex overflow-hidden">
            {state.editor.splitView && state.editor.openFiles.length > 1 ? (
              <div className="flex flex-1">
                <div className="flex-1">
                  <CodeEditor
                    value={
                      state.editor.openFiles.find((tab) => tab.id === state.editor.activeFile)?.content || ""
                    }
                    language={
                      state.editor.openFiles.find((tab) => tab.id === state.editor.activeFile)?.language ||
                      "javascript"
                    }
                    height="100%"
                    onChange={(value) => handleContentChange(value, state.editor.activeFile || "")}
                  />
                </div>
                <div className="flex-1 border-l border-[#252526]">
                  <CodeEditor
                    value={state.editor.openFiles[1]?.content || ""}
                    language={state.editor.openFiles[1]?.language || "javascript"}
                    height="100%"
                    onChange={(value) => handleContentChange(value, state.editor.openFiles[1]?.id || "")}
                  />
                </div>
              </div>
            ) : (
              <CodeEditor
                value={
                  state.editor.openFiles.find((tab) => tab.id === state.editor.activeFile)?.content || ""
                }
                language={
                  state.editor.openFiles.find((tab) => tab.id === state.editor.activeFile)?.language ||
                  "javascript"
                }
                height="100%"
                onChange={(value) => handleContentChange(value, state.editor.activeFile || "")}
              />
            )}
          </div>

          {/* Panel Area (Terminal/Problems) */}
          {(state.editor.showTerminal || state.editor.showProblems) && (
            <div className="flex flex-col bg-[#1e1e1e] border-t border-[#252526]" style={{ height: terminalHeight }}>
              <div
                className="w-full h-2 bg-[#252526] cursor-ns-resize"
                onMouseDown={handleMouseDown}
              />
              <div className="flex items-center justify-between p-2 border-b border-[#252526] bg-[#252526]">
                <div className="flex gap-2">
                  <Button
                    variant={state.editor.activePanel === "terminal" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => togglePanel("terminal")}
                  >
                    Terminal
                  </Button>
                  <Button
                    variant={state.editor.activePanel === "problems" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => togglePanel("problems")}
                  >
                    Problems
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    updateState({
                      editor: { ...state.editor, showTerminal: false, showProblems: false },
                    })
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                {state.editor.activePanel === "terminal" && state.editor.showTerminal && <TerminalComponent />}
                {state.editor.activePanel === "problems" && state.editor.showProblems && <ProblemsPanel />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between h-6 bg-[#007acc] text-white text-xs px-2">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          <span>main</span>
          <Sparkles className="h-4 w-4" />
          <span>AI Assistant: Ready</span>
          {state.settings.autoSave && <span>Auto Save: On</span>}
        </div>
        <div className="flex items-center gap-2">
          <span>
            {state.editor.openFiles.find((tab) => tab.id === state.editor.activeFile)?.language || "Plain Text"}
          </span>
          <span>UTF-8</span>
          <span>Ln 1, Col 1</span>
        </div>
      </div>
    </div>
  )
}

// Main App Component
function App() {
  const [state, setState] = useState<AppState>(() => {
    // Load initial state from localStorage or use default
    const savedState = localStorage.getItem("appState")
    return savedState
      ? JSON.parse(savedState)
      : {
          aiAssistant: { messages: [], currentMessage: "" },
          editor: {
            openFiles: [],
            activeFile: null,
            showExplorer: true,
            showTerminal: false,
            showProblems: false,
            activePanel: null,
            splitView: false,
            fileTree: sampleFileTree,
            commandHistory: ["Welcome to CodeFusion Terminal", "Type 'help' to see available commands"],
            currentCommand: "",
          },
          apiHub: { endpoints: [] },
          dashboard: { widgets: [] },
          settings: { theme: "dark", autoSave: true, fontSize: 14 },
          project: { details: "" },
        }
  })

  const updateState = useCallback((newState: Partial<AppState>) => {
    setState((prev) => {
      const updated = { ...prev, ...newState }
      // Persist state to localStorage
      localStorage.setItem("appState", JSON.stringify(updated))
      return updated
    })
  }, [])

  useEffect(() => {
    // Apply theme
    document.documentElement.setAttribute("data-theme", state.settings.theme)
  }, [state.settings.theme])

  return (
    <AppContext.Provider value={{ state, updateState }}>
      <div className="h-screen w-screen bg-[#1e1e1e] text-gray-300 flex flex-col">
        <Tabs defaultValue="editor" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-7 bg-[#252526] border-b border-[#3c3c3c]">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
            <TabsTrigger value="api-hub">API Hub</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="project">Project</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="flex-1">
            <VSCodeEditor />
          </TabsContent>
          <TabsContent value="ai-assistant" className="flex-1 p-4">
            <AIAssistant />
          </TabsContent>
          <TabsContent value="api-hub" className="flex-1">
            <APIHub />
          </TabsContent>
          <TabsContent value="dashboard" className="flex-1">
            <Dashboard />
          </TabsContent>
          <TabsContent value="settings" className="flex-1">
            <Settings />
          </TabsContent>
          <TabsContent value="project" className="flex-1">
            <Project />
          </TabsContent>
          <TabsContent value="architecture" className="flex-1 p-4">
            <VSCodeArchitecture />
          </TabsContent>
        </Tabs>
      </div>
    </AppContext.Provider>
  )
}

export default App
