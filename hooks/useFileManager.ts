import { useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Workspace, FileNode as FileTreeItem } from "@/contexts/app-state-context";

// File Manager for Uploads and Downloads
export const useFileManager = () => {
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
          let currentLevel: FileTreeItem[] = fileTree
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
