export interface VercelProject {
  id: string
  name: string
  accountId: string
  createdAt: number
  updatedAt: number
  framework: string
  link?: {
    type: string
    repo: string
    repoId: number
    org: string
  }
}

export interface VercelDeployment {
  uid: string
  name: string
  url: string
  created: number
  state: "BUILDING" | "ERROR" | "INITIALIZING" | "QUEUED" | "READY" | "CANCELED"
  type: "LAMBDAS"
  target: "production" | "staging"
}

export class VercelIntegration {
  private static baseURL = "https://api.vercel.com"

  static async authenticate(token: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/v2/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Vercel authentication failed: ${response.statusText}`)
    }

    return response.json()
  }

  static async getProjects(token: string): Promise<VercelProject[]> {
    const response = await fetch(`${this.baseURL}/v9/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`)
    }

    const data = await response.json()
    return data.projects
  }

  static async getDeployments(token: string, projectId?: string): Promise<VercelDeployment[]> {
    const url = projectId ? `${this.baseURL}/v6/deployments?projectId=${projectId}` : `${this.baseURL}/v6/deployments`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch deployments: ${response.statusText}`)
    }

    const data = await response.json()
    return data.deployments
  }

  static async deployProject(token: string, projectData: any): Promise<VercelDeployment> {
    const response = await fetch(`${this.baseURL}/v13/deployments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    })

    if (!response.ok) {
      throw new Error(`Failed to deploy project: ${response.statusText}`)
    }

    return response.json()
  }
}
