"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  Plus,
  FileText,
  FolderPlus,
  Edit3,
  Trash2,
  RefreshCw,
  Copy,
  Scissors,
} from "lucide-react"
import { useAppState, type FileNode } from "@/contexts/app-state-context"
import { useToast } from "@/hooks/use-toast"

export function ProjectExplorer() {
  const { state, openEditorTab } = useAppState()
  const { currentProject } = state.aiAssistant
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [contextMenuNode, setContextMenuNode] = useState<FileNode | null>(null)
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
    (node: FileNode) => {
      if (node.type === "folder") {
        toggleFolder(node.id)
      } else {
        openEditorTab(node)
        setSelectedNode(node.id)
      }
    },
    [toggleFolder, openEditorTab],
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
        // TODO: Implement file/folder moving
        toast({
          title: "Move Operation",
          description: `Moving ${draggedNode} to ${targetNodeId}`,
        })
      }
      setDraggedNode(null)
    },
    [draggedNode, toast],
  )

  const handleContextMenu = useCallback((node: FileNode) => {
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
      // TODO: Implement delete functionality
      toast({
        title: "Delete",
        description: `Deleted ${contextMenuNode.name}`,
      })
    }
  }, [contextMenuNode, toast])

  const handleConvertToFolder = useCallback(() => {
    if (contextMenuNode && contextMenuNode.type === "file") {
      // TODO: Implement convert to folder
      toast({
        title: "Convert to Folder",
        description: `Converted ${contextMenuNode.name} to folder`,
      })
    }
  }, [contextMenuNode, toast])

  const handleConvertToFile = useCallback(() => {
    if (contextMenuNode && contextMenuNode.type === "folder") {
      // TODO: Implement convert to file
      toast({
        title: "Convert to File",
        description: `Converted ${contextMenuNode.name} to file`,
      })
    }
  }, [contextMenuNode, toast])

  const confirmNewFile = useCallback(() => {
    if (newItemName.trim()) {
      // TODO: Create new file
      toast({
        title: "New File",
        description: `Created ${newItemName}`,
      })
      setShowNewFileDialog(false)
      setNewItemName("")
    }
  }, [newItemName, toast])

  const confirmNewFolder = useCallback(() => {
    if (newItemName.trim()) {
      // TODO: Create new folder
      toast({
        title: "New Folder",
        description: `Created folder ${newItemName}`,
      })
      setShowNewFolderDialog(false)
      setNewItemName("")
    }
  }, [newItemName, toast])

  const confirmRename = useCallback(() => {
    if (newItemName.trim() && contextMenuNode) {
      // TODO: Rename item
      toast({
        title: "Rename",
        description: `Renamed ${contextMenuNode.name} to ${newItemName}`,
      })
      setShowRenameDialog(false)
      setNewItemName("")
    }
  }, [newItemName, contextMenuNode, toast])

  const renderFileTree = useCallback(
    (nodes: FileNode[], level = 0) => {
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
                    <File className="w-4 h-4 mr-2 text-gray-400" />
                  </>
                )}
                <span className="text-sm text-gray-300 truncate">
                  {node.name}
                  {node.isDirty && <span className="text-orange-400 ml-1">•</span>}
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
        <p className="text-gray-400 text-sm">No project loaded</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-[#252526] flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-[#3c3c3c] flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300 truncate">{currentProject.name}</h3>
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

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {currentProject.files.length > 0 ? (
            renderFileTree(currentProject.files)
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-sm text-gray-400 mb-2">No files in project</p>
              <Button variant="outline" size="sm" onClick={handleNewFile} className="bg-transparent border-[#3c3c3c]">
                <Plus className="w-4 h-4 mr-1" />
                Create File
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Dialogs */}
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
