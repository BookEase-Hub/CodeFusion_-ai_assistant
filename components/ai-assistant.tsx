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
  SaveAll,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltips"
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
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import mermaid from "mermaid"
import CodeMirror from "@uiw/react-codemirror"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import { javascript } from "@codemirror/lang-javascript"
import { json } from "@codemirror/lang-json"
import { html } from "@codemirror/lang-html"
import { python } from "@codemirror/lang-python"
import { create } from "zustand"

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

// State Management with Zustand
interface EditorState {
  tabs: EditorTab[]
  activeTab: string | null
  showExplorer: boolean
  showTerminal: boolean
  showProblems: boolean
  activePanel: string | null
  terminalHeight: number
  autoSave: boolean
  addTab: (tab: EditorTab) => void
  setActiveTab: (id: string | null) => void
  updateTabContent: (id: string,media: string) => void
  closeTab: (id: string) => void
  toggleExplorer: () => void
  toggleTerminal: () => void
  toggleProblems: () => void
  setActivePanel: (panel: string | null) => void
  setTerminalHeight: (height: number) => void
  toggleAutoSave: () => void
}

const useEditorStore = create<EditorState>((set) => ({
  tabs: [],
  activeTab: null,
  showExplorer: true,
  showTerminal: false,
  showProblems: false,
  activePanel: "terminal",
  terminalHeight: 200,
  autoSave: false,
  addTab: (tab) => set((state) => ({ tabs: [...state.tabs, tab] })),
  setActiveTab: (id) => set({ activeTab: id }),
  updateTabContent: (id, content) =>
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id ? { ...tab, content, isDirty: true } : tab
      ),
    })),
  closeTab: (id) =>
    set((state) => {
      const newTabs = state.tabs.filter((tab) => tab.id !== id)
      return {
        tabs: newTabs,
        activeTab:
          id === state.activeTab ? (newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null) : state.activeTab,
      }
    }),
  toggleExplorer: () => set((state) => ({ showExplorer: !state.showExplorer })),
  toggleTerminal: () => set((state) => ({ showTerminal: !state.showTerminal })),
  toggleProblems: () => set((state) => ({ showProblems: !state.showProblems })),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setTerminalHeight: (height) => set({ terminalHeight: Math.min(Math.max(height, 100), 500) }),
  toggleAutoSave: () => set((state) => ({ autoSave: !state.autoSave })),
}))

