"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"

export type ProjectStatus = "synced" | "pending" | "error"

export interface Project {
  id: string
  name: string
  description: string
  language: string
  template: string
  status: ProjectStatus
  createdAt: string
  updatedAt:string
}

// Function to get projects for a user from localStorage
const getLocalProjects = (userId: string): Project[] => {
  try {
    const localData = localStorage.getItem(`codefusion_projects_${userId}`)
    return localData ? JSON.parse(localData) : []
  } catch (error) {
    console.error("Failed to parse projects from localStorage", error)
    return []
  }
}

// Function to save projects for a user to localStorage
const saveLocalProjects = (userId: string, projects: Project[]) => {
  try {
    localStorage.setItem(`codefusion_projects_${userId}`, JSON.stringify(projects))
  } catch (error) {
    console.error("Failed to save projects to localStorage", error)
  }
}

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
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  const syncProjects = useCallback(async () => {
    if (!user) return

    setIsSyncing(true)
    try {
      const localProjects = getLocalProjects(user.id)
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
      saveLocalProjects(user.id, finalProjects)
      await cloudStorage.saveProjects(user.id, finalProjects)

    } catch (error) {
      console.error("Failed to sync projects", error)
    } finally {
      setIsSyncing(false)
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      setIsLoading(true)
      syncProjects()
    } else {
      setProjects([])
      setIsLoading(false)
    }
  }, [user, syncProjects])

  const createProject = useCallback(async (newProjectData: Omit<Project, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      throw new Error("User must be logged in to create a project.")
    }

    const newProject: Project = {
      ...newProjectData,
      id: `proj_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to local state immediately for responsive UI
    const updatedLocalProjects = [newProject, ...projects]
    setProjects(updatedLocalProjects)
    saveLocalProjects(user.id, updatedLocalProjects)

    // Asynchronously sync with the "cloud"
    try {
        await syncProjects()
        // After syncing, the project status will be updated to 'synced'
    } catch (error) {
        console.error("Failed to sync after creating project", error)
        // Revert status to 'error' if sync fails
        setProjects(currentProjects =>
            currentProjects.map(p =>
                p.id === newProject.id ? { ...p, status: 'error' } : p
            )
        )
    }
  }, [user, projects, syncProjects])

  return { projects, isLoading, isSyncing, createProject }
}
