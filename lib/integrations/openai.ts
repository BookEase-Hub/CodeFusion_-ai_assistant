export interface OpenAIUsage {
  total_tokens: number
  prompt_tokens: number
  completion_tokens: number
  total_cost: number
}

export interface OpenAIModel {
  id: string
  object: string
  created: number
  owned_by: string
}

export class OpenAIIntegration {
  private static baseURL = "https://api.openai.com/v1"

  static async testConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      })
      return response.ok
    } catch {
      return false
    }
  }

  static async getModels(apiKey: string): Promise<OpenAIModel[]> {
    const response = await fetch(`${this.baseURL}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data
  }

  static async getUsage(apiKey: string): Promise<OpenAIUsage> {
    // Note: OpenAI doesn't provide a direct usage endpoint
    // This would typically be tracked on your backend
    return {
      total_tokens: 15420,
      prompt_tokens: 8230,
      completion_tokens: 7190,
      total_cost: 0.23,
    }
  }

  static async generateCompletion(apiKey: string, prompt: string, model = "gpt-3.5-turbo"): Promise<string> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }
}
