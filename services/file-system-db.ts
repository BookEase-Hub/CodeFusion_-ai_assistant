import { openDB, IDBPDatabase } from "idb";
import { FileNode as FileTreeItem } from "@/types/ai";

export interface RecentFolder {
    id: string;
    name: string;
    path: string;
    timestamp: number;
}

export class FileSystemDB {
    private dbPromise: Promise<IDBPDatabase>

    constructor() {
      this.dbPromise = openDB("CodeFusionDB", 3, {
        upgrade(db, oldVersion) {
          if (oldVersion < 1) {
            db.createObjectStore("folders", { keyPath: "id" })
            db.createObjectStore("files", { keyPath: "path" })
          }
          if (oldVersion < 2) {
            db.createObjectStore("settings", { keyPath: "key" })
          }
          if (oldVersion < 3) {
            db.createObjectStore("recentFolders", { keyPath: "id" })
          }
        },
      })
    }

    async saveFolder(folder: FileTreeItem): Promise<void> {
      const db = await this.dbPromise
      const tx = db.transaction(["folders", "recentFolders"], "readwrite")
      const folderStore = tx.objectStore("folders")
      const recentStore = tx.objectStore("recentFolders")

      await folderStore.put(folder)
      await recentStore.put({
        id: folder.id,
        name: folder.name,
        path: folder.path,
        timestamp: Date.now(),
      })
      await tx.done
    }

    async getFolder(id: string): Promise<FileTreeItem | undefined> {
      const db = await this.dbPromise
      return await db.get("folders", id)
    }

    async getAllFolders(): Promise<FileTreeItem[]> {
      const db = await this.dbPromise
      return await db.getAll("folders")
    }

    async deleteFolder(id: string): Promise<void> {
      const db = await this.dbPromise
      const tx = db.transaction(["folders", "recentFolders"], "readwrite")
      await tx.objectStore("folders").delete(id)
      await tx.objectStore("recentFolders").delete(id)
      await tx.done
    }

    async saveFile(file: FileTreeItem): Promise<void> {
      const db = await this.dbPromise
      const tx = db.transaction(["files"], "readwrite")
      const fileStore = tx.objectStore("files")

      const existingFile = await fileStore.get(file.path)
      // @ts-ignore
      if (existingFile && existingFile.content !== file.content && file.content !== undefined) {
        const newVersion = {
            // @ts-ignore
          content: existingFile.content || "",
          timestamp: Date.now(),
          // @ts-ignore
          version: (existingFile.history?.[0]?.version || 0) + 1,
        }
        // @ts-ignore
        file.history = [newVersion, ...(existingFile.history || [])].slice(0, 3)
      }

      await fileStore.put({
        path: file.path,
        content: file.content,
        language: file.language,
        // @ts-ignore
        version: file.history?.[0]?.version || 1,
        // @ts-ignore
        history: file.history || [],
        // @ts-ignore
        isLocked: file.isLocked || false,
        // @ts-ignore
        isStarred: file.isStarred || false,
      })
      await tx.done
    }

    async getFile(path: string): Promise<FileTreeItem | undefined> {
      const db = await this.dbPromise
      return await db.get("files", path)
    }

    async deleteFile(path: string): Promise<void> {
      const db = await this.dbPromise
      await db.delete("files", path)
    }

    async getRecentFolders(limit: number = 10): Promise<RecentFolder[]> {
      const db = await this.dbPromise
      const recentFolders = await db.getAll("recentFolders")
      return recentFolders
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit)
    }

    async saveSettings(key: string, value: any): Promise<void> {
      const db = await this.dbPromise
      await db.put("settings", { key, value })
    }

    async getSettings(key: string): Promise<any> {
      const db = await this.dbPromise
      return (await db.get("settings", key))?.value
    }

    async clearAll(): Promise<void> {
        const db = await this.dbPromise;
        const tx = db.transaction(['folders', 'files', 'settings', 'recentFolders'], 'readwrite');
        await tx.objectStore('folders').clear();
        await tx.objectStore('files').clear();
        await tx.objectStore('settings').clear();
        await tx.objectStore('recentFolders').clear();
        await tx.done;
    }
  }
