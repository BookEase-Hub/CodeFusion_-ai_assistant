"use client"

import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
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
import { Input } from "@/components/ui/input"
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
import { useToast } from "@/components/ui/use-toast"
import mermaid from "mermaid"
import CodeMirror from "@uiw/react-codemirror"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import { javascript } from "@codemirror/lang-javascript"
import { json } from "@codemirror/lang-json"
import { html } from "@codemirror/lang-html"
import { python } from "@codemirror/lang-python"
import { useMediaQuery } from "react-responsive"

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
  history?: string[]
  historyIndex?: number
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

// Sample File Tree and Contents
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
          {
            id: "footer.tsx",
            name: "Footer.tsx",
            type: "file",
            path: "src/components/Footer.tsx",
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
          {
            id: "use-theme.ts",
            name: "useTheme.ts",
            type: "file",
            path: "src/hooks/useTheme.ts",
            language: "typescript",
          },
        ],
      },
      {
        id: "index.tsx",
        name: "index.tsx",
        type: "file",
        path: "src/index.tsx",
        language: "typescript",
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
      },
      {
        id: "favicon.ico",
        name: "favicon.ico",
        type: "file",
        path: "public/favicon.ico",
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
  {
    id: "tsconfig.json",
    name: "tsconfig.json",
    type: "file",
    path: "tsconfig.json",
    language: "json",
  },
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

  const login = async (credentials: any) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const userData = { id: 1, name: 'Test User', email: 'test@example.com' };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    setLoading(false);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return { user, isAuthenticated, loading, login, logout };
}

export default useAuth;`,
  },
  "src/hooks/useTheme.ts": {
    language: "typescript",
    content: `import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return { theme, toggleTheme };
}

export default useTheme;`,
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
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@types/react": "^18.0.28",
    "@types/react-dom": "^18.0.11"
  }
}`,
  },
  "tsconfig.json": {
    language: "json",
    content: `{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
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
  "include": [
    "src"
  ]
}`,
  },
}

// State Management Context
import { createContext, useContext } from "react"

interface EditorContextType {
  tabs: EditorTab[]
  setTabs: React.Dispatch<React.SetStateAction<EditorTab[]>>
  activeTab: string | null
  setActiveTab: React.Dispatch<React.SetStateAction<string | null>>
  showExplorer: boolean
  setShowExplorer: React.Dispatch<React.SetStateAction<boolean>>
  showTerminal: boolean
  setShowTerminal: React.Dispatch<React.SetStateAction<boolean>>
  showProblems: boolean
  setShowProblems: React.Dispatch<React.SetStateAction<boolean>>
  activePanel: string | null
  setActivePanel: React.Dispatch<React.SetStateAction<string | null>>
  insertCode: (code: string, language?: string) => void
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

const useEditor = () => {
  const context = useContext(EditorContext)
  if (!context) throw new Error("useEditor must be used within EditorProvider")
  return context
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
  onUndo,
  onRedo,
}: {
  value: string
  language: string
  height: string
  onChange?: (value: string) => void
  readOnly?: boolean
  onUndo?: () => void
  onRedo?: () => void
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
      onKeyDown={(e) => {
        if (e.ctrlKey && e.key === "z") {
          e.preventDefault()
          onUndo?.()
        }
        if (e.ctrlKey && e.key === "y") {
          e.preventDefault()
          onRedo?.()
        }
      }}
      style={{ fontSize: 14, fontFamily: `"Fira Code", "JetBrains Mono", monospace` }}
    />
  )
}

