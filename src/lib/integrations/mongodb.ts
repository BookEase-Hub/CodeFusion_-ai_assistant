export interface MongoDatabase {
  name: string
  sizeOnDisk: number
  empty: boolean
  collections: MongoCollection[]
}

export interface MongoCollection {
  name: string
  type: string
  options: any
  info: {
    readOnly: boolean
    uuid: string
  }
  idIndex: any
}

export class MongoDBIntegration {
  static async testConnection(connectionString: string): Promise<boolean> {
    try {
      // This would typically be done on your backend
      const response = await fetch("/api/mongodb/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionString }),
      })
      return response.ok
    } catch {
      return false
    }
  }

  static async getDatabases(connectionString: string): Promise<MongoDatabase[]> {
    const response = await fetch("/api/mongodb/databases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionString }),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch databases: ${response.statusText}`)
    }

    return response.json()
  }

  static async getCollections(connectionString: string, database: string): Promise<MongoCollection[]> {
    const response = await fetch("/api/mongodb/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionString, database }),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.statusText}`)
    }

    return response.json()
  }
}
