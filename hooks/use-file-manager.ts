import { useRef } from "react"
import { useToast } from "@/components/ui/use-toast"

export function useFileManager() {
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

  return {
    openFile,
    openFolder,
    handleFileSelect,
    handleFolderSelect,
    saveFile,
    fileInputRef,
    folderInputRef,
  }
}