// VSCodeArchitecture Component
function VSCodeArchitecture() {
  const architectureRef = useRef<HTMLDivElement>(null)
  const workflowRef = useRef<HTMLDivElement>(null)
  const extensionsRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const renderDiagrams = async () => {
      try {
        if (architectureRef.current) {
          const { svg } = await mermaid.render(
            "architecture-diagram",
            `
            graph TD
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
              J --- O
            `,
          )
          architectureRef.current.innerHTML = svg
        }

        if (workflowRef.current) {
          const { svg } = await mermaid.render(
            "workflow-diagram",
            `
            flowchart TD
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
              Q --> R["Close VS Code"]
            `,
          )
          workflowRef.current.innerHTML = svg
        }

        if (extensionsRef.current) {
          const { svg } = await mermaid.render(
            "extensions-diagram",
            `
            graph TD
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
              A --- H
            `,
          )
          extensionsRef.current.innerHTML = svg
        }
      } catch (error) {
        console.error("Error rendering diagrams:", error)
        toast({ title: "Error", description: "Failed to render architecture diagrams", variant: "destructive" })
      }
    }

    renderDiagrams()
  }, [toast])

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

  const handleDownload = () => {
    const svg = document.querySelector("svg")
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)
      const downloadLink = document.createElement("a")
      downloadLink.href = svgUrl
      downloadLink.download = "vs-code-architecture.svg"
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      toast({ title: "Downloaded", description: "Architecture diagram saved as SVG" })
    }
  }

  const handleRefresh = () => {
    window.location.reload()
    toast({ title: "Refreshed", description: "Architecture diagrams reloaded" })
  }

  return (
    <div className="p-4 bg-[#1e1e1e] rounded-lg border border-[#3c3c3c] h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">VS Code Architecture Diagrams</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
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

// Terminal Component
function TerminalComponent({ onExecute }: { onExecute?: (cmd: string) => void }) {
  const [commandHistory, setCommandHistory] = useState<string[]>([
    "Welcome to CodeFusion Terminal",
    "Type 'help' to see available commands",
  ])
  const [currentCommand, setCurrentCommand] = useState("")
  const [historyIndex, setHistoryIndex] = useState(-1)
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [commandHistory])

  const executeCommand = (cmd: string) => {
    setCommandHistory((prev) => [...prev, `$ ${cmd}`])
    onExecute?.(cmd)
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
      toast({ title: "Server Started", description: "Development server running at http://localhost:3000" })
    } else if (command === "git status") {
      setCommandHistory((prev) => [
        ...prev,
        "On branch main",
        "Your branch is up to date with 'origin/main'.",
        "nothing to commit, working tree clean",
      ])
    } else if (command === "") {
      // Do nothing
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
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex].replace(/^\$ /, ""))
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > -1) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentCommand(newIndex === -1 ? "" : commandHistory[commandHistory.length - 1 - newIndex].replace(/^\$ /, ""))
      }
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
        <Input
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

