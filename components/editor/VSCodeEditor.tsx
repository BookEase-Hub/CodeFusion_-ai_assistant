"use client"

import * as React from "react"
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import {
  Copy, Sparkles, FileCode2, FileIcon, Plus, PlusSquare, Folder, FolderPlus, Settings, Save, X,
  RefreshCw, ToggleRight, RotateCcw, RotateCw, Scissors, Clipboard, Search, Replace, Command,
  Layout, ArrowLeft, ArrowRight, Play, Bug, Square, StepForward, ArrowUp, ArrowDown, Terminal,
  Trash2, Info, BookOpen, FolderMinus, MoreHorizontal, Clock, FileText, Split, Maximize2,
  ChevronDown, ChevronRight, AlertCircle, AlertTriangle, Package, ZoomIn, ZoomOut, Download,
  GitBranch, Upload, GitCommit, GitMerge, GitPullRequest, FilePlus, FolderOpen, History,
  Lock, Unlock, Star, Eye, EyeOff, Palette, DownloadCloud, UploadCloud, Link, Unlink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { CodeEditor } from "@/components/code-editor"
import { useToast } from "@/components/ui/use-toast"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useAIStore } from "@/store/ai"
import { EditorTab } from "@/types/ai"
import { FileNode as FileTreeItem } from "@/types/ai"
import { FileSystemDB } from "@/services/file-system-db"
import { TaskHistoryPanel } from "@/components/ai/TaskHistoryPanel"

// Initialize Mermaid for diagrams
import mermaid from "mermaid"
mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
});

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

