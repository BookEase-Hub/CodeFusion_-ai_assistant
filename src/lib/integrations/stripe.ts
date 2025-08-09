export interface StripeAccount {
  id: string
  object: string
  business_profile: {
    name: string
    support_email: string
    url: string
  }
  capabilities: Record<string, string>
  country: string
  default_currency: string
  details_submitted: boolean
  email: string
  payouts_enabled: boolean
  charges_enabled: boolean
}

export interface StripeTransaction {
  id: string
  object: string
  amount: number
  currency: string
  created: number
  description: string
  status: string
  customer: string
}

export class StripeIntegration {
  private static baseURL = "https://api.stripe.com/v1"

  static async testConnection(secretKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/account`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      return response.ok
    } catch {
      return false
    }
  }

  static async getAccount(secretKey: string): Promise<StripeAccount> {
    const response = await fetch(`${this.baseURL}/account`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch Stripe account: ${response.statusText}`)
    }

    return response.json()
  }

  static async getTransactions(secretKey: string, limit = 10): Promise<StripeTransaction[]> {
    const response = await fetch(`${this.baseURL}/charges?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data
  }

  static async getWebhooks(secretKey: string): Promise<any[]> {
    const response = await fetch(`${this.baseURL}/webhook_endpoints`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch webhooks: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data
  }
}
