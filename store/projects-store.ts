import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type ProjectStatus = "synced" | "pending" | "error"

export interface File {
  id: string;
  name: string;
  content: string;
  type: 'file';
}

export interface Folder {
  id:string;
  name: string;
  type: 'folder';
  children: (File | Folder)[];
}

export interface Project {
  id: string
  name: string
  description: string
  language: string
  template: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  fileTree: Folder
}

interface ProjectsState {
  projects: Project[]
  activeProjectId: string | null
  actions: {
    addProject: (project: Project) => void
    setActiveProject: (projectId: string | null) => void
    updateFileContent: (projectId: string, filePath: string, content: string) => void
    setProjects: (projects: Project[]) => void
  }
}

const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      actions: {
        addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
        setActiveProject: (projectId) => set({ activeProjectId: projectId }),
        updateFileContent: (projectId, filePath, content) => {
          set(state => ({
            projects: state.projects.map(p => {
              if (p.id === projectId) {
                const updateNode = (node: File | Folder, path: string): File | Folder => {
                  const currentPath = path ? `${path}/${node.name}` : node.name;
                  if (node.type === 'file' && currentPath === filePath) {
                    return { ...node, content };
                  }
                  if (node.type === 'folder' && node.children) {
                    return { ...node, children: node.children.map(child => updateNode(child, currentPath)) };
                  }
                  return node;
                }
                const newFileTree = {
                  ...p.fileTree,
                  children: p.fileTree.children.map(child => updateNode(child, ''))
                };
                return { ...p, fileTree: newFileTree, updatedAt: new Date().toISOString() };
              }
              return p;
            })
          }));
        },
        setProjects: (projects) => set({ projects }),
      },
    }),
    {
      name: 'codefusion-projects-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      // Only persist the projects array. Actions and active project are transient.
      partialize: (state) => ({ projects: state.projects }),
    }
  )
)

// Exporting actions separately is a good practice with Zustand
// It avoids unnecessary re-renders in components that only use actions.
export const useProjectsActions = () => useProjectsStore((state) => state.actions)

// Selector to get the list of projects
export const useProjectsList = () => useProjectsStore((state) => state.projects)

// Selector to get the active project
export const useActiveProject = () => {
  const projects = useProjectsStore((state) => state.projects)
  const activeProjectId = useProjectsStore((state) => state.activeProjectId)
  return projects.find(p => p.id === activeProjectId) || null
}

export default useProjectsStore
