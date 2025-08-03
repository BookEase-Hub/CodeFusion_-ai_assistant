"use client"

import React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Save,
  Download,
  Undo,
  Redo,
  Scissors,
  Copy,
  Clipboard,
  Search,
  Replace,
  FileText,
  Settings,
  Play,
  Bug,
  Terminal,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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

export function EditorToolbar({
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

  // Add keyboard event listener
  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyboardShortcut)
    return () => document.removeEventListener("keydown", handleKeyboardShortcut)
  }, [handleKeyboardShortcut])

  return (
    <TooltipProvider>
      <div className="h-12 bg-[#2d2d30] border-b border-[#3c3c3c] flex items-center px-4 gap-2">
        {/* Project Info */}
        <div className="flex items-center gap-2 mr-4">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-300 truncate max-w-48">{projectName}</span>
        </div>

        <Separator orientation="vertical" className="h-6 bg-[#3c3c3c]" />

        {/* File Operations */}
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

        {/* Edit Operations */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo} className="h-8 w-8 p-0">
                <Undo className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onRedo} disabled={!canRedo} className="h-8 w-8 p-0">
                <Redo className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 bg-[#3c3c3c]" />

        {/* Clipboard Operations */}
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

        {/* Search Operations */}
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side actions */}
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

        {/* Save As Dialog */}
        <Dialog open={showSaveAsDialog} onOpenChange={setShowSaveAsDialog}>
          <DialogContent className="bg-[#252526] border-[#3c3c3c]">
            <DialogHeader>
              <DialogTitle className="text-white">Save Project As</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Project Name</label>
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name..."
                  className="bg-[#3c3c3c] border-[#3c3c3c] text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      confirmSaveAs()
                    }
                  }}
                />
              </div>
              <p className="text-xs text-gray-500">This will create a new project and reset the current workspace.</p>
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
