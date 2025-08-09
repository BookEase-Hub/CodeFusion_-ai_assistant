"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { useAuth } from "./auth-context"

export interface Project {
  id: string
  name: string
  description: string
  primaryLanguage: string
  template: string
  userId?: string
  metadata?: Record<string, any>
  files?: any[]
}

interface ProjectContextType {
  projects: Project[]
  createProject: (project: Omit<Project, "id" | "userId">) => Promise<Project>
  getProject: (id: string) => Project | undefined
  updateProject: (id: string, updates: Partial<Project>) => void
  fetchProjects: () => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const { user } = useAuth()

  const getLocalStorageKey = useCallback(() => {
    return user ? `codefusion_projects_${user.id}` : null
  }, [user])

  useEffect(() => {
    const key = getLocalStorageKey()
    if (key) {
      try {
        const savedProjects = localStorage.getItem(key)
        if (savedProjects) {
          setProjects(JSON.parse(savedProjects))
        } else {
          setProjects([])
        }
      } catch (error) {
        console.error("Failed to load projects from localStorage", error)
        setProjects([])
      }
    } else {
      setProjects([])
    }
  }, [user, getLocalStorageKey])

  useEffect(() => {
    const key = getLocalStorageKey()
    if (key) {
      try {
        localStorage.setItem(key, JSON.stringify(projects))
      } catch (error) {
        console.error("Failed to save projects to localStorage", error)
      }
    }
  }, [projects, getLocalStorageKey])

  const fetchProjects = useCallback(async () => {
    if (!user) return
    try {
      const response = await fetch("/api/projects")
      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }
      const serverProjects: Project[] = await response.json()

      setProjects((prevLocalProjects) => {
        const localProjectIds = new Set(prevLocalProjects.map((p) => p.id))
        const newProjects = serverProjects.filter((p) => !localProjectIds.has(p.id))
        return [...prevLocalProjects, ...newProjects]
      })
    } catch (error) {
      console.error("Failed to fetch projects from server", error)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
    // We only want this to run when the user object changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const createProject = useCallback(
    async (projectData: Omit<Project, "id" | "userId">) => {
      if (!user) throw new Error("User must be logged in to create a project.")
      const newProject: Project = { ...projectData, id: `proj_${Date.now()}`, userId: user.id }

      // Optimistic update
      setProjects((prev) => [...prev, newProject])

      try {
        await fetch("/api/projects/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProject),
        })
      } catch (error) {
        console.error("Failed to sync project creation with the server", error)
        // Revert optimistic update on failure
        setProjects((prev) => prev.filter((p) => p.id !== newProject.id))
        throw new Error("Failed to create project on the server.")
      }

      return newProject
    },
    [user],
  )

  const getProject = useCallback(
    (id: string) => {
      return projects.find((p) => p.id === id)
    },
    [projects],
  )

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }, [])

  return (
    <ProjectContext.Provider
      value={{
        projects,
        createProject,
        getProject,
        updateProject,
        fetchProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider")
  }
  return context
}
