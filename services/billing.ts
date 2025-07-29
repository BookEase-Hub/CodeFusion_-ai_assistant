import { User } from "@/contexts/auth-context"

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export const getBillingHistory = async (token: string) => {
  const res = await fetch(`${API_BASE}/api/billing/history`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new Error("Failed to fetch billing history")
  }
  return res.json()
}

export const purchaseCredits = async (token: string, amount: number) => {
  const res = await fetch(`${API_BASE}/api/billing/purchase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || "Failed to purchase credits")
  }

  return res.json()
}

export const useCredits = async (token: string, amount: number) => {
  const res = await fetch(`${API_BASE}/api/billing/use`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || "Failed to use credits")
  }

  return res.json()
}
