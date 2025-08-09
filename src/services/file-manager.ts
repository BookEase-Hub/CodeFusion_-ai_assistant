"use client"

export interface FileHandle {
  name: string
  path: string
  content: string
  type: string
  lastModified: Date
}

export interface FolderHandle {
  name: string
  path: string
  children: (FileHandle | FolderHandle)[]
}

export class MobileFileManager {
  private static instance: MobileFileManager
  private recentFiles: FileHandle[] = []
  private workspaces: Record<string, FolderHandle> = {}

  static getInstance(): MobileFileManager {
    if (!MobileFileManager.instance) {
      MobileFileManager.instance = new MobileFileManager()
    }
    return MobileFileManager.instance
  }

  // 📂 Open File - Mobile file picker
  async openFile(): Promise<FileHandle | null> {
    try {
      // Check if File System Access API is available
      if ("showOpenFilePicker" in window) {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [
            {
              description: "Code files",
              accept: {
                "text/*": [".txt", ".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".json", ".md"],
                "application/json": [".json"],
                "application/javascript": [".js"],
              },
            },
          ],
          multiple: false,
        })

        const file = await fileHandle.getFile()
        const content = await file.text()

        const handle: FileHandle = {
          name: file.name,
          path: file.name,
          content,
          type: file.type || "text/plain",
          lastModified: new Date(file.lastModified),
        }

        this.addToRecentFiles(handle)
        return handle
      } else {
        // Fallback for browsers without File System Access API
        return this.openFileWithInput()
      }
    } catch (error) {
      console.error("Error opening file:", error)
      return null
    }
  }

  // Fallback file picker using input element
  private openFileWithInput(): Promise<FileHandle | null> {
    return new Promise((resolve) => {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = ".txt,.js,.ts,.jsx,.tsx,.html,.css,.json,.md"

      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0]
        if (file) {
          const content = await file.text()
          const handle: FileHandle = {
            name: file.name,
            path: file.name,
            content,
            type: file.type || "text/plain",
            lastModified: new Date(file.lastModified),
          }
          this.addToRecentFiles(handle)
          resolve(handle)
        } else {
          resolve(null)
        }
      }

      input.click()
    })
  }

  // 📁 Open Folder
  async openFolder(): Promise<FolderHandle | null> {
    try {
      if ("showDirectoryPicker" in window) {
        const dirHandle = await (window as any).showDirectoryPicker()
        const folder = await this.processDirectoryHandle(dirHandle)
        this.workspaces[folder.name] = folder
        return folder
      } else {
        // Fallback: show message about browser support
        alert("Folder access requires a modern browser. Please use Chrome, Edge, or Safari.")
        return null
      }
    } catch (error) {
      console.error("Error opening folder:", error)
      return null
    }
  }

  private async processDirectoryHandle(dirHandle: any): Promise<FolderHandle> {
    const children: (FileHandle | FolderHandle)[] = []

    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === "file") {
        const file = await handle.getFile()
        const content = await file.text()
        children.push({
          name: file.name,
          path: `${dirHandle.name}/${file.name}`,
          content,
          type: file.type || "text/plain",
          lastModified: new Date(file.lastModified),
        })
      } else if (handle.kind === "directory") {
        const subFolder = await this.processDirectoryHandle(handle)
        children.push(subFolder)
      }
    }

    return {
      name: dirHandle.name,
      path: dirHandle.name,
      children,
    }
  }

  // 🗃️ Open Workspace
  async openWorkspace(workspaceName: string): Promise<FolderHandle | null> {
    const workspace = this.workspaces[workspaceName]
    if (workspace) {
      return workspace
    }

    // Try to load from localStorage
    const saved = localStorage.getItem(`workspace_${workspaceName}`)
    if (saved) {
      const workspace = JSON.parse(saved)
      this.workspaces[workspaceName] = workspace
      return workspace
    }

    return null
  }

  // 🕘 Get Recent Files
  getRecentFiles(): FileHandle[] {
    return this.recentFiles.slice(0, 10) // Return last 10 files
  }

  private addToRecentFiles(file: FileHandle) {
    // Remove if already exists
    this.recentFiles = this.recentFiles.filter((f) => f.path !== file.path)
    // Add to beginning
    this.recentFiles.unshift(file)
    // Keep only last 10
    this.recentFiles = this.recentFiles.slice(0, 10)

    // Persist to localStorage
    localStorage.setItem("recent_files", JSON.stringify(this.recentFiles))
  }

  // 💾 Save File
  async saveFile(file: FileHandle): Promise<boolean> {
    try {
      if ("showSaveFilePicker" in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: file.name,
          types: [
            {
              description: "Code files",
              accept: {
                "text/*": [".txt", ".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".json", ".md"],
              },
            },
          ],
        })

        const writable = await fileHandle.createWritable()
        await writable.write(file.content)
        await writable.close()

        return true
      } else {
        // Fallback: download file
        this.downloadFile(file)
        return true
      }
    } catch (error) {
      console.error("Error saving file:", error)
      return false
    }
  }

  // 💾 Save As
  async saveAs(file: FileHandle, newName?: string): Promise<boolean> {
    const fileToSave = { ...file, name: newName || file.name }
    return this.saveFile(fileToSave)
  }

  // Fallback download method
  private downloadFile(file: FileHandle) {
    const blob = new Blob([file.content], { type: file.type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 📄 Create New File
  createNewFile(name = "untitled.txt", content = ""): FileHandle {
    const timestamp = Date.now()
    const file: FileHandle = {
      name: name.includes(".") ? name : `${name}-${timestamp}.txt`,
      path: name,
      content,
      type: "text/plain",
      lastModified: new Date(),
    }

    this.addToRecentFiles(file)
    return file
  }

  // 🔁 Auto Save functionality
  private autoSaveEnabled = false
  private autoSaveInterval: NodeJS.Timeout | null = null

  enableAutoSave(callback: (file: FileHandle) => void, intervalMs = 5000) {
    this.autoSaveEnabled = true
    this.autoSaveInterval = setInterval(() => {
      // Auto-save logic would go here
      // This would be called from the editor component
    }, intervalMs)
  }

  disableAutoSave() {
    this.autoSaveEnabled = false
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }
  }

  // 📱 Mobile-specific utilities

  // Check if running on mobile
  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // Get available storage info
  async getStorageInfo(): Promise<{ used: number; available: number } | null> {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0,
      }
    }
    return null
  }

  // 🌐 Cloud integration helpers

  // Save to cloud (placeholder for future implementation)
  async saveToCloud(file: FileHandle, provider: "google" | "dropbox" | "onedrive"): Promise<boolean> {
    // This would integrate with cloud storage APIs
    console.log(`Saving ${file.name} to ${provider}`)
    return true
  }

  // Load from cloud (placeholder for future implementation)
  async loadFromCloud(provider: "google" | "dropbox" | "onedrive"): Promise<FileHandle[]> {
    // This would integrate with cloud storage APIs
    console.log(`Loading files from ${provider}`)
    return []
  }

  // 🗂️ Workspace management

  saveWorkspace(name: string, workspace: FolderHandle) {
    this.workspaces[name] = workspace
    localStorage.setItem(`workspace_${name}`, JSON.stringify(workspace))
  }

  getWorkspaces(): string[] {
    return Object.keys(this.workspaces)
  }

  deleteWorkspace(name: string) {
    delete this.workspaces[name]
    localStorage.removeItem(`workspace_${name}`)
  }
}

// Export singleton instance
export const fileManager = MobileFileManager.getInstance()
