import { openDB, type IDBPDatabase } from "idb"
import { type Project } from "@/hooks/use-app-state"

const DB_NAME = "CodeFusionDB"
const DB_VERSION = 1
const STORE_NAME = "projects"

class ProjectManager {
  private dbPromise: Promise<IDBPDatabase>

  constructor() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "name" })
        }
      },
    })
  }

  async saveProject(project: Project): Promise<void> {
    try {
      const db = await this.dbPromise
      await db.put(STORE_NAME, project)
    } catch (error) {
      console.error("Failed to save project to IndexedDB:", error)
      throw new Error("Could not save project.")
    }
  }

  async loadProject(projectName: string): Promise<Project | null> {
    try {
      const db = await this.dbPromise
      const project = await db.get(STORE_NAME, projectName)
      return project || null
    } catch (error) {
      console.error("Failed to load project from IndexedDB:", error)
      return null
    }
  }

  async listProjects(): Promise<string[]> {
    try {
      const db = await this.dbPromise
      const keys = await db.getAllKeys(STORE_NAME)
      return keys as string[]
    } catch (error) {
      console.error("Failed to list projects from IndexedDB:", error)
      return []
    }
  }

  async deleteProject(projectName: string): Promise<void> {
    try {
      const db = await this.dbPromise
      await db.delete(STORE_NAME, projectName)
    } catch (error) {
      console.error("Failed to delete project from IndexedDB:", error)
      throw new Error("Could not delete project.")
    }
  }
}

// Export a singleton instance of the project manager
export const projectManager = new ProjectManager()