// File Explorer Component
function FileExplorer({ onFileSelect, onNewFile, onNewFolder, onRefresh }: {
  onFileSelect: (path: string) => void
  onNewFile: () => void
  onNewFolder: () => void
  onRefresh: () => void
}) {
  const [fileTree, setFileTree] = useState(sampleFileTree)
  const [contextMenu, setContextMenu] = useState<{ path: string; x: number; y: number } | null>(null)
  const { toast } = useToast()

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

  const handleContextMenu = (e: React.MouseEvent, item: FileTreeItem) => {
    e.preventDefault()
    setContextMenu({ path: item.path, x: e.clientX, y: e.clientY })
  }

  const handleRename = (path: string) => {
    const newName = prompt("Enter new name:")
    if (newName) {
      const updateTree = (items: FileTreeItem[]): FileTreeItem[] => {
        return items.map((item) => {
          if (item.path === path) {
            return { ...item, name: newName, path: item.path.replace(/[^/]+$/, newName) }
          } else if (item.children) {
            return { ...item, children: updateTree(item.children) }
          }
          return item
        })
      }
      setFileTree(updateTree(fileTree))
      toast({ title: "File renamed", description: `${path} renamed to ${newName}` })
    }
    setContextMenu(null)
  }

  const handleDelete = (path: string) => {
    if (confirm(`Delete ${path}?`)) {
      const updateTree = (items: FileTreeItem[]): FileTreeItem[] => {
        return items.filter((item) => {
          if (item.path === path) return false
          if (item.children) item.children = updateTree(item.children)
          return true
        })
      }
      setFileTree(updateTree(fileTree))
      toast({ title: "File deleted", description: `${path} was deleted` })
    }
    setContextMenu(null)
  }

  const handleDownload = (path: string) => {
    const fileData = sampleFileContents[path]
    if (fileData) {
      const blob = new Blob([fileData.content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = path.split("/").pop() || "file"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({ title: "Downloaded", description: `${path} downloaded` })
    }
    setContextMenu(null)
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
          onContextMenu={(e) => handleContextMenu(e, item)}
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
      {contextMenu && (
        <DropdownMenu open={!!contextMenu} onOpenChange={() => setContextMenu(null)}>
          <DropdownMenuContent
            style={{ position: "fixed", top: contextMenu.y, left: contextMenu.x }}
            className="bg-[#252526] border-[#3c3c3c] text-gray-300"
          >
            <DropdownMenuItem onClick={() => handleRename(contextMenu.path)}>Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(contextMenu.path)}>Delete</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload(contextMenu.path)}>Download</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

// Problems Panel Component
function ProblemsPanel({ onProblemClick }: { onProblemClick?: (file: string, line: number) => void }) {
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
      <div className="mb-2 font-semibold">PROBLEMS ({problems.length})</div>
      {problems.map((problem) => (
        <div
          key={problem.id}
          className="flex items-start py-1 px-2 hover:bg-[#2a2d2e] rounded-sm cursor-pointer"
          onClick={() => onProblemClick?.(problem.file, problem.line)}
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
            <div className="text-gray-500 text-xs">
              {problem.file}:{problem.line}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// VSCodeMenu Component
function VSCodeMenu({ onMenuAction }: { onMenuAction: (action: string, data?: any) => void }) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const { toast } = useToast()

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

  const menuData: MenuCategory[] = [
    {
      label: "File",
      icon: FileIcon,
      items: [
        {
          label: "New File",
          shortcut: "Ctrl+N",
          icon: Plus,
          action: () => onMenuAction("newFile"),
        },
        {
          label: "New Window",
          shortcut: "Ctrl+Shift+N",
          icon: PlusSquare,
          action: () => onMenuAction("newWindow"),
        },
        { divider: true },
        {
          label: "Open File...",
          shortcut: "Ctrl+O",
          icon: FileIcon,
          action: () => onMenuAction("openFile"),
        },
        {
          label: "Open Folder...",
          shortcut: "Ctrl+K Ctrl+O",
          icon: Folder,
          action: () => onMenuAction("openFolder"),
        },
        {
          label: "Open Recent",
          icon: Clock,
          submenu: [
            { label: "Reopen Closed Editor", shortcut: "Ctrl+Shift+T", action: () => onMenuAction("reopenClosed") },
            { divider: true },
            { label: "~/projects/codefusion", action: () => onMenuAction("openRecent", "~/projects/codefusion") },
            { label: "~/documents/notes.md", action: () => onMenuAction("openRecent", "~/documents/notes.md") },
            { divider: true },
            { label: "Clear Recently Opened", icon: X, action: () => onMenuAction("clearRecent") },
          ],
        },
        { divider: true },
        {
          label: "Save",
          shortcut: "Ctrl+S",
          icon: Save,
          action: () => onMenuAction("save"),
        },
        {
          label: "Save As...",
          shortcut: "Ctrl+Shift+S",
          icon: Save,
          action: () => onMenuAction("saveAs"),
        },
        {
          label: "Auto Save",
          checked: true,
          icon: ToggleRight,
          action: () => onMenuAction("toggleAutoSave"),
        },
        { divider: true },
        {
          label: "Close Editor",
          shortcut: "Ctrl+F4",
          icon: X,
          action: () => onMenuAction("closeEditor"),
        },
        {
          label: "Close Folder",
          shortcut: "Ctrl+K F",
          icon: FolderMinus,
          action: () => onMenuAction("closeFolder"),
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
          action: () => onMenuAction("undo"),
        },
        {
          label: "Redo",
          shortcut: "Ctrl+Y",
          icon: RotateCw,
          action: () => onMenuAction("redo"),
        },
        { divider: true },
        {
          label: "Cut",
          shortcut: "Ctrl+X",
          icon: Scissors,
          action: () => onMenuAction("cut"),
        },
        {
          label: "Copy",
          shortcut: "Ctrl+C",
          icon: Copy,
          action: () => onMenuAction("copy"),
        },
        {
          label: "Paste",
          shortcut: "Ctrl+V",
          icon: Clipboard,
          action: () => onMenuAction("paste"),
        },
        { divider: true },
        {
          label: "Find",
          shortcut: "Ctrl+F",
          icon: Search,
          action: () => onMenuAction("find"),
        },
        {
          label: "Replace",
          shortcut: "Ctrl+H",
          icon: Replace,
          action: () => onMenuAction("replace"),
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
          action: () => onMenuAction("commandPalette"),
        },
        { divider: true },
        {
          label: "Explorer",
          shortcut: "Ctrl+Shift+E",
          checked: true,
          action: () => onMenuAction("toggleExplorer"),
        },
        {
          label: "Search",
          shortcut: "Ctrl+Shift+F",
          checked: true,
          action: () => onMenuAction("toggleSearch"),
        },
        {
          label: "Source Control",
          shortcut: "Ctrl+Shift+G",
          checked: false,
          action: () => onMenuAction("toggleSourceControl"),
        },
        {
          label: "Terminal",
          shortcut: "Ctrl+`",
          action: () => onMenuAction("toggleTerminal"),
        },
      ],
    },
    {
      label: "Run",
      icon: FileIcon,
      items: [
        {
          label: "Start Debugging",
          shortcut: "F5",
          icon: Bug,
          action: () => onMenuAction("startDebugging"),
        },
        {
          label: "Run Without Debugging",
          shortcut: "Ctrl+F5",
          icon: Play,
          action: () => onMenuAction("runWithoutDebugging"),
        },
        {
          label: "Stop Debugging",
          shortcut: "Shift+F5",
          icon: Square,
          action: () => onMenuAction("stopDebugging"),
        },
        { divider: true },
        {
          label: "Step Over",
          shortcut: "F10",
          icon: StepForward,
          action: () => onMenuAction("stepOver"),
        },
        {
          label: "Step Into",
          shortcut: "F11",
          icon: ArrowDown,
          action: () => onMenuAction("stepInto"),
        },
        {
          label: "Step Out",
          shortcut: "Shift+F11",
          icon: ArrowUp,
          action: () => onMenuAction("stepOut"),
        },
      ],
    },
    {
      label: "Help",
      icon: FileIcon,
      items: [
        {
          label: "Documentation",
          icon: BookOpen,
          action: () => onMenuAction("documentation"),
        },
        {
          label: "About",
          icon: Info,
          action: () => onMenuAction("about"),
        },
      ],
    },
  ]

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

// VSCodeEditor Component
export function VSCodeEditor({ onCodeChange }: { onCodeChange?: (code: string) => void }) {
  const [tabs, setTabs] = useState<EditorTab[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [showExplorer, setShowExplorer] = useState(true)
  const [showTerminal, setShowTerminal] = useState(false)
  const [showProblems, setShowProblems] = useState(false)
  const [activePanel, setActivePanel] = useState<string | null>("terminal")
  const [activeIcon, setActiveIcon] = useState("explorer")
  const [terminalHeight, setTerminalHeight] = useState(200)
  const [isResizing, setIsResizing] = useState(false)
  const [startY, setStartY] = useState(0)
  const [autoSave, setAutoSave] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const editorRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = (path: string) => {
    const existingTab = tabs.find((tab) => tab.path === path)
    if (existingTab) {
      setActiveTab(existingTab.id)
      return
    }

    const fileData = sampleFileContents[path]
    if (!fileData) {
      toast({ title: "Error", description: "File not found", variant: "destructive" })
      return
    }

    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      name: path.split("/").pop() || "",
      content: fileData.content,
      language: fileData.language,
      path: path,
      history: [fileData.content],
      historyIndex: 0,
    }
    setTabs([...tabs, newTab])
    setActiveTab(newTab.id)
    toast({ title: "File Opened", description: `${newTab.name} opened` })
  }

  const handleNewFile = () => {
    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      name: "untitled.js",
      content: "// Start coding here\n\n",
      language: "javascript",
      history: ["// Start coding here\n\n"],
      historyIndex: 0,
    }
    setTabs([...tabs, newTab])
    setActiveTab(newTab.id)
    toast({ title: "New File", description: "Created new file" })
  }

  const handleNewFolder = () => {
    const folderName = prompt("Enter folder name:")
    if (folderName) {
      const newFolder: FileTreeItem = {
        id: `folder-${Date.now()}`,
        name: folderName,
        type: "folder",
        path: `src/${folderName}`,
        isOpen: false,
        children: [],
      }
      setFileTree((prev) => [...prev, newFolder])
      toast({ title: "New Folder", description: `Created folder ${folderName}` })
    }
  }

  const handleRefresh = () => {
    setFileTree(sampleFileTree)
    toast({ title: "Refreshed", description: "File explorer refreshed" })
  }

  const handleSave = () => {
    const currentTab = tabs.find((tab) => tab.id === activeTab)
    if (currentTab) {
      setTabs(tabs.map((tab) => (tab.id === activeTab ? { ...tab, isDirty: false } : tab)))
      toast({ title: "Saved", description: `${currentTab.name} saved` })
    }
  }

  const handleSaveAs = () => {
    const newName = prompt("Enter file name:")
    if (newName && activeTab) {
      setTabs(tabs.map((tab) => (tab.id === activeTab ? { ...tab, name: newName, isDirty: false } : tab)))
      toast({ title: "Saved As", description: `Saved as ${newName}` })
    }
  }

  const handleCloseEditor = () => {
    if (activeTab) {
      const currentTab = tabs.find((tab) => tab.id === activeTab)
      if (currentTab?.isDirty && !confirm("Unsaved changes will be lost. Close anyway?")) return
      closeTab(activeTab)
    }
  }

  const closeTab = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const newTabs = tabs.filter((tab) => tab.id !== id)
    if (newTabs.length === 0) {
      setActiveTab(null)
    } else if (id === activeTab) {
      setActiveTab(newTabs[newTabs.length - 1].id)
    }
    setTabs(newTabs)
    toast({ title: "Tab Closed", description: "Editor tab closed" })
  }

  const handleContentChange = (value: string, tabId: string) => {
    setTabs(tabs.map((tab) => {
      if (tab.id === tabId) {
        const newHistory = [...(tab.history || []).slice(0, tab.historyIndex! + 1), value]
        return { ...tab, content: value, isDirty: true, history: newHistory, historyIndex: newHistory.length - 1 }
      }
      return tab
    }))
    onCodeChange?.(value)
    if (autoSave) handleSave()
  }

  const handleUndo = () => {
    if (!activeTab) return
    const currentTab = tabs.find((tab) => tab.id === activeTab)
    if (currentTab && currentTab.historyIndex! > 0) {
      const newIndex = currentTab.historyIndex! - 1
      setTabs(tabs.map((tab) => 
        tab.id === activeTab 
          ? { ...tab, content: tab.history![newIndex], historyIndex: newIndex, isDirty: true }
          : tab
      ))
      toast({ title: "Undo", description: "Reverted last change" })
    }
  }

  const handleRedo = () => {
    if (!activeTab) return
    const currentTab = tabs.find((tab) => tab.id === activeTab)
    if (currentTab && currentTab.historyIndex! < currentTab.history!.length - 1) {
      const newIndex = currentTab.historyIndex! + 1
      setTabs(tabs.map((tab) => 
        tab.id === activeTab 
          ? { ...tab, content: tab.history![newIndex], historyIndex: newIndex, isDirty: true }
          : tab
      ))
      toast({ title: "Redo", description: "Reapplied last change" })
    }
  }

  const handleFind = () => {
    setSearchQuery(prompt("Enter search query:") || "")
  }

  const handleReplace = () => {
    if (!activeTab) return
    const currentTab = tabs.find((tab) => tab.id === activeTab)
    if (currentTab) {
      const search = prompt("Find:")
      const replace = prompt("Replace with:")
      if (search && replace) {
        const newContent = currentTab.content.replace(new RegExp(search, "g"), replace)
        handleContentChange(newContent, activeTab)
        toast({ title: "Replace", description: `Replaced ${search} with ${replace}` })
      }
    }
  }

  const insertCode = (code: string, language = "javascript") => {
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
        history: [code],
        historyIndex: 0,
      }
      setTabs([...tabs, newTab])
      setActiveTab(newTab.id)
    }
    toast({ title: "Code Inserted", description: "AI-generated code added to editor" })
  }

  const toggleSidebar = (icon: string) => {
    if (icon === "explorer") {
      setShowExplorer(!showExplorer)
    } else if (icon === "search") {
      setShowExplorer(false)
      toast({ title: "Search", description: "Search panel opened" })
    } else if (icon === "git") {
      setShowExplorer(false)
      toast({ title: "Source Control", description: "Source control panel opened" })
    } else if (icon === "debug") {
      setShowExplorer(false)
      toast({ title: "Debug", description: "Debug panel opened" })
    } else if (icon === "extensions") {
      setShowExplorer(false)
      toast({ title: "Extensions", description: "Extensions panel opened" })
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
      setTerminalHeight((prev) => Math.min(Math.max(prev + deltaY, 100), window.innerHeight * 0.5))
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

  const handleMenuAction = (action: string, data?: any) => {
    switch (action) {
      case "newFile":
        handleNewFile()
        break
      case "newWindow":
        window.open(window.location.href, "_blank")
        toast({ title: "New Window", description: "Opened new window" })
        break
      case "openFile":
        // Implement file picker logic
        toast({ title: "Open File", description: "File picker opened" })
        break
      case "openFolder":
        // Implement folder picker logic
        toast({ title: "Open Folder", description: "Folder picker opened" })
        break
      case "reopenClosed":
        // Implement reopen closed tab
        toast({ title: "Reopen Closed", description: "Reopening last closed editor" })
        break
      case "openRecent":
        handleFileSelect(data)
        break
      case "clearRecent":
        // Clear recent files
        toast({ title: "Recent Cleared", description: "Cleared recently opened files" })
        break
      case "save":
        handleSave()
        break
      case "saveAs":
        handleSaveAs()
        break
      case "toggleAutoSave":
        setAutoSave(!autoSave)
        toast({ title: "Auto Save", description: `Auto save ${autoSave ? "disabled" : "enabled"}` })
        break
      case "closeEditor":
        handleCloseEditor()
        break
      case "closeFolder":
        setFileTree([])
        setTabs([])
        setActiveTab(null)
        toast({ title: "Folder Closed", description: "Current folder closed" })
        break
      case "undo":
        handleUndo()
        break
      case "redo":
        handleRedo()
        break
      case "cut":
        document.execCommand("cut")
        toast({ title: "Cut", description: "Text cut to clipboard" })
        break
      case "copy":
        document.execCommand("copy")
        toast({ title: "Copy", description: "Text copied to clipboard" })
        break
      case "paste":
        document.execCommand("paste")
        toast({ title: "Paste", description: "Text pasted from clipboard" })
        break
      case "find":
        handleFind()
        break
      case "replace":
        handleReplace()
        break
      case "commandPalette":
        toast({ title: "Command Palette", description: "Command palette opened" })
        break
      case "toggleExplorer":
        setShowExplorer(!showExplorer)
        toast({ title: "Explorer", description: `Explorer ${showExplorer ? "hidden" : "shown"}` })
        break
      case "toggleSearch":
        toggleSidebar("search")
        break
      case "toggleSourceControl":
        toggleSidebar("git")
        break
      case "toggleTerminal":
        togglePanel("terminal")
        break
      case "startDebugging":
        toast({ title: "Debugging", description: "Started debugging session" })
        break
      case "runWithoutDebugging":
        toast({ title: "Run", description: "Running without debugging" })
        break
      case "stopDebugging":
        toast({ title: "Debugging", description: "Stopped debugging session" })
        break
      case "stepOver":
        toast({ title: "Debugging", description: "Stepped over" })
        break
      case "stepInto":
        toast({ title: "Debugging", description: "Stepped into" })
        break
      case "stepOut":
        toast({ title: "Debugging", description: "Stepped out" })
        break
      case "documentation":
        window.open("https://code.visualstudio.com/docs", "_blank")
        toast({ title: "Documentation", description: "Opened VS Code documentation" })
        break
      case "about":
        toast({ title: "About", description: "CodeFusion IDE v1.0.0" })
        break
    }
  }

  return (
    <EditorContext.Provider
      value={{
        tabs,
        setTabs,
        activeTab,
        setActiveTab,
        showExplorer,
        setShowExplorer,
        showTerminal,
        setShowTerminal,
        showProblems,
        setShowProblems,
        activePanel,
        setActivePanel,
        insertCode,
      }}
    >
      <div className={cn("flex flex-col h-full bg-[#1e1e1e] border rounded-md overflow-hidden", isMobile && "flex-col")}>
        <VSCodeMenu onMenuAction={handleMenuAction} />
        <div className="flex flex-1 overflow-hidden">
          {/* Activity Bar */}
          <div className={cn("w-12 h-full flex flex-col items-center bg-[#333333] py-4 gap-6", isMobile && "w-full flex-row justify-around")}>
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
                <TooltipContent side={isMobile ? "bottom" : "right"}>Explorer</TooltipContent>
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
                <TooltipContent side={isMobile ? "bottom" : "right"}>Search</TooltipContent>
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
                <TooltipContent side={isMobile ? "bottom" : "right"}>Source Control</TooltipContent>
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
                <TooltipContent side={isMobile ? "bottom" : "right"}>Run and Debug</TooltipContent>
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
                <TooltipContent side={isMobile ? "bottom" : "right"}>Extensions</TooltipContent>
              </Tooltip>
              <div className="flex-1" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-10 w-10 rounded-md ${activeIcon === "settings" ? "bg-[#37373d]" : ""}`}
                    onClick={() => toggleSidebar("settings")}
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={isMobile ? "bottom" : "right"}>Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Sidebar */}
          {showExplorer && (
            <div className={cn("w-64 h-full border-r border-[#252526]", isMobile && "w-full absolute z-10 bg-[#252526]")}>
              <FileExplorer
                onFileSelect={handleFileSelect}
                onNewFile={handleNewFile}
                onNewFolder={handleNewFolder}
                onRefresh={handleRefresh}
              />
            </div>
          )}

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col overflow-hidden" ref={editorRef}>
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
                        onUndo={handleUndo}
                        onRedo={handleRedo}
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
                  <Button variant="outline" className="mt-6 bg-transparent" onClick={handleNewFile}>
                    <Plus className="h-4 w-4 mr-2" />
                    New File
                  </Button>
                </div>
              )}
            </div>

            {/* Search Bar (when active) */}
            {searchQuery && (
              <div className="bg-[#252526] p-2 border-t border-[#3c3c3c] flex items-center gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in file..."
                  className="bg-[#1e1e1e] text-white border-[#3c3c3c]"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery("")}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

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
                          <TerminalComponent onExecute={(cmd) => toast({ title: "Command Executed", description: cmd })} />
                        </TabsContent>
                        <TabsContent value="problems" className="h-full">
                          <ProblemsPanel onProblemClick={handleFileSelect} />
                        </TabsContent>
                      </div>
                    </Tabs>
                    <div className="absolute right-2 flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
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
                <div className="flex items-center">
                  <Save className="h-3.5 w-3.5 mr-1" />
                  <span>Auto-Save: {autoSave ? "On" : "Off"}</span>
                </div>
                {searchQuery && (
                  <div className="flex items-center">
                    <Search className="h-3.5 w-3.5 mr-1" />
                    <span>Searching: {searchQuery}</span>
                  </div>
                )}
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-4">
                <span>{activeTab ? tabs.find((t) => t.id === activeTab)?.language || "JavaScript" : ""}</span>
                <span>UTF-8</span>
                <span>LF</span>
                <span>Ln 1, Col 1</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0"
                  onClick={() => toast({ title: "Notifications", description: "No new notifications" })}
                >
                  <AlertCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EditorContext.Provider>
  )
}

// AI Assistant Component
function AIAssistant({ onInsertCode }: { onInsertCode: (code: string, language?: string) => void }) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const { toast } = useToast()

  const handleGenerateCode = () => {
    if (!input.trim()) {
      toast({ title: "Error", description: "Please enter a prompt", variant: "destructive" })
      return
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, newMessage])

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const codeResponse = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant" as const,
        content: "Here's the generated code based on your request:",
        code: {
          language: input.includes("python") ? "python" : "javascript",
          value: input.includes("python")
            ? `def example_function():\n    print("Hello from AI-generated Python code!")`
            : `function exampleFunction() {\n  console.log("Hello from AI-generated JavaScript code!");\n}`,
        },
      }
      setMessages((prev) => [...prev, codeResponse])
      onInsertCode(codeResponse.code!.value, codeResponse.code!.language)
    }, 1000)

    setInput("")
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] p-4">
      <h2 className="text-xl font-bold text-white mb-4">AI Assistant</h2>
      <div className="flex-1 overflow-y-auto mb-4 bg-[#252526] rounded-md p-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-4 ${msg.role === "user" ? "text-right" : "text-left"}`}>
            <div
              className={`inline-block p-2 rounded-md ${
                msg.role === "user" ? "bg-blue-600 text-white" : "bg-[#333333] text-gray-300"
              }`}
            >
              {msg.content}
              {msg.code && (
                <div className="mt-2">
                  <CodeEditor
                    value={msg.code.value}
                    language={msg.code.language}
                    height="200px"
                    readOnly
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI to generate code..."
          className="bg-[#252526] text-white border-[#3c3c3c]"
        />
        <Button onClick={handleGenerateCode}>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate
        </Button>
      </div>
    </div>
  )
}

// Main App Component
export default function App() {
  const [activeTab, setActiveTab] = useState("editor")
  const { insertCode } = useEditor()

  return (
    <div className="h-screen flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-5 bg-[#252526]">
          <TabsTrigger value="ai" className="data-[state=active]:bg-[#1e1e1e]">AI Assistant</TabsTrigger>
          <TabsTrigger value="editor" className="data-[state=active]:bg-[#1e1e1e]">Editor</TabsTrigger>
          <TabsTrigger value="api" className="data-[state=active]:bg-[#1e1e1e]">API Hub</TabsTrigger>
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#1e1e1e]">Dashboard</TabsTrigger>
          <TabsTrigger value="architecture" className="data-[state=active]:bg-[#1e1e1e]">Architecture</TabsTrigger>
        </TabsList>
        <TabsContent value="ai" className="flex-1">
          <AIAssistant onInsertCode={insertCode} />
        </TabsContent>
        <TabsContent value="editor" className="flex-1">
          <VSCodeEditor />
        </TabsContent>
        <TabsContent value="api" className="flex-1">
          <div className="h-full p-4 bg-[#1e1e1e] text-white">
            <h2 className="text-xl font-bold mb-4">API Hub</h2>
            <p>Connect and manage APIs (Coming Soon)</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.open("https://x.ai/api", "_blank")}
            >
              Explore xAI API
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="dashboard" className="flex-1">
          <div className="h-full p-4 bg-[#1e1e1e] text-white">
            <h2 className="text-xl font-bold mb-4">Dashboard</h2>
            <p>Project analytics and insights (Coming Soon)</p>
          </div>
        </TabsContent>
        <TabsContent value="architecture" className="flex-1">
          <VSCodeArchitecture />
        </TabsContent>
      </Tabs>
    </div>
  )
}
  
// Chat Panel Component
function ChatPanel({ onInsertCode }: { onInsertCode: (code: string, language: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your AI coding assistant. I can help you write, debug, and optimize code. What would you like to work on?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { requireAuth } = useRequireAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateAIResponse = (userInput: string): Message => {
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
    if (!input.trim()) return

    setIsLoading(true)
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Simulate AI response (replace with actual API call later)
    setTimeout(() => {
      const aiResponse = generateAIResponse(input)
      setMessages((prev) => [...prev, aiResponse])
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
        {messages.map((message) => (
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
                    onClick={() => handleInsert(message.code!.value, message.code!.language)}
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
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

// ⬇️ append to the bottom of the file
// -----------------------------------------------------------------
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
          onCodeChange={() => {
            /* TODO: dispatch to global store for real-time sync */
          }}
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
// -----------------------------------------------------------------