// File Explorer Item Component
const FileExplorerItem = ({
  item,
  level,
  onFileSelect,
  onRename,
  onDelete,
  onDrop,
  onToggleLock,
  onToggleStar,
  onShowHistory,
}: {
  item: FileTreeItem
  level: number
  onFileSelect: (path: string) => void
  onRename: (path: string, newName: string) => void
  onDelete: (path: string) => void
  onDrop: (sourcePath: string, targetPath: string) => void
  onToggleLock: (path: string, isLocked: boolean) => void
  onToggleStar: (path: string, isStarred: boolean) => void
  onShowHistory: (path: string) => void
}) => {
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(item.name)
  const { toast } = useToast()

  const [{ isDragging }, drag] = useDrag({
    type: item.type,
    item: { path: item.path },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [{ isOver }, drop] = useDrop({
    accept: ["file", "folder"],
    drop: (droppedItem: { path: string }) => {
      if (droppedItem.path !== item.path && item.type === "folder") {
        onDrop(droppedItem.path, item.path)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  const handleRename = () => {
    if (newName && newName !== item.name) {
      onRename(item.path, newName)
      toast({ title: "Renamed", description: `Renamed to ${newName}` })
    }
    setIsRenaming(false)
  }

  return (
    <div ref={drop} style={{ paddingLeft: `${level * 16}px` }} className={cn(isOver && "bg-[#2a2d2e]")}>
      <div
        ref={drag}
        className={cn(
          "flex items-center py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer rounded-sm",
          isDragging && "opacity-50",
          level === 0 && "mt-1"
        )}
        onClick={() => item.type === "folder" ? onFileSelect(item.path) : onFileSelect(item.path)}
      >
        {isRenaming ? (
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
            className="h-6 text-sm"
          />
        ) : (
          <>
            {item.type === "folder" ? (
              <>
                {item.isOpen ? <ChevronDown className="h-4 w-4 mr-1 text-gray-400" /> : <ChevronRight className="h-4 w-4 mr-1 text-gray-400" />}
                <Folder className="h-4 w-4 mr-1 text-blue-400" />
              </>
            ) : (
              <FileText className="h-4 w-4 mr-1 text-gray-400" />
            )}
            {/* @ts-ignore */}
            <span className={cn(item.isLocked && "text-gray-500")}>{item.name}</span>
            {/* @ts-ignore */}
            {item.isStarred && <Star className="h-3 w-3 ml-2 text-yellow-400" />}
            {/* @ts-ignore */}
            {item.isLocked && <Lock className="h-3 w-3 ml-2 text-red-400" />}
            <div className="ml-auto flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); setIsRenaming(true) }}>
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rename</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      // @ts-ignore
                      onClick={(e) => { e.stopPropagation(); onToggleStar(item.path, !item.isStarred) }}
                    >
                       {/* @ts-ignore */}
                      <Star className={cn("h-3 w-3", item.isStarred ? "text-yellow-400" : "text-gray-400")} />
                    </Button>
                  </TooltipTrigger>
                   {/* @ts-ignore */}
                  <TooltipContent>{item.isStarred ? "Unstar" : "Star"}</TooltipContent>
                </Tooltip>
                {item.type === "file" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        // @ts-ignore
                        onClick={(e) => { e.stopPropagation(); onToggleLock(item.path, !item.isLocked) }}
                      >
                         {/* @ts-ignore */}
                        {item.isLocked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      </Button>
                    </TooltipTrigger>
                     {/* @ts-ignore */}
                    <TooltipContent>{item.isLocked ? "Unlock" : "Lock"}</TooltipContent>
                  </Tooltip>
                )}
                {item.type === "file" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={(e) => { e.stopPropagation(); onShowHistory(item.path) }}
                      >
                        <History className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Show History</TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); onDelete(item.path) }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </>
        )}
      </div>
      {item.type === "folder" && item.isOpen && item.children && (
        <div>
          {item.children.map((child) => (
            <FileExplorerItem
              key={child.id}
              item={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              onRename={onRename}
              onDelete={onDelete}
              onDrop={onDrop}
              onToggleLock={onToggleLock}
              onToggleStar={onToggleStar}
              onShowHistory={onShowHistory}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Enhanced File Explorer Component
function EnhancedFileExplorer({
  onFileSelect,
  onNewFile,
  onNewFolder,
  onRefresh,
  onRename,
  onDelete,
  onDrop,
  onToggleLock,
  onToggleStar,
  onShowHistory,
}: {
  onFileSelect: (path: string) => void
  onNewFile: (path: string, content: string) => void
  onNewFolder: (path: string) => void
  onRefresh: () => void
  onRename: (path: string, newName: string) => void
  onDelete: (path: string) => void
  onDrop: (sourcePath: string, targetPath: string) => void
  onToggleLock: (path: string, isLocked: boolean) => void
  onToggleStar: (path: string, isStarred: boolean) => void
  onShowHistory: (path: string) => void
}) {
  const [fileTree, setFileTree] = useState<FileTreeItem[]>([])
  const [newItemDialog, setNewItemDialog] = useState<{ open: boolean; type: "file" | "folder"; parentPath: string }>({
    open: false,
    type: "file",
    parentPath: "",
  })
  const [newItemName, setNewItemName] = useState("")
  const [subItems, setSubItems] = useState<{ name: string; type: 'file' | 'folder' }[]>([])
  const { toast } = useToast()
  const fsDB = useRef(new FileSystemDB())

  useEffect(() => {
    const loadFolders = async () => {
      const folders = await fsDB.current.getAllFolders()
      setFileTree(folders)
    }
    loadFolders()
  }, [])

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

  const createItem = async () => {
    if (!newItemName) return;

    const db = fsDB.current;

    const createNode = (name: string, parentPath: string, type: 'file' | 'folder', children: FileTreeItem[] = []): FileTreeItem => {
      const path = parentPath ? `${parentPath}/${name}` : name;
      const node: FileTreeItem = {
        id: path,
        name,
        type,
        path,
        content: type === 'file' ? '' : undefined,
        language: type === 'file' ? name.split('.').pop() || 'text' : undefined,
        isOpen: type === 'folder' ? true : undefined,
        children: type === 'folder' ? children : undefined,
      };
      return node;
    };

    const rootPath = newItemDialog.parentPath ? `${newItemDialog.parentPath}/${newItemName}` : newItemName;

    if (newItemDialog.type === 'folder') {
        const children = subItems
            .filter(item => item.name.trim() !== '')
            .map(sub => createNode(sub.name, rootPath, sub.type));

        const rootNode = createNode(newItemName, newItemDialog.parentPath, 'folder', children);

        const saveRecursively = async (node: FileTreeItem) => {
            if (node.type === 'folder') {
                await db.saveFolder(node);
                if (node.children) {
                    for (const child of node.children) {
                        await saveRecursively(child);
                    }
                }
            } else {
                await db.saveFile(node);
                onNewFile(node.path, node.content || '');
            }
        };

        const updateTree = (items: FileTreeItem[], parentPath: string): FileTreeItem[] => {
          if (parentPath === '') {
            return [...items, rootNode];
          }
          return items.map((item) => {
            if (item.path === parentPath && item.type === "folder") {
              return {
                ...item,
                isOpen: true,
                children: [...(item.children || []), rootNode],
              };
            } else if (item.children) {
              return { ...item, children: updateTree(item.children, parentPath) };
            }
            return item;
          });
        };

        setFileTree(updateTree(fileTree, newItemDialog.parentPath));
        await saveRecursively(rootNode);
        toast({ title: `Folder Created`, description: `Created folder: ${rootPath}` });

    } else { // type is 'file'
        const newItem = createNode(newItemName, newItemDialog.parentPath, 'file');
        const updateTree = (items: FileTreeItem[], parentPath: string): FileTreeItem[] => {
          if (parentPath === '') {
            return [...items, newItem];
          }
          return items.map((item) => {
            if (item.path === parentPath && item.type === "folder") {
              return {
                ...item,
                isOpen: true,
                children: [...(item.children || []), newItem],
              };
            } else if (item.children) {
              return { ...item, children: updateTree(item.children, parentPath) };
            }
            return item;
          });
        };
        setFileTree(updateTree(fileTree, newItemDialog.parentPath));
        await db.saveFile(newItem);
        onNewFile(newItem.path, '');
        toast({ title: `File Created`, description: `Created file: ${newItem.path}` });
    }

    setNewItemDialog({ open: false, type: "file", parentPath: "" });
    setNewItemName("");
    setSubItems([]);
  };

  const handleRename = async (path: string, newName: string) => {
    const updateTree = (items: FileTreeItem[]): FileTreeItem[] => {
      return items.map((item) => {
        if (item.path === path) {
          const newPath = item.path.split("/").slice(0, -1).concat(newName).join("/")
          return { ...item, name: newName, path: newPath }
        } else if (item.children) {
          return { ...item, children: updateTree(item.children) }
        }
        return item
      })
    }
    setFileTree(updateTree(fileTree))
    const file = await fsDB.current.getFile(path)
    if (file) {
      await fsDB.current.saveFile({ ...file, name: newName, path: path.split("/").slice(0, -1).concat(newName).join("/") })
      await fsDB.current.deleteFile(path)
    } else {
      const folder = await fsDB.current.getFolder(path)
      if (folder) {
        await fsDB.current.saveFolder({ ...folder, name: newName, path: path.split("/").slice(0, -1).concat(newName).join("/") })
        await fsDB.current.deleteFolder(folder.id)
      }
    }
  }

  const handleDelete = async (path: string) => {
    const updateTree = (items: FileTreeItem[]): FileTreeItem[] => {
      return items.filter((item) => {
        if (item.path === path) {
          return false
        } else if (item.children) {
          item.children = updateTree(item.children)
          return true
        }
        return true
      })
    }
    setFileTree(updateTree(fileTree))
    const file = await fsDB.current.getFile(path)
    if (file) {
        await fsDB.current.deleteFile(path)
    } else {
        const folder = await fsDB.current.getFolder(path)
        if (folder) {
            await fsDB.current.deleteFolder(folder.id)
        }
    }
    toast({ title: "Deleted", description: `Deleted ${path}` })
  }

  const handleDrop = async (sourcePath: string, targetPath: string) => {
    const findItem = (items: FileTreeItem[], path: string): FileTreeItem | undefined => {
      for (const item of items) {
        if (item.path === path) return item
        if (item.children) {
          const found = findItem(item.children, path)
          if (found) return found
        }
      }
    }

    const sourceItem = findItem(fileTree, sourcePath)
    if (!sourceItem) return

    const updateTree = (items: FileTreeItem[]): FileTreeItem[] => {
      return items.filter((item) => item.path !== sourcePath).map((item) => {
        if (item.path === targetPath && item.type === "folder") {
          return {
            ...item,
            isOpen: true,
            children: [...(item.children || []), { ...sourceItem, path: `${targetPath}/${sourceItem.name}` }],
          }
        } else if (item.children) {
          return { ...item, children: updateTree(item.children) }
        }
        return item
      })
    }

    setFileTree(updateTree(fileTree))
    toast({ title: "Moved", description: `Moved ${sourcePath} to ${targetPath}` })
    if (sourceItem.type === "file") {
      const file = await fsDB.current.getFile(sourcePath)
      if (file) {
        await fsDB.current.saveFile({ ...file, path: `${targetPath}/${sourceItem.name}` })
        await fsDB.current.deleteFile(sourcePath)
      }
    } else {
      const folder = await fsDB.current.getFolder(sourcePath)
      if (folder) {
        await fsDB.current.saveFolder({ ...folder, path: `${targetPath}/${sourceItem.name}` })
        await fsDB.current.deleteFolder(folder.id)
      }
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full bg-[#252526] text-gray-300 text-sm overflow-y-auto">
        <div className="p-2 font-semibold border-b border-[#3c3c3c] flex items-center justify-between">
          <span>EXPLORER</span>
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setNewItemDialog({ open: true, type: "file", parentPath: "" })}>
                    <FileText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New File</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setNewItemDialog({ open: true, type: "folder", parentPath: "" })}>
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New Folder</TooltipContent>
              </Tooltip>
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
            {fileTree.map((item) => (
              <FileExplorerItem
                key={item.id}
                item={item}
                level={0}
                onFileSelect={(path) => (item.type === "folder" ? toggleFolder(path) : onFileSelect(path))}
                onRename={handleRename}
                onDelete={handleDelete}
                onDrop={handleDrop}
                onToggleLock={onToggleLock}
                onToggleStar={onToggleStar}
                onShowHistory={onShowHistory}
              />
            ))}
          </div>
        </ScrollArea>
        <Dialog open={newItemDialog.open} onOpenChange={(open) => {
            setNewItemDialog({ ...newItemDialog, open });
            if (!open) {
                setNewItemName('');
                setSubItems([]); // Reset sub-items on close
            }
        }}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Create New {newItemDialog.type.charAt(0).toUpperCase() + newItemDialog.type.slice(1)}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input id="name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="col-span-3" />
                    </div>
                    {newItemDialog.type === 'folder' && (
                        <>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Contents</Label>
                                <div className="col-span-3 flex flex-col gap-2">
                                    {subItems.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                placeholder="Item name"
                                                value={item.name}
                                                onChange={(e) => {
                                                    const newSubItems = [...subItems];
                                                    newSubItems[index].name = e.target.value;
                                                    setSubItems(newSubItems);
                                                }}
                                            />
                                            <select
                                                value={item.type}
                                                onChange={(e) => {
                                                    const newSubItems = [...subItems];
                                                    newSubItems[index].type = e.target.value as 'file' | 'folder';
                                                    setSubItems(newSubItems);
                                                }}
                                                className="bg-background border border-input rounded-md px-2 py-1 text-sm"
                                            >
                                                <option value="file">File</option>
                                                <option value="folder">Folder</option>
                                            </select>
                                            <Button variant="ghost" size="icon" onClick={() => {
                                                setSubItems(subItems.filter((_, i) => i !== index));
                                            }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                     <Button variant="outline" size="sm" onClick={() => setSubItems([...subItems, { name: '', type: 'file' }])}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Item
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setNewItemDialog({ ...newItemDialog, open: false })}>Cancel</Button>
                    <Button onClick={createItem} disabled={!newItemName}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  )
}

// History Panel Component
function HistoryPanel({
  filePath,
  history,
  onRestore,
  onClose,
}: {
  filePath: string
  history: { content: string; timestamp: string }[]
  onRestore: (content: string, version: number) => void
  onClose: () => void
}) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>File History: {filePath}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          {history.length === 0 ? (
            <div className="text-gray-500 p-4">No version history available.</div>
          ) : (
            history.map((entry, index) => (
              <div key={index} className="p-2 border-b border-[#3c3c3c]">
                <div className="flex items-center justify-between">
                  <span>Version {history.length - index} ({new Date(entry.timestamp).toLocaleString()})</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRestore(entry.content, history.length - index)}
                  >
                    Restore
                  </Button>
                </div>
                <CodeEditor value={entry.content} language="javascript" height="200px" readOnly />
              </div>
            ))
          )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// VS Code Menu Component
function VSCodeMenu({
  onNewFile,
  onNewFolder,
  onOpenFile,
  onOpenFolder,
  onSave,
  onSaveAs,
  onSaveFolderAs,
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
  onDuplicateItem,
  onToggleTheme,
  onExportProject,
  onImportProject,
}: {
  onNewFile: () => void
  onNewFolder: () => void
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
  onDuplicateItem: () => void
  onToggleTheme: () => void
  onExportProject: () => void
  onImportProject: () => void
}) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const menuData: MenuCategory[] = [
    {
      label: "File",
      icon: FileIcon,
      items: [
        { label: "New File", shortcut: "Ctrl+N", icon: Plus, action: onNewFile },
        { label: "New Folder", shortcut: "Ctrl+Shift+N", icon: FolderPlus, action: onNewFolder },
        { label: "New Window", shortcut: "Ctrl+Shift+W", icon: PlusSquare, action: onNewWindow },
        { divider: true },
        { label: "Open File...", shortcut: "Ctrl+O", icon: FileIcon, action: onOpenFile },
        { label: "Open Folder...", shortcut: "Ctrl+K Ctrl+O", icon: Folder, action: onOpenFolder },
        { label: "Open Workspace...", icon: Layout, action: onOpenWorkspace },
        { label: "Open Recent", icon: Clock, action: onOpenRecent },
        { divider: true },
        { label: "Add Folder to Workspace...", icon: FolderPlus, action: onAddFolderToWorkspace },
        { divider: true },
        { label: "Save", shortcut: "Ctrl+S", icon: Save, action: onSave },
        { label: "Save As...", shortcut: "Ctrl+Shift+S", icon: Save, action: onSaveAs },
        { label: "Save Folder As...", icon: Folder, action: onSaveFolderAs },
        { label: "Save All", shortcut: "Ctrl+K S", icon: Save, action: onSaveAll },
        { label: "Auto Save", checked: autoSave, icon: ToggleRight, action: onToggleAutoSave },
        { divider: true },
        { label: "Duplicate Item", icon: Copy, action: onDuplicateItem },
        { divider: true },
        { label: "Export Project", icon: DownloadCloud, action: onExportProject },
        { label: "Import Project", icon: UploadCloud, action: onImportProject },
        { divider: true },
        { label: "Revert File", icon: RefreshCw, action: onRevertFile },
        { divider: true },
        { label: "Close Editor", shortcut: "Ctrl+F4", icon: X, action: onCloseEditor },
        { label: "Close Folder", shortcut: "Ctrl+K F", icon: FolderMinus, action: onCloseFolder },
        { label: "Close Window", shortcut: "Alt+F4", icon: X, action: onCloseWindow },
        { divider: true },
        { label: "Exit", action: onExit },
      ],
    },
    // Other menus...
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
    editorTabs, activeEditorTab, showExplorer, showTerminal, showProblems, activePanel, terminalHeight,
    updateAIAssistant, addEditorTab, updateEditorTab, removeEditorTab,
  } = useAIStore()
  const [activeIcon, setActiveIcon] = useState("explorer")
  const [isResizing, setIsResizing] = useState(false)
  const [startY, setStartY] = useState(0)
  const [autoSave, setAutoSave] = useState(true)
  const [recentFiles, setRecentFiles] = useState<string[]>([])
  const [openFolderDialog, setOpenFolderDialog] = useState(false)
  const [saveAsFolderDialog, setSaveAsFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [currentFolder, setCurrentFolder] = useState<FileTreeItem | null>(null)
  const [showHistoryDialog, setShowHistoryDialog] = useState<{ open: boolean; path: string; history: { content: string; timestamp: string }[] }>({
    open: false,
    path: "",
    history: [],
  })
  const fsDB = useRef(new FileSystemDB())
  const { toast } = useToast()

  function useFileManager() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const folderInputRef = useRef<HTMLInputElement>(null)

    const openFile = () => {
      fileInputRef.current?.click()
    }

    const openFolder = () => {
      folderInputRef.current?.click()
    }

    return {
      openFile,
      openFolder,
      fileInputRef,
      folderInputRef,
    }
  }
  const fileManager = useFileManager()

  const handleSaveFolderAs = () => {
    if (!currentFolder) {
      toast({
        title: "No Folder Open",
        description: "Please open a folder first to use 'Save Folder As'.",
        variant: "destructive",
      });
      return;
    }
    setNewFolderName(currentFolder.name);
    setSaveAsFolderDialog(true);
  };

  const executeSaveFolderAs = async () => {
    if (!currentFolder || !newFolderName) return;

    const db = fsDB.current;

    const deepCopyAndRename = (node: FileTreeItem, newName: string, newPath: string): FileTreeItem => {
        const newNode = { ...node, id: newPath, name: newName, path: newPath };
        if (node.children) {
            newNode.children = node.children.map(child => {
                const childNewPath = `${newPath}/${child.name}`;
                return deepCopyAndRename(child, child.name, childNewPath);
            });
        }
        return newNode;
    };

    const newFolder = deepCopyAndRename(currentFolder, newFolderName, newFolderName);

    const saveRecursively = async (node: FileTreeItem) => {
        if (node.type === 'folder') {
            await db.saveFolder(node);
            if (node.children) {
                for (const child of node.children) {
                    await saveRecursively(child);
                }
            }
        } else {
            await db.saveFile(node);
        }
    };

    await saveRecursively(newFolder);

    toast({
      title: "Folder Saved As",
      description: `Folder saved as '${newFolderName}'.`,
    });

    setSaveAsFolderDialog(false);
    setNewFolderName("");
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editorTabs.some((tab) => tab.isDirty)) {
        e.preventDefault()
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?"
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [editorTabs])

  useEffect(() => {
    const loadRecentFiles = async () => {
      const savedRecentFiles = await fsDB.current.getSettings("recentFiles")
      if (savedRecentFiles) {
        setRecentFiles(savedRecentFiles)
      }
    }
    loadRecentFiles()
  }, [])

  useEffect(() => {
    if (autoSave && activeEditorTab) {
      const interval = setInterval(async () => {
        const currentTab = editorTabs.find((tab) => tab.id === activeEditorTab)
        // @ts-ignore
        if (currentTab && currentTab.isDirty && !currentTab.isLocked) {
          // @ts-ignore
          await fileManager.saveFile(currentTab.content, currentTab.path, currentTab.language, currentTab.version || 1, currentTab.isLocked || false)
          updateEditorTab(activeEditorTab, { isDirty: false, version: (currentTab.version || 1) + 1 })
          toast({ title: "Auto Saved", description: `${currentTab.name} has been auto-saved.` })
        }
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [autoSave, activeEditorTab, editorTabs, updateEditorTab, toast])

  const openFileByPath = async (path: string) => {
    const existingTab = editorTabs.find((tab) => tab.path === path)
    if (existingTab) {
      updateAIAssistant({ activeEditorTab: existingTab.id })
      return
    }

    const file = await fsDB.current.getFile(path)
    if (!file) return

    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      name: path.split("/").pop() || "",
      // @ts-ignore
      content: file.content,
      // @ts-ignore
      language: file.language,
      path,
      // @ts-ignore
      version: file.version,
      // @ts-ignore
      isLocked: file.isLocked,
    }
    addEditorTab(newTab)
    setRecentFiles((prev) => {
      const updated = [path, ...prev.filter((p) => p !== path)].slice(0, 10)
      fsDB.current.saveSettings("recentFiles", updated)
      return updated
    })
  }

  const closeTab = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const tab = editorTabs.find((t) => t.id === id)
    // @ts-ignore
    if (tab?.isDirty && !tab.isLocked) {
      if (!confirm(`Save changes to ${tab.name} before closing?`)) {
        removeEditorTab(id)
        return
      }
      // @ts-ignore
      await fileManager.saveFile(tab.content, tab.path, tab.language, tab.version || 1, tab.isLocked || false)
    }
    removeEditorTab(id)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return;

    if (file.name.endsWith('.codefusion')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target?.result as string;
            try {
                const importedFolders = JSON.parse(content);
                if (Array.isArray(importedFolders)) {
                    if (confirm("This will replace your current workspace. Are you sure?")) {
                        const db = fsDB.current;
                        await db.clearAll();

                        const saveRecursively = async (node: FileTreeItem) => {
                            if (node.type === 'folder') {
                                await db.saveFolder(node);
                                if (node.children) {
                                    for (const child of node.children) {
                                        await saveRecursively(child);
                                    }
                                }
                            } else {
                                await db.saveFile(node);
                            }
                        };

                        for (const folder of importedFolders) {
                            await saveRecursively(folder);
                        }

                        toast({ title: "Workspace Imported", description: "The workspace has been successfully imported." });
                        window.location.reload();
                    }
                } else {
                    throw new Error("Invalid workspace file format.");
                }
            } catch (error) {
                toast({ title: "Import Failed", description: (error as Error).message, variant: "destructive" });
            }
        };
        reader.readAsText(file);
    } else {
        const reader = new FileReader()
        reader.onload = (e) => {
            const content = e.target?.result as string
            const language = file.name.split(".").pop() || "text"
            const newTab: EditorTab = {
              id: `tab-${Date.now()}`,
              name: file.name,
              content,
              language,
              path: file.name,
              // @ts-ignore
              version: 1,
              // @ts-ignore
              isLocked: false,
            }
            addEditorTab(newTab)
            updateAIAssistant({ activeEditorTab: newTab.id })
        }
        reader.readAsText(file)
    }
  }

  const handleContentChange = async (value: string, tabId: string) => {
    const tab = editorTabs.find((t) => t.id === tabId)
    // @ts-ignore
    if (tab?.isLocked) {
      toast({ title: "File Locked", description: `${tab.name} is locked and cannot be edited.` })
      return
    }
    updateEditorTab(tabId, { content: value, isDirty: true })
    onCodeChange?.(value)
  }

  const createNewFile = (path: string, content: string) => {
    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      name: path.split("/").pop() || "",
      content,
      language: path.split(".").pop() || "text",
      path,
      // @ts-ignore
      version: 1,
      // @ts-ignore
      isLocked: false,
    }
    addEditorTab(newTab)
  }

  const createNewFolder = async () => {
    if (!newFolderName) return
    const folder: FileTreeItem = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      type: "folder",
      path: newFolderName,
      children: [],
      isOpen: true,
    }
    await fsDB.current.saveFolder(folder)
    setCurrentFolder(folder)
    setNewFolderName("")
    setSaveAsFolderDialog(false)
    toast({ title: "Folder Created", description: `Created folder: ${newFolderName}` })
  }

  const openFolder = async (folder: FileTreeItem) => {
    setCurrentFolder(folder)
    setOpenFolderDialog(false)
    const openFiles = async (items: FileTreeItem[]) => {
      for (const item of items) {
        if (item.type === "file") {
          const file = await fsDB.current.getFile(item.path)
          if (file) {
            const newTab: EditorTab = {
              id: `tab-${Date.now()}`,
              name: item.name,
              // @ts-ignore
              content: file.content,
              // @ts-ignore
              language: file.language,
              path: item.path,
              // @ts-ignore
              version: file.version,
              // @ts-ignore
              isLocked: file.isLocked,
            }
            addEditorTab(newTab)
          }
        } else if (item.children) {
          await openFiles(item.children)
        }
      }
    }
    if (folder.children) {
      await openFiles(folder.children)
    }
    toast({ title: "Folder Opened", description: `Opened folder: ${folder.name}` })
  }

  const closeFolder = async () => {
    if (editorTabs.some((tab) => tab.isDirty && !tab.isLocked)) {
      if (!confirm("Save changes before closing folder?")) {
        editorTabs.forEach((tab) => removeEditorTab(tab.id))
        setCurrentFolder(null)
        return
      }
      for (const tab of editorTabs) {
        // @ts-ignore
        if (tab.isDirty && !tab.isLocked) {
          // @ts-ignore
          await fileManager.saveFile(tab.content, tab.path, tab.language, tab.version || 1, tab.isLocked || false)
        }
      }
    }
    editorTabs.forEach((tab) => removeEditorTab(tab.id))
    setCurrentFolder(null)
    toast({ title: "Folder Closed", description: "Current folder has been closed." })
  }

  const handleRename = async (path: string, newName: string) => {
    const newPath = path.split("/").slice(0, -1).concat(newName).join("/")
    const file = await fsDB.current.getFile(path)
    if (file) {
      // @ts-ignore
      await fileManager.saveFile(file.content, newPath, file.language, file.version, file.isLocked)
      await fsDB.current.deleteFile(path)
      const tab = editorTabs.find((t) => t.path === path)
      if (tab) {
        updateEditorTab(tab.id, { name: newName, path: newPath })
      }
    } else {
      const folder = await fsDB.current.getFolder(path)
      if (folder) {
        await fsDB.current.saveFolder({ ...folder, name: newName, path: newPath })
        await fsDB.current.deleteFolder(folder.id)
      }
    }
  }

  const handleDelete = async (path: string) => {
    const tab = editorTabs.find((t) => t.path === path)
    if (tab) {
      removeEditorTab(tab.id)
    }
    const file = await fsDB.current.getFile(path)
    if (file) {
        await fsDB.current.deleteFile(path)
    } else {
        const folder = await fsDB.current.getFolder(path)
        if (folder) {
            await fsDB.current.deleteFolder(folder.id)
        }
    }
  }

  const handleDrop = async (sourcePath: string, targetPath: string) => {
    const file = await fsDB.current.getFile(sourcePath)
    if (file) {
      // @ts-ignore
      await fileManager.saveFile(file.content, `${targetPath}/${sourcePath.split("/").pop()}`, file.language, file.version, file.isLocked)
      await fsDB.current.deleteFile(sourcePath)
      const tab = editorTabs.find((t) => t.path === sourcePath)
      if (tab) {
        updateEditorTab(tab.id, { path: `${targetPath}/${sourcePath.split("/").pop()}` })
      }
    } else {
      const folder = await fsDB.current.getFolder(sourcePath)
      if (folder) {
        await fsDB.current.saveFolder({ ...folder, path: `${targetPath}/${sourcePath.split("/").pop()}` })
        await fsDB.current.deleteFolder(folder.id)
      }
    }
  }

  const handleToggleLock = async (path: string, isLocked: boolean) => {
    const file = await fsDB.current.getFile(path)
    if (file) {
      // @ts-ignore
      await fsDB.current.saveFile(file.content, path, file.language, file.version, file.history, isLocked)
      const tab = editorTabs.find((t) => t.path === path)
      if (tab) {
        updateEditorTab(tab.id, { isLocked })
      }
      toast({ title: isLocked ? "File Locked" : "File Unlocked", description: `${path} is now ${isLocked ? "locked" : "unlocked"}.` })
    }
  }

  const handleToggleStar = async (path: string, isStarred: boolean) => {
    const file = await fsDB.current.getFile(path)
    if (file) {
        // @ts-ignore
      await fsDB.current.saveFile(file.content, path, file.language, file.version, file.history, file.isLocked)
    } else {
      const folder = await fsDB.current.getFolder(path)
      if (folder) {
        // @ts-ignore
        await fsDB.current.saveFolder({ ...folder, isStarred })
      }
    }
    toast({ title: isStarred ? "Starred" : "Unstarred", description: `${path} has been ${isStarred ? "starred" : "unstarred"}.` })
  }

  const handleShowHistory = async (path: string) => {
    const file = await fsDB.current.getFile(path)
    if (file) {
        // @ts-ignore
      setShowHistoryDialog({ open: true, path, history: file.history })
    }
  }

  const handleRestoreHistory = async (content: string, version: number) => {
    const tab = editorTabs.find((t) => t.path === showHistoryDialog.path)
    if (tab) {
      updateEditorTab(tab.id, { content, version, isDirty: true })
      // @ts-ignore
      await fileManager.saveFile(content, tab.path, tab.language, version, tab.isLocked || false)
      toast({ title: "Version Restored", description: `Restored version ${version} for ${tab.name}.` })
      setShowHistoryDialog({ open: false, path: "", history: [] })
    }
  }

  const exportProject = async () => {
    const allFolders = await fsDB.current.getAllFolders();
    if (allFolders.length === 0) {
        toast({ title: "No folders to export", variant: "destructive" });
        return;
    }
    const blob = new Blob([JSON.stringify(allFolders)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `codefusion-workspace.codefusion`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ title: "Workspace Exported", description: `Workspace saved to codefusion-workspace.codefusion` })
  }

  const importProject = async () => {
    fileManager.openFile()
    // Note: Actual import logic would require parsing the JSON file and restoring the folder structure
    toast({ title: "Import Project", description: "Project import initiated." })
  }

  const [allFolders, setAllFolders] = useState<FileTreeItem[]>([])

  const handleOpenFolder = async () => {
    const folders = await fsDB.current.getAllFolders();
    setAllFolders(folders);
    setOpenFolderDialog(true);
  };

  const loadFolder = (folder: FileTreeItem) => {
    setCurrentFolder(folder);
    const openFiles = async (items: FileTreeItem[]) => {
        for (const item of items) {
          if (item.type === "file") {
            const file = await fsDB.current.getFile(item.path)
            if (file) {
              const newTab: EditorTab = {
                id: `tab-${Date.now()}`,
                name: item.name,
                // @ts-ignore
                content: file.content,
                // @ts-ignore
                language: file.language,
                path: item.path,
                // @ts-ignore
                version: file.version,
                // @ts-ignore
                isLocked: file.isLocked,
              }
              addEditorTab(newTab)
            }
          } else if (item.children) {
            await openFiles(item.children)
          }
        }
      }
      if (folder.children) {
        openFiles(folder.children)
      }
    setOpenFolderDialog(false);
  };

  const menuHandlers = {
    onNewFile: () => createNewFile(`untitled-${Date.now()}.js`, ""),
    onNewFolder: () => setSaveAsFolderDialog(true),
    onOpenFile: fileManager.openFile,
    onOpenFolder: handleOpenFolder,
    onSaveFolderAs: handleSaveFolderAs,
    onSave: async () => {
      const currentTab = editorTabs.find((tab) => tab.id === activeEditorTab)
      // @ts-ignore
      if (currentTab && !currentTab.isLocked) {
        // @ts-ignore
        await fileManager.saveFile(currentTab.content, currentTab.path, currentTab.language, currentTab.version || 1, currentTab.isLocked || false)
        updateEditorTab(activeEditorTab!, { isDirty: false, version: (currentTab.version || 1) + 1 })
      }
    },
    onSaveAs: async () => {
      const currentTab = editorTabs.find((tab) => tab.id === activeEditorTab)
      // @ts-ignore
      if (currentTab && !currentTab.isLocked) {
        // @ts-ignore
        fileManager.saveAs(currentTab.content, currentTab.name, currentTab.language, currentTab.version || 1, currentTab.isLocked || false, (path) =>
          updateEditorTab(activeEditorTab!, { name: path.split("/").pop() || "", path, isDirty: false }),
        )
      }
    },
    onSaveAll: async () => {
      for (const tab of editorTabs) {
        // @ts-ignore
        if (tab.isDirty && !tab.isLocked) {
          // @ts-ignore
          await fileManager.saveFile(tab.content, tab.path, tab.language, tab.version || 1, tab.isLocked || false)
          updateEditorTab(tab.id, { isDirty: false, version: (tab.version || 1) + 1 })
        }
      }
      toast({ title: "All Files Saved", description: "All modified files have been saved." })
    },
    onToggleAutoSave: () => setAutoSave(!autoSave),
    onNewWindow: () => toast({ title: "New Window", description: "Opening new window..." }),
    onOpenWorkspace: () => toast({ title: "Open Workspace", description: "Opening workspace..." }),
    onOpenRecent: () => setOpenFolderDialog(true),
    onAddFolderToWorkspace: () => toast({ title: "Add Folder", description: "Adding folder to workspace..." }),
    onRevertFile: () => toast({ title: "Revert File", description: "File reverted to last saved version." }),
    onCloseEditor: () => activeEditorTab && closeTab(activeEditorTab, { stopPropagation: () => {} } as React.MouseEvent),
    onCloseFolder: closeFolder,
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
    onToggleExplorer: () => {
      updateAIAssistant({ showExplorer: !showExplorer })
      setActiveIcon(showExplorer ? "none" : "explorer")
    },
    onToggleSearch: () => toast({ title: "Search", description: "Toggling search panel..." }),
    onToggleSourceControl: () => toast({ title: "Source Control", description: "Toggling source control panel..." }),
    onGoBack: () => toast({ title: "Go Back", description: "Navigating back..." }),
    onGoForward: () => toast({ title: "Go Forward", description: "Navigating forward..." }),
    onGoToFile: () => toast({ title: "Go to File", description: "Opening file navigation..." }),
    onGoToSymbol: () => toast({ title: "Go to Symbol", description: "Opening symbol navigation..." }),
    onStartDebugging: () => toast({ title: "Start Debugging", description: "Starting debugging session..." }),
    onRunWithoutDebugging: () => toast({ title: "Run Without Debugging", description: "Running without debugging..." }),
    onStopDebugging: () => toast({ title: "Stop Debugging", description: "Stopping debugging session..." }),
    onStepOver: () => toast({ title: "Step Over", description: "Stepping over..." }),
    onStepInto: () => toast({ title: "Step Into", description: "Stepping into..." }),
    onStepOut: () => toast({ title: "Step Out", description: "Stepping out..." }),
    onNewTerminal: () => {
      updateAIAssistant({ showTerminal: true, activePanel: "terminal" })
      setActiveIcon("terminal")
    },
    onSplitTerminal: () => toast({ title: "Split Terminal", description: "Splitting terminal..." }),
    onClearTerminal: () => toast({ title: "Clear Terminal", description: "Clearing terminal..." }),
    onKillTerminal: () => {
      updateAIAssistant({ showTerminal: false, activePanel: "problems" })
      setActiveIcon("problems")
      toast({ title: "Kill Terminal", description: "Terminal closed." })
    },
    onShowWelcome: () => toast({ title: "Welcome", description: "Showing welcome page..." }),
    onShowDocumentation: () => toast({ title: "Documentation", description: "Opening documentation..." }),
    onCheckUpdates: () => toast({ title: "Check for Updates", description: "Checking for updates..." }),
    onShowAbout: () => toast({ title: "About", description: "Showing about information..." }),
    onDuplicateItem: () => {
      const currentTab = editorTabs.find((tab) => tab.id === activeEditorTab)
      if (currentTab) {
        // @ts-ignore
        fileManager.duplicateItem(currentTab.path)
      }
    },
    onToggleTheme: () => toast({ title: "Toggle Theme", description: "Switching theme..." }),
    onExportProject: exportProject,
    onImportProject: importProject,
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    setStartY(e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isResizing) {
      const deltaY = startY - e.clientY
      updateAIAssistant({ terminalHeight: Math.max(100, Math.min(terminalHeight + deltaY, window.innerHeight - 200)) })
      setStartY(e.clientY)
    }
  }

  const handleMouseUp = () => {
    setIsResizing(false)
  }

  useImperativeHandle(ref, () => ({
    insertCode: (code: string, language?: string) => {
      const currentTab = editorTabs.find((tab) => tab.id === activeEditorTab)
      // @ts-ignore
      if (currentTab && !currentTab.isLocked) {
        const newContent = currentTab.content + "\n" + code
        updateEditorTab(activeEditorTab!, { content: newContent, isDirty: true })
        toast({ title: "Code Inserted", description: "Code snippet added to the editor." })
      } else {
        const newPath = `snippet-${Date.now()}.${language || "txt"}`
        const newTab: EditorTab = {
          id: `tab-${Date.now()}`,
          // @ts-ignore
          name: path.split("/").pop() || "",
          content: code,
          language: language || "text",
          path: newPath,
          // @ts-ignore
          version: 1,
          // @ts-ignore
          isLocked: false,
        }
        addEditorTab(newTab)
        updateAIAssistant({ activeEditorTab: newTab.id })
        toast({ title: "New File Created", description: `Created ${newPath} with inserted code.` })
      }
    },
    getCurrentCode: () => {
      const currentTab = editorTabs.find((tab) => tab.id === activeEditorTab)
      return currentTab?.content || ""
    },
    getOpenFiles: () => editorTabs,
    getActiveFile: () => activeEditorTab,
    restoreState: (state: any) => {
      state.editorTabs.forEach((tab: EditorTab) => addEditorTab(tab))
      // @ts-ignore
      updateAIAssistant({ activeEditorTab: state.activeEditorTab, currentFolder: state.currentFolder })
      setCurrentFolder(state.currentFolder)
      toast({ title: "State Restored", description: "Editor state has been restored." })
    },
  }))

  const renderMermaidDiagram = (code: string) => {
    try {
      const diagramId = `mermaid-${Date.now()}`
      setTimeout(() => {
        mermaid.render(diagramId, code, (svgCode: string) => {
          const container = document.getElementById(diagramId)
          if (container) {
            container.innerHTML = svgCode
          }
        })
      }, 0)
      return <div id={diagramId} className="mermaid-diagram" />
    } catch (error) {
      return <div className="text-red-500">Invalid Mermaid diagram syntax</div>
    }
  }

  return (
    <div
      className="flex flex-col h-screen bg-[#1e1e1e] text-gray-300 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Menu Bar */}
      <VSCodeMenu {...menuHandlers} onSaveFolderAs={handleSaveFolderAs} autoSave={autoSave} />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-12 bg-[#333333] border-r border-[#3c3c3c] flex flex-col items-center py-2">
          {/* ... sidebar icons */}
        </div>

        {/* Explorer Panel */}
        {showExplorer && (
          <div className="w-64 bg-[#252526] border-r border-[#3c3c3c] flex flex-col">
            <EnhancedFileExplorer
              onFileSelect={openFileByPath}
              onNewFile={createNewFile}
              onNewFolder={() => setSaveAsFolderDialog(true)}
              onRefresh={() => toast({ title: "Refresh", description: "Explorer refreshed." })}
              onRename={handleRename}
              onDelete={handleDelete}
              onDrop={handleDrop}
              onToggleLock={handleToggleLock}
              onToggleStar={handleToggleStar}
              onShowHistory={handleShowHistory}
            />
          </div>
        )}

        {/* Editor Area */}
        <div className="flex flex-col flex-1">
          {/* Tabs */}
          <div className="flex bg-[#252526] border-b border-[#3c3c3c] overflow-x-auto">
            {editorTabs.map((tab) => (
              <div
                key={tab.id}
                className={cn(
                  "flex items-center px-4 py-2 text-sm cursor-pointer border-r border-[#3c3c3c] hover:bg-[#2a2d2e] min-w-[150px] max-w-[250px] truncate",
                  activeEditorTab === tab.id ? "bg-[#1e1e1e] text-gray-100" : "text-gray-400",
                  tab.isDirty && "italic",
                  tab.isLocked && "text-gray-500"
                )}
                onClick={() => updateAIAssistant({ activeEditorTab: tab.id })}
              >
                {/* @ts-ignore */}
                {tab.isLocked && <Lock className="h-3 w-3 mr-1 text-red-400" />}
                <span title={tab.path}>{tab.name}</span>
                {/* @ts-ignore */}
                {(tab.isDirty || !tab.isLocked) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-2"
                    onClick={(e) => closeTab(tab.id, e)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden">
            {activeEditorTab ? (
              editorTabs.find((tab) => tab.id === activeEditorTab)?.language === "mermaid" ? (
                renderMermaidDiagram(editorTabs.find((tab) => tab.id === activeEditorTab)!.content)
              ) : (
                <CodeEditor
                  value={editorTabs.find((tab) => tab.id === activeEditorTab)?.content || ""}
                  language={editorTabs.find((tab) => tab.id === activeEditorTab)?.language || "text"}
                  height="100%"
                  onChange={(value) => handleContentChange(value, activeEditorTab)}
                  readOnly={editorTabs.find((tab) => tab.id === activeEditorTab)?.isLocked}
                />
              )
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Open a file to start editing
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      {showTerminal && (
        <div
          className="bg-[#1e1e1e] border-t border-[#3c3c3c]"
          style={{ height: `${terminalHeight}px` }}
        >
          <div
            className="h-2 bg-[#3c3c3c] cursor-ns-resize"
            onMouseDown={handleMouseDown}
          />
          <Tabs
            value={activePanel || "terminal"}
            onValueChange={(value) => updateAIAssistant({ activePanel: value })}
            className="h-full flex flex-col"
          >
            <TabsList className="bg-[#252526] justify-start">
              <TabsTrigger value="terminal">Terminal</TabsTrigger>
              <TabsTrigger value="problems">Problems</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="terminal" className="flex-1 overflow-hidden">
              <EnhancedTerminalComponent
                onNewFile={createNewFile}
                onNewFolder={() => setSaveAsFolderDialog(true)}
              />
            </TabsContent>
            <TabsContent value="problems" className="flex-1 overflow-hidden">
              <ProblemsPanel />
            </TabsContent>
            <TabsContent value="history" className="flex-1 overflow-hidden">
              <TaskHistoryPanel />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={openFolderDialog} onOpenChange={setOpenFolderDialog}>
        {/* ... open folder dialog */}
      </Dialog>

      <Dialog open={saveAsFolderDialog} onOpenChange={setSaveAsFolderDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Save Folder As</DialogTitle>
            </DialogHeader>
            <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter new folder name"
                autoFocus
            />
            <DialogFooter>
                <Button variant="outline" onClick={() => setSaveAsFolderDialog(false)}>
                    Cancel
                </Button>
                <Button onClick={executeSaveFolderAs} disabled={!newFolderName}>
                    Save
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

      <Dialog open={openFolderDialog} onOpenChange={setOpenFolderDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Open Folder</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-60">
                {allFolders.length === 0 ? (
                    <p className="text-sm text-gray-400 p-4">No saved folders found.</p>
                ) : (
                    allFolders.map((folder) => (
                    <div
                        key={folder.id}
                        className="flex items-center justify-between p-2 hover:bg-[#3c3c3c] rounded cursor-pointer"
                        onClick={() => loadFolder(folder)}
                    >
                        <span>{folder.name}</span>
                        <span className="text-xs text-gray-400">{folder.path}</span>
                    </div>
                    ))
                )}
            </ScrollArea>
        </DialogContent>
    </Dialog>

      {showHistoryDialog.open && (
        <HistoryPanel
          filePath={showHistoryDialog.path}
          history={showHistoryDialog.history}
          onRestore={handleRestoreHistory}
          onClose={() => setShowHistoryDialog({ open: false, path: "", history: [] })}
        />
      )}

      <input
        type="file"
        ref={fileManager.fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
    </div>
  )
});
