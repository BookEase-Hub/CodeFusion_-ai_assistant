export interface SupabaseProject {
  id: string
  name: string
  organization_id: string
  created_at: string
  updated_at: string
  status: string
}

export interface SupabaseTable {
  id: number
  schema: string
  name: string
  rls_enabled: boolean
  replica_identity: string
  bytes: number
  size: string
  live_rows_estimate: number
}

export class SupabaseIntegration {
  static async testConnection(url: string, anonKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      })
      return response.ok
    } catch {
      return false
    }
  }

  static async getProjects(accessToken: string): Promise<SupabaseProject[]> {
    const response = await fetch("https://api.supabase.com/v1/projects", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch Supabase projects: ${response.statusText}`)
    }

    return response.json()
  }

  static async getTables(url: string, serviceKey: string): Promise<SupabaseTable[]> {
    const response = await fetch(`${url}/rest/v1/rpc/get_tables`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch tables: ${response.statusText}`)
    }

    return response.json()
  }

  static async getTableData(url: string, anonKey: string, tableName: string, limit = 10): Promise<any[]> {
    const response = await fetch(`${url}/rest/v1/${tableName}?limit=${limit}`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch table data: ${response.statusText}`)
    }

    return response.json()
  }
}
