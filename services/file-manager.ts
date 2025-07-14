"use client";

import { get, set, del } from "idb-keyval";

export interface FileHandle {
  name: string;
  path: string;
  content: string;
  type: string;
  lastModified: Date;
}

export interface FolderHandle {
  name: string;
  path: string;
  children: (FileHandle | FolderHandle)[];
}

export class MobileFileManager {
  private static instance: MobileFileManager;
  private recentFiles: FileHandle[] = [];
  private workspaces: Record<string, FolderHandle> = {};

  static getInstance(): MobileFileManager {
    if (!MobileFileManager.instance) {
      MobileFileManager.instance = new MobileFileManager();
    }
    return MobileFileManager.instance;
  }

  private constructor() {
    // Load recent files from IndexedDB on initialization
    this.loadRecentFilesFromDB();
    this.loadWorkspacesFromDB();
  }

  // 📂 Open File - Mobile file picker
  async openFile(): Promise<FileHandle | null> {
    try {
      if ("showOpenFilePicker" in window) {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [
            {
              description: "Code files",
              accept: {
                "text/*": [".txt", ".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".json", ".md", ".py", ".java", ".cpp"],
                "application/json": [".json"],
                "application/javascript": [".js"],
              },
            },
          ],
          multiple: false,
        });

        const file = await fileHandle.getFile();
        const content = await file.text();

        const handle: FileHandle = {
          name: file.name,
          path: file.name,
          content,
          type: file.type || "text/plain",
          lastModified: new Date(file.lastModified),
        };

        await this.addToRecentFiles(handle);
        return handle;
      } else {
        return this.openFileWithInput();
      }
    } catch (error: any) {
      console.error("Error opening file:", error);
      throw new Error(`Failed to open file: ${error.message}`);
    }
  }

  // Fallback file picker using input element
  private openFileWithInput(): Promise<FileHandle | null> {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt,.js,.ts,.jsx,.tsx,.html,.css,.json,.md,.py,.java,.cpp";

      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const content = await file.text();
          const handle: FileHandle = {
            name: file.name,
            path: file.name,
            content,
            type: file.type || "text/plain",
            lastModified: new Date(file.lastModified),
          };
          await this.addToRecentFiles(handle);
          resolve(handle);
        } else {
          resolve(null);
        }
      };

      input.click();
    });
  }

  // 📁 Open Folder
  async openFolder(): Promise<FolderHandle | null> {
    try {
      if ("showDirectoryPicker" in window) {
        const dirHandle = await (window as any).showDirectoryPicker();
        const folder = await this.processDirectoryHandle(dirHandle);
        await this.saveWorkspace(folder.name, folder);
        return folder;
      } else {
        // Fallback: Simulate folder by selecting multiple files
        return this.openFolderWithInput();
      }
    } catch (error: any) {
      console.error("Error opening folder:", error);
      throw new Error(`Failed to open folder: ${error.message}`);
    }
  }

  // Fallback folder picker using multiple file selection
  private async openFolderWithInput(): Promise<FolderHandle | null> {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt,.js,.ts,.jsx,.tsx,.html,.css,.json,.md,.py,.java,.cpp";
      input.multiple = true;

      input.onchange = async (event) => {
        const files = (event.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          const children: FileHandle[] = [];
          for (const file of Array.from(files)) {
            const content = await file.text();
            children.push({
              name: file.name,
              path: `folder/${file.name}`,
              content,
              type: file.type || "text/plain",
              lastModified: new Date(file.lastModified),
            });
          }
          const folder: FolderHandle = {
            name: "SelectedFiles",
            path: "SelectedFiles",
            children,
          };
          await this.saveWorkspace(folder.name, folder);
          resolve(folder);
        } else {
          resolve(null);
        }
      };

      input.click();
    });
  }

  private async processDirectoryHandle(dirHandle: any): Promise<FolderHandle> {
    const children: (FileHandle | FolderHandle)[] = [];

    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === "file") {
        const file = await handle.getFile();
        const content = await file.text();
        children.push({
          name: file.name,
          path: `${dirHandle.name}/${file.name}`,
          content,
          type: file.type || "text/plain",
          lastModified: new Date(file.lastModified),
        });
      } else if (handle.kind === "directory") {
        const subFolder = await this.processDirectoryHandle(handle);
        children.push(subFolder);
      }
    }

    return {
      name: dirHandle.name,
      path: dirHandle.name,
      children,
    };
  }

  // 🗃️ Open Workspace
  async openWorkspace(workspaceName: string): Promise<FolderHandle | null> {
    const workspace = this.workspaces[workspaceName];
    if (workspace) {
      return workspace;
    }

    const saved = await get(`workspace_${workspaceName}`);
    if (saved) {
      this.workspaces[workspaceName] = saved;
      return saved;
    }

    return null;
  }

  // 🕘 Get Recent Files
  getRecentFiles(): FileHandle[] {
    return this.recentFiles.slice(0, 10);
  }

  private async addToRecentFiles(file: FileHandle) {
    this.recentFiles = this.recentFiles.filter((f) => f.path !== file.path);
    this.recentFiles.unshift(file);
    this.recentFiles = this.recentFiles.slice(0, 10);
    await set("recent_files", this.recentFiles);
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
                "text/*": [".txt", ".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".json", ".md", ".py", ".java", ".cpp"],
              },
            },
          ],
        });

        const writable = await fileHandle.createWritable();
        await writable.write(file.content);
        await writable.close();
        return true;
      } else {
        this.downloadFile(file);
        return true;
      }
    } catch (error: any) {
      console.error("Error saving file:", error);
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  // 💾 Save As
  async saveAs(file: FileHandle, newName?: string): Promise<boolean> {
    const fileToSave = { ...file, name: newName || file.name };
    return this.saveFile(fileToSave);
  }

  // Fallback download method
  private downloadFile(file: FileHandle) {
    const blob = new Blob([file.content], { type: file.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 📄 Create New File
  createNewFile(name = "untitled.txt", content = ""): FileHandle {
    const timestamp = Date.now();
    const file: FileHandle = {
      name: name.includes(".") ? name : `${name}-${timestamp}.txt`,
      path: name,
      content,
      type: "text/plain",
      lastModified: new Date(),
    };
    this.addToRecentFiles(file);
    return file;
  }

  // 🔁 Auto Save functionality
  private autoSaveEnabled = false;
  private autoSaveInterval: NodeJS.Timeout | null = null;

  enableAutoSave(file: FileHandle, callback: (file: FileHandle) => void, intervalMs = 5000) {
    this.autoSaveEnabled = true;
    this.autoSaveInterval = setInterval(async () => {
      try {
        await this.saveFile(file);
        callback(file);
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, intervalMs);
  }

  disableAutoSave() {
    this.autoSaveEnabled = false;
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  // 📱 Mobile-specific utilities
  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  async getStorageInfo(): Promise<{ used: number; available: number } | null> {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0,
      };
    }
    return null;
  }

  // 🌐 Cloud integration placeholders
  async saveToCloud(file: FileHandle, provider: "google" | "dropbox" | "onedrive"): Promise<boolean> {
    console.log(`Saving ${file.name} to ${provider}`);
    return true;
  }

  async loadFromCloud(provider: "google" | "dropbox" | "onedrive"): Promise<FileHandle[]> {
    console.log(`Loading files from ${provider}`);
    return [];
  }

  // 🗂️ Workspace management
  async saveWorkspace(name: string, workspace: FolderHandle) {
    this.workspaces[name] = workspace;
    await set(`workspace_${name}`, workspace);
  }

  async getWorkspaces(): Promise<string[]> {
    return Object.keys(this.workspaces);
  }

  async deleteWorkspace(name: string) {
    delete this.workspaces[name];
    await del(`workspace_${name}`);
  }

  private async loadRecentFilesFromDB() {
    const recent = await get("recent_files");
    if (recent) {
      this.recentFiles = recent;
    }
  }

  private async loadWorkspacesFromDB() {
    const keys = await get("workspaces_keys") || [];
    for (const key of keys) {
      const workspace = await get(key);
      if (workspace) {
        this.workspaces[key.replace("workspace_", "")] = workspace;
      }
    }
  }
}

export const fileManager = MobileFileManager.getInstance();