// Mock useRequireAuth hook
const useRequireAuth = () => ({
  requireAuth: (feature: string) => true,
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

// Menu Data
const menuData: MenuCategory[] = [
  {
    label: "File",
    icon: FileIcon,
    items: [
      {
        label: "New File",
        shortcut: "Ctrl+N",
        icon: Plus,
        action: () => {
          const newTab: EditorTab = {
            id: `tab-${Date.now()}`,
            name: "untitled.js",
            content: "// Start coding here\n\n",
            language: "javascript",
          }
          useEditorStore.getState().addTab(newTab)
          useEditorStore.getState().setActiveTab(newTab.id)
          toast({ title: "New File Created", description: "A new untitled file has been opened." })
        },
      },
      {
        label: "New Window",
        shortcut: "Ctrl+Shift+N",
        icon: PlusSquare,
        action: () => console.log("New Window"),
      },
      {
        label: "Open File...",
        shortcut: "Ctrl+O",
        icon: FileIcon,
        action: () => {
          // Simulate file picker
          toast({ title: "Open File", description: "File picker not implemented in this demo." })
        },
      },
      {
        label: "Open Folder...",
        shortcut: "Ctrl+K Ctrl+O",
        icon: Folder,
        action: () => {
          // Simulate folder picker
          toast({ title: "Open Folder", description: "Folder picker not implemented in this demo." })
        },
      },
      {
        label: "Open Workspace...",
        icon: Layout,
        action: () => console.log("Open Workspace"),
      },
      {
        label: "Open Recent",
        icon: Clock,
        submenu: [
          { label: "Reopen Closed Editor", shortcut: "Ctrl+Shift+T" },
          { divider: true },
          { label: "~/projects/codefusion" },
          { label: "~/documents/notes.md" },
          { label: "~/downloads/example.js" },
          { divider: true },
          { label: "More...", icon: MoreHorizontal },
          { divider: true },
          { label: "Clear Recently Opened", icon: X },
        ],
      },
      { divider: true },
      {
        label: "Add Folder to Workspace...",
        icon: FolderPlus,
        action: () => console.log("Add Folder to Workspace"),
      },
      { divider: true },
      {
        label: "Save",
        shortcut: "Ctrl+S",
        icon: Save,
        action: () => {
          const { activeTab, tabs } = useEditorStore.getState()
          if (activeTab) {
            const tab = tabs.find((t) => t.id === activeTab)
            if (tab) {
              useEditorStore.getState().updateTabContent(tab.id, tab.content)
              toast({ title: "File Saved", description: `${tab.name} has been saved.` })
            }
          }
        },
      },
      {
        label: "Save As...",
        shortcut: "Ctrl+Shift+S",
        icon: Save,
        action: () => {
          toast({ title: "Save As", description: "Save as dialog not implemented in this demo." })
        },
      },
      {
        label: "Save All",
        shortcut: "Ctrl+K S",
        icon: SaveAll,
        action: () => {
          toast({ title: "Save All", description: "All files have been saved." })
        },
      },
      {
        label: "Auto Save",
        checked: useEditorStore.getState().autoSave,
        icon: ToggleRight,
        action: () => useEditorStore.getState().toggleAutoSave(),
      },
      { divider: true },
      {
        label: "Preferences",
        icon: Settings,
        submenu: [
          { label: "Settings", shortcut: "Ctrl+," },
          { label: "Keyboard Shortcuts", shortcut: "Ctrl+K Ctrl+S" },
          { label: "User Snippets" },
          { divider: true },
          { label: "Color Theme", shortcut: "Ctrl+K Ctrl+T" },
          { label: "File Icon Theme" },
        ],
      },
      { divider: true },
      {
        label: "Revert File",
        icon: RefreshCw,
        action: () => {
          toast({ title: "Revert File", description: "File reverted to last saved state." })
        },
      },
      { divider: true },
      {
        label: "Close Editor",
        shortcut: "Ctrl+F4",
        icon: X,
        action: () => {
          const { activeTab } = useEditorStore.getState()
          if (activeTab) {
            useEditorStore.getState().closeTab(activeTab)
            toast({ title: "Editor Closed", description: "The active editor has been closed." })
          }
        },
      },
      {
        label: "Close Folder",
        shortcut: "Ctrl+K F",
        icon: FolderMinus,
        action: () => {
          toast({ title: "Close Folder", description: "Current folder has been closed." })
        },
      },
      {
        label: "Close Window",
        shortcut: "Alt+F4",
        icon: X,
        action: () => console.log("Close Window"),
      },
      { divider: true },
      {
        label: "Exit",
        action: () => console.log("Exit"),
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
        action: () => {
          const { activeTab, tabs } = useEditorStore.getState()
          if (activeTab) {
            const tab = tabs.find((t) => t.id === activeTab)
            if (tab) {
              // Simulate undo (this would typically integrate with CodeMirror's history)
              toast({ title: "Undo", description: "Last change undone." })
            }
          }
        },
      },
      {
        label: "Redo",
        shortcut: "Ctrl+Y",
        icon: RotateCw,
        action: () => {
          toast({ title: "Redo", description: "Last change redone." })
        },
      },
      { divider: true },
      {
        label: "Cut",
        shortcut: "Ctrl+X",
        icon: Scissors,
        action: () => {
          toast({ title: "Cut", description: "Selected text cut to clipboard." })
        },
      },
      {
        label: "Copy",
        shortcut: "Ctrl+C",
        icon: Copy,
        action: () => {
          toast({ title: "Copy", description: "Selected text copied to clipboard." })
        },
      },
      {
        label: "Paste",
        shortcut: "Ctrl+V",
        icon: Clipboard,
        action: () => {
          toast({ title: "Paste", description: "Text pasted from clipboard." })
        },
      },
      { divider: true },
      {
        label: "Find",
        shortcut: "Ctrl+F",
        icon: Search,
        action: () => {
          toast({ title: "Find", description: "Find dialog opened." })
        },
      },
      {
        label: "Replace",
        shortcut: "Ctrl+H",
        icon: Replace,
        action: () => {
          toast({ title: "Replace", description: "Replace dialog opened." })
        },
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
        action: () => {
          toast({ title: "Select All", description: "All text selected." })
        },
      },
      {
        label: "Expand Selection",
        shortcut: "Shift+Alt+Right",
        action: () => {
          toast({ title: "Expand Selection", description: "Selection expanded." })
        },
      },
      {
        label: "Shrink Selection",
        shortcut: "Shift+Alt+Left",
        action: () => {
          toast({ title: "Shrink Selection", description: "Selection shrunk." })
        },
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
        action: () => {
          toast({ title: "Command Palette", description: "Command palette opened." })
        },
      },
      { divider: true },
      {
        label: "Explorer",
        shortcut: "Ctrl+Shift+E",
        checked: useEditorStore.getState().showExplorer,
        action: () => useEditorStore.getState().toggleExplorer(),
      },
      {
        label: "Search",
        shortcut: "Ctrl+Shift+F",
        checked: false,
        action: () => {
          toast({ title: "Search", description: "Search panel opened." })
        },
      },
      {
        label: "Source Control",
        shortcut: "Ctrl+Shift+G",
        checked: false,
        action: () => {
          toast({ title: "Source Control", description: "Source control panel opened." })
        },
      },
      {
        label: "Toggle Terminal",
        shortcut: "Ctrl+`",
        checked: useEditorStore.getState().showTerminal,
        action: () => useEditorStore.getState().toggleTerminal(),
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
        action: () => {
          toast({ title: "Back", description: "Navigated back." })
        },
      },
      {
        label: "Forward",
        shortcut: "Alt+Right",
        icon: ArrowRight,
        action: () => {
          toast({ title: "Forward", description: "Navigated forward." })
        },
      },
      { divider: true },
      {
        label "Go to File",
        shortcut: "Ctrl+P",
        action: () => {
          toast({ title: "Go to File", description: "Go to file dialog opened." })
        },
      },
      {
        label: "Go to Symbol",
        shortcut: "Ctrl+Shift+O",
        action: () => {
          toast({ title: "Go to Symbol", description: "Go to symbol dialog opened." })
        },
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
        action: () => {
          toast({ title: "Start Debugging", description: "Debugger started." })
        },
      },
      {
        label: "Run Without Debugging",
        shortcut: "Ctrl+F5",
        icon: Play,
        action: () => {
          toast({ title: "Run Without Debugging", description: "Code executed without debugger." })
        },
      },
      {
        label: "Stop Debugging",
        shortcut: "Shift+F5",
        icon: Square,
        action: () => {
          toast({ title: "Stop Debugging", description: "Debugger stopped." })
        },
      },
      { divider: true },
      {
        label: "Step Over",
        shortcut: "F10",
        icon: StepForward,
        action: () => {
          toast({ title: "Step Over", description: "Debugger stepped over." })
        },
      },
      {
        label: "Step Into",
        shortcut: "F11",
        icon: ArrowDown,
        action: () => {
          toast({ title: "Step Into", description: "Debugger stepped into." })
        },
      },
      {
        label: "Step Out",
        shortcut: "Shift+F11",
        icon: ArrowUp,
        action: () => {
          toast({ title: "Step Out", description: "Debugger stepped out." })
        },
      },
    ],
  },
  {
    label: "Terminal",
    icon: FileIcon,
    items: [
      {
        label: "New Terminal",
        shortcut: "Ctrl+`",
        icon: Terminal,
        action: () => useEditorStore.getState().toggleTerminal(),
      },
      {
        label: "Split Terminal",
        icon: Layout,
        action: () => {
          toast({ title: "Split Terminal", description: "Terminal split." })
        },
      },
      { divider: true },
      {
        label: "Clear Terminal",
        action: () => {
          toast({ title: "Clear Terminal", description: "Terminal cleared." })
        },
      },
      {
        label: "Kill Terminal",
        icon: Trash2,
        action: () => {
          toast({ title: "Kill Terminal", description: "Terminal process terminated." })
        },
      },
    ],
  },
  {
    label: "Help",
    icon: FileIcon,
    items: [
      {
        label: "Welcome",
        action: () => {
          toast({ title: "Welcome", description: "Welcome page opened." })
        },
      },
      {
        label: "Documentation",
        icon: BookOpen,
        action: () => {
          toast({ title: "Documentation", description: "Documentation opened." })
        },
      },
      { divider: true },
      {
        label: "Check for Updates",
        action: () => {
          toast({ title: "Check for Updates", description: "Checking for updates..." })
        },
      },
      { divider: true },
      {
        label: "About",
        icon: Info,
        action: () => {
          toast({ title: "About", description: "About page opened." })
        },
      },
    ],
  },
]

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
        closeBrackets: true,
        autocompletion: true,
      }}
      onChange={(val) => {
        onChange?.(val)
        if (useEditorStore.getState().autoSave) {
          useEditorStore.getState().updateTabContent(useEditorStore.getState().activeTab || "", val)
          toast({ title: "Auto Saved", description: "Changes have been auto-saved." })
        }
      }}
      style={{ fontSize: 14, fontFamily: `"Fira Code", "JetBrains Mono", monospace` }}
    />
  )
}

