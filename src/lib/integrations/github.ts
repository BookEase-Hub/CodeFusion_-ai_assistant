interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string
  private: boolean
  clone_url: string
  html_url: string
  language: string
  stargazers_count: number
  updated_at: string
}

interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  public_repos: number
}

export class GitHubIntegration {
  private static baseURL = "https://api.github.com"

  static async authenticate(token: string): Promise<GitHubUser> {
    const response = await fetch(`${this.baseURL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub authentication failed: ${response.statusText}`)
    }

    return response.json()
  }

  static async getUserRepos(token: string, page = 1, per_page = 30): Promise<GitHubRepo[]> {
    const response = await fetch(`${this.baseURL}/user/repos?page=${page}&per_page=${per_page}&sort=updated`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch repositories: ${response.statusText}`)
    }

    return response.json()
  }

  static async getRepoContents(token: string, owner: string, repo: string, path = ""): Promise<any[]> {
    const response = await fetch(`${this.baseURL}/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch repository contents: ${response.statusText}`)
    }

    return response.json()
  }

  static async getFileContent(token: string, owner: string, repo: string, path: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch file content: ${response.statusText}`)
    }

    const data = await response.json()
    return atob(data.content.replace(/\n/g, ""))
  }

  static async cloneRepository(token: string, repo: GitHubRepo): Promise<any> {
    // Simulate cloning by fetching the repository structure
    const owner = repo.full_name.split("/")[0]
    const repoName = repo.name

    const contents = await this.getRepoContents(token, owner, repoName)

    // Recursively fetch all files
    const fileTree = await this.buildFileTree(token, owner, repoName, contents)

    return {
      id: `cloned_${repo.id}_${Date.now()}`,
      name: repo.name,
      description: repo.description,
      language: repo.language,
      files: fileTree,
      metadata: {
        originalRepo: repo,
        clonedAt: new Date().toISOString(),
        totalFiles: this.countFiles(fileTree),
      },
    }
  }

  private static async buildFileTree(
    token: string,
    owner: string,
    repo: string,
    contents: any[],
    basePath = "",
  ): Promise<any[]> {
    const fileTree = []

    for (const item of contents) {
      if (item.type === "file") {
        try {
          const content = await this.getFileContent(token, owner, repo, item.path)
          fileTree.push({
            name: item.name,
            path: item.path,
            type: "file",
            content,
            size: item.size,
          })
        } catch (error) {
          console.warn(`Failed to fetch content for ${item.path}:`, error)
          fileTree.push({
            name: item.name,
            path: item.path,
            type: "file",
            content: "",
            size: item.size,
            error: "Failed to fetch content",
          })
        }
      } else if (item.type === "dir") {
        try {
          const subContents = await this.getRepoContents(token, owner, repo, item.path)
          const subTree = await this.buildFileTree(token, owner, repo, subContents, item.path)
          fileTree.push({
            name: item.name,
            path: item.path,
            type: "directory",
            children: subTree,
          })
        } catch (error) {
          console.warn(`Failed to fetch directory ${item.path}:`, error)
        }
      }
    }

    return fileTree
  }

  private static countFiles(fileTree: any[]): number {
    let count = 0
    for (const item of fileTree) {
      if (item.type === "file") {
        count++
      } else if (item.type === "directory" && item.children) {
        count += this.countFiles(item.children)
      }
    }
    return count
  }
}
