export interface HFModel {
  id: string
  author: string
  sha: string
  created_at: string
  last_modified: string
  private: boolean
  downloads: number
  likes: number
  tags: string[]
  pipeline_tag: string
  library_name: string
}

export interface HFDataset {
  id: string
  author: string
  sha: string
  created_at: string
  last_modified: string
  private: boolean
  downloads: number
  likes: number
  tags: string[]
  description: string
}

export class HuggingFaceIntegration {
  private static baseURL = "https://huggingface.co/api"

  static async testConnection(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/whoami-v2`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.ok
    } catch {
      return false
    }
  }

  static async getModels(token: string, limit = 20): Promise<HFModel[]> {
    const response = await fetch(`${this.baseURL}/models?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`)
    }

    return response.json()
  }

  static async getDatasets(token: string, limit = 20): Promise<HFDataset[]> {
    const response = await fetch(`${this.baseURL}/datasets?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch datasets: ${response.statusText}`)
    }

    return response.json()
  }

  static async getUserInfo(token: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/whoami-v2`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`)
    }

    return response.json()
  }
}