// VS Code Menu Component
export function VSCodeMenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenu && !menuRefs.current[activeMenu]?.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
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
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeMenu])

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
        <DropdownMenuCheckboxItem
          key={item.label}
          checked={item.checked}
          onCheckedChange={item.action}
          className="flex items-center justify-between"
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
                  activeMenu === category.label ? "bg-[#3c3c3c]" : "hover:bg-[#3c3c3c]"
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

// VS Code Architecture Component
export function VSCodeArchitecture() {
  const architectureRef = useRef<HTMLDivElement>(null)
  const workflowRef = useRef<HTMLDivElement>(null)
  const extensionsRef = useRef<HTMLDivElement>(null)

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
            `
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
            `
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
            `
          )
          extensionsRef.current.innerHTML = svg
        }
      } catch (error) {
        console.error("Error rendering diagrams:", error)
        toast({ title: "Error", description: "Failed to render architecture diagrams." })
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
      toast({ title: "Diagram Downloaded", description: "Architecture diagram saved as SVG." })
    } else {
      toast({ title: "Error", description: "No diagram available to download." })
    }
  }

  const handleRefresh = () => {
    window.location.reload()
    toast({ title: "Refreshed", description: "Architecture diagrams refreshed." })
  }

  return (
    <div className="p-4 bg-[#1e1e1e] rounded-lg border border-[#3c3c3c] h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">VS Code Architecture Diagrams</h2>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download SVG</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <Tabs defaultValue="architecture" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-[#252526]">
          <TabsTrigger
            value="architecture"
            className="data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white"
          >
            Component Architecture
          </TabsTrigger>
          <TabsTrigger
            value="workflow"
            className="data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white"
          >
            Workflow
          </TabsTrigger>
          <TabsTrigger
            value="extensions"
            className="data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white"
          >
            Extensions
          </TabsTrigger>
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

// Sample File Contents
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
      <p>© ${new Date().getFullYear()} CodeFusion. All rights reserved.</p>
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
      toast({ title: "Command Error", description: `Command not found: ${cmd}` })
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
        <Input
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

// File Explorer Component
function FileExplorer({ onFileSelect }: { onFileSelect: (path: string) => void }) {
  const [fileTree, setFileTree] = useState(sampleFileTree)
  const [contextMenu, setContextMenu] = useState<{ path: string; x: number; y: number } | null>(null)

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
      toast({ title: "File Renamed", description: `Renamed to ${newName}` })
    }
    setContextMenu(null)
  }

  const handleDelete = (path: string) => {
    const updateTree = (items: FileTreeItem[]): FileTreeItem[] => {
      return items.filter((item) => item.path !== path).map((item) => ({
        ...item,
        children: item.children ? updateTree(item.children) : undefined,
      }))
    }
    setFileTree(updateTree(fileTree))
    toast({ title: "File Deleted", description: `File at ${path} deleted.` })
    setContextMenu(null)
  }

  const handleDownload = (path: string) => {
    const file = sampleFileContents[path]
    if (file) {
      const blob = new Blob([file.content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = path.split("/").pop() || "download"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({ title: "File Downloaded", description: `Downloaded ${path}` })
    }
    setContextMenu(null)
  }

  const handleNewFile = () => {
    const newFile: FileTreeItem = {
      id: `file-${Date.now()}`,
      name: `untitled-${Date.now()}.js`,
      type: "file",
      path: `src/untitled-${Date.now()}.js`,
      language: "javascript",
    }
    setFileTree([...fileTree, newFile])
    sampleFileContents[newFile.path] = { content: "// New file\n", language: "javascript" }
    toast({ title: "New File", description: `Created ${newFile.name}` })
  }

  const handleNewFolder = () => {
    const newFolder: FileTreeItem = {
      id: `folder-${Date.now()}`,
      name: `NewFolder-${Date.now()}`,
      type: "folder",
      path: `src/NewFolder-${Date.now()}`,
      isOpen: false,
      children: [],
    }
    setFileTree([...fileTree, newFolder])
    toast({ title: "New Folder", description: `Created ${newFolder.name}` })
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
              if (!sampleFileContents[item.path]) {
                toast({ title: "Error", description: "File not found." })
                return
              }
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
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNewFolder}>
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New Folder</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNewFile}>
                  <FileText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New File</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFileTree(sampleFileTree)}>
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
            className="bg-[#252526] border-[#3c3c3c] text-gray-300"
            style={{ position: "fixed", left: contextMenu.x, top: contextMenu.y }}
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
function ProblemsPanel({ onSelectProblem }: { onSelectProblem: (file: string, line: number) => void }) {
  const problems = [
    {
      id: 1,
      type: "error",
      message: "Cannot find module 'react-router-dom'",
      file: "src/components/App.tsx",
      line: 2,
    },
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
          onClick={() => onSelectProblem(problem.file, problem.line)}
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

// VS Code Editor Component
export function VSCodeEditor({ onCodeChange }: { onCodeChange?: (code: string) => void }) {
  const {
    tabs,
    activeTab,
    showExplorer,
    showTerminal,
    showProblems,
    activePanel,
    terminalHeight,
    setActiveTab,
    toggleExplorer,
    toggleTerminal,
    toggleProblems,
    setActivePanel,
    setTerminalHeight,
  } = useEditorStore()
  const [activeIcon, setActiveIcon] = useState("explorer")
  const [isResizing, setIsResizing] = useState(false)
  const [startY, setStartY] = useState(0)
  const editorRef = useRef<{ insertCode: (code: string, language?: string) => void } | null>(null)

  const handleFileSelect = (path: string) => {
    const existingTab = tabs.find((tab) => tab.path === path)
    if (existingTab) {
      setActiveTab(existingTab.id)
      return
    }

    const fileData = sampleFileContents[path]
    if (!fileData) {
      toast({ title: "Error", description: "File not found." })
      return
    }

    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      name: path.split("/").pop() || "",
      content: fileData.content,
      language: fileData.language,
      path: path,
    }

    useEditorStore.getState().addTab(newTab)
    setActiveTab(newTab.id)
  }

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    useEditorStore.getState().closeTab(id)
    toast({ title: "Tab Closed", description: "The selected tab has been closed." })
  }

  const handleContentChange = (value: string, tabId: string) => {
    useEditorStore.getState().updateTabContent(tabId, value)
    onCodeChange?.(value)
  }

  const insertCodeIntoEditor = (code: string, language = "javascript") => {
    if (activeTab) {
      const currentTab = tabs.find((tab) => tab.id === activeTab)
      if (currentTab) {
        const newContent = currentTab.content + "\n\n" + code
        handleContentChange(newContent, activeTab)
        toast({ title: "Code Inserted", description: "AI-generated code inserted into editor." })
      }
    } else {
      const newTab: EditorTab = {
        id: `tab-${Date.now()}`,
        name: `ai-generated.${language === "python" ? "py" : "js"}`,
        content: code,
        language: language,
      }
      useEditorStore.getState().addTab(newTab)
      setActiveTab(newTab.id)
      toast({ title: "New AI File", description: "Created new file with AI-generated code." })
    }
  }

  React.useImperativeHandle(editorRef, () => ({
    insertCode: insertCodeIntoEditor,
  }))

  const toggleSidebar = (icon: string) => {
    if (icon === "explorer") {
      toggleExplorer()
    } else if (icon === "search") {
      toast({ title: "Search", description: "Search panel opened." })
    } else if (icon === "git") {
      toast({ title: "Source Control", description: "Source control panel opened." })
    } else if (icon === "debug") {
      toast({ title: "Debug", description: "Debug panel opened." })
    } else if (icon === "extensions") {
      toast({ title: "Extensions", description: "Extensions panel opened." })
    }
    setActiveIcon(icon)
  }

  const handleSelectProblem = (file: string, line: number) => {
    handleFileSelect(file)
    toast({ title: "Navigated to Problem", description: `Jumped to ${file}:${line}` })
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

  const handleSplitEditor = () => {
    toast({ title: "Split Editor", description: "Editor split into two panes." })
  }

  const handleMaximize = () => {
    toast({ title: "Maximize", description: "Editor maximized." })
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border rounded-md overflow-hidden">
      <VSCodeMenu />
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <div className="w-12 h-full flex flex-col items-center bg-[#333333] py-4 gap-6 md:w-12 sm:w-10 xs:w-8">
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-md"
                  onClick={() => toast({ title: "Settings", description: "Settings panel opened." })}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Sidebar */}
        {showExplorer && (
          <div className="w-64 h-full border-r border-[#252526] md:w-64 sm:w-48 xs:w-40">
            <FileExplorer onFileSelect={handleFileSelect} />
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
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none" onClick={handleSplitEditor}>
                <Split className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none" onClick={handleMaximize}>
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
                <Button
                  variant="outline"
                  className="mt-6 bg-transparent"
                  onClick={() => {
                    const newTab: EditorTab = {
                      id: `tab-${Date.now()}`,
                      name: "untitled.js",
                      content: "// Start coding here\n\n",
                      language: "javascript",
                    }
                    useEditorStore.getState().addTab(newTab)
                    setActiveTab
