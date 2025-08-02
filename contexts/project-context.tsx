"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

export interface Project {
  id: string
  name: string
  description: string
  primaryLanguage: string
  template: string
  metadata?: Record<string, any>
  files?: any[]
}

interface ProjectContextType {
  projects: Project[]
  createProject: (project: Omit<Project, "id">) => Promise<Project>
  getProject: (id: string) => Project | undefined
  updateProject: (id: string, updates: Partial<Project>) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])

  const createProject = useCallback(async (projectData: Omit<Project, "id">) => {
    const newProject = { ...projectData, id: `proj_${Date.now()}` }
    setProjects((prev) => [...prev, newProject])
    return newProject
  }, [])

  const getProject = useCallback((id: string) => {
    return projects.find((p) => p.id === id)
  }, [projects])

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }, [])

  return (
    <ProjectContext.Provider
      value={{
        projects,
        createProject,
        getProject,
        updateProject,
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
