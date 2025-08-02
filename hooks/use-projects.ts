"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import useProjectsStore, { useProjectsList, useProjectsActions, Project, ProjectStatus } from "@/store/projects-store"

// This hook is now a bridge between the component and the Zustand store,
// and it also handles the cloud sync simulation.

// Simulate a cloud API for storing projects
const cloudStorage = {
  async getProjects(userId: string): Promise<Project[]> {
    console.log(`Simulating API call to get projects for user ${userId}`)
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
    const cloudData = localStorage.getItem(`codefusion_cloud_projects_${userId}`)
    return cloudData ? JSON.parse(cloudData) : []
  },

  async saveProjects(userId: string, projects: Project[]): Promise<void> {
    console.log(`Simulating API call to save projects for user ${userId}`)
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
    localStorage.setItem(`codefusion_cloud_projects_${userId}`, JSON.stringify(projects))
  }
}

export function useProjects() {
  const { user } = useAuth()
  const projects = useProjectsList()
  const { addProject, setProjects } = useProjectsActions()

  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  const syncProjects = useCallback(async () => {
    if (!user) return

    setIsSyncing(true)
    try {
      // The local projects are already in the Zustand store, which is persisted.
      // We just need to sync with the "cloud".
      const localProjects = projects
      const cloudProjects = await cloudStorage.getProjects(user.id)

      // Simple merge strategy: cloud authoritative for existing, local for new
      const mergedProjects = [...cloudProjects]
      const cloudProjectIds = new Set(cloudProjects.map(p => p.id))

      for (const localProject of localProjects) {
        if (!cloudProjectIds.has(localProject.id)) {
          mergedProjects.push(localProject)
        }
      }

      // Update statuses of newly synced projects
      const finalProjects = mergedProjects.map(p => ({ ...p, status: 'synced' as ProjectStatus }))

      setProjects(finalProjects)
      await cloudStorage.saveProjects(user.id, finalProjects)

    } catch (error) {
      console.error("Failed to sync projects", error)
    } finally {
      setIsSyncing(false)
      setIsLoading(false)
    }
  }, [user, projects, setProjects])

  useEffect(() => {
    if (user) {
      setIsLoading(true)
      // The store is already hydrated from localStorage by the persist middleware.
      // We just need to trigger a sync.
      syncProjects()
    } else {
      // Clear projects when user logs out
      setProjects([])
      setIsLoading(false)
    }
  }, [user, syncProjects, setProjects])

  const createProject = useCallback(async (newProjectData: Omit<Project, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'fileTree'>) => {
    if (!user) {
      throw new Error("User must be logged in to create a project.")
    }

    const newProject: Project = {
      ...newProjectData,
      id: `proj_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fileTree: {
        id: 'root',
        name: 'root',
        type: 'folder',
        children: [
          {
            id: 'readme',
            name: 'README.md',
            type: 'file',
            content: `# ${newProjectData.name}\n\n${newProjectData.description}`
          }
        ]
      }
    }

    addProject(newProject)

    // Asynchronously sync with the "cloud"
    try {
        await syncProjects()
        // After syncing, the project status will be updated to 'synced'
    } catch (error) {
        console.error("Failed to sync after creating project", error)
        // Revert status to 'error' if sync fails
        const currentProjects = useProjectsStore.getState().projects
        const updatedProjects = currentProjects.map(p =>
            p.id === newProject.id ? { ...p, status: 'error' as ProjectStatus } : p
        )
        setProjects(updatedProjects)
    }
  }, [user, addProject, syncProjects, setProjects])

  return { projects, isLoading, isSyncing, createProject }
}
