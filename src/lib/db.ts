import { openDB, IDBPDatabase } from 'idb';
import { FileTreeItem } from '@/types';

interface RecentFolder {
    id: string;
    name: string;
    path: string;
    timestamp: number;
}

export class FileSystemDB {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB("CodeFusionDB", 3, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore("folders", { keyPath: "id" });
          db.createObjectStore("files", { keyPath: "path" });
        }
        if (oldVersion < 2) {
          db.createObjectStore("settings", { keyPath: "key" });
        }
        if (oldVersion < 3) {
          db.createObjectStore("recentFolders", { keyPath: "id" });
        }
      },
    });
  }

  async saveFolder(folder: FileTreeItem): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(["folders", "recentFolders"], "readwrite");
    const folderStore = tx.objectStore("folders");
    const recentStore = tx.objectStore("recentFolders");

    await folderStore.put(folder);
    await recentStore.put({
      id: folder.id,
      name: folder.name,
      path: folder.path,
      timestamp: Date.now(),
    });
    await tx.done;
  }

  async getFolder(id: string): Promise<FileTreeItem | undefined> {
    const db = await this.dbPromise;
    return await db.get("folders", id);
  }

  async getAllFolders(): Promise<FileTreeItem[]> {
    const db = await this.dbPromise;
    return await db.getAll("folders");
  }

  async deleteFolder(id: string): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(["folders", "recentFolders"], "readwrite");
    await tx.objectStore("folders").delete(id);
    await tx.objectStore("recentFolders").delete(id);
    await tx.done;
  }

  async saveFile(file: Partial<FileTreeItem>): Promise<void> {
    const db = await this.dbPromise;
    if (!file.path) return;

    const tx = db.transaction("files", "readwrite");
    const fileStore = tx.objectStore("files");

    const existingFile = await fileStore.get(file.path);
    const newHistory = existingFile?.history || [];
    if (existingFile && existingFile.content !== file.content && file.content !== undefined) {
      const newVersion = {
        content: existingFile.content || "",
        timestamp: new Date().toISOString(),
      };
      newHistory.unshift(newVersion);
    }

    const fileToSave = {
        ...existingFile,
        ...file,
        history: newHistory.slice(0, 10), // Keep last 10 versions
        version: (existingFile?.version || 0) + 1,
    };

    await fileStore.put(fileToSave);
    await tx.done;
  }

  async getFile(path: string): Promise<FileTreeItem | undefined> {
    const db = await this.dbPromise;
    return await db.get("files", path);
  }

  async deleteFile(path: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete("files", path);
  }

  async getRecentFolders(limit = 10): Promise<RecentFolder[]> {
    const db = await this.dbPromise;
    const recentFolders = await db.getAll("recentFolders");
    return recentFolders
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  async saveSettings(key: string, value: any): Promise<void> {
    const db = await this.dbPromise;
    await db.put("settings", { key, value });
  }

  async getSettings(key: string): Promise<any> {
    const db = await this.dbPromise;
    const result = await db.get("settings", key);
    return result?.value;
  }
}
