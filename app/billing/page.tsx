"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, CreditCard, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useRequireAuth } from "@/hooks/use-require-auth"

export default function BillingPage() {
  const { user, subscription, upgradeToPremium } = useAuth()
  const { requireAuth } = useRequireAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePayment = async () => {
    setIsSubmitting(true)
    if (requireAuth("Premium Upgrade")) {
      try {
        await upgradeToPremium()
        router.push("/")
      } catch (error) {
        console.error("Payment failed:", error)
        setIsSubmitting(false)
      }
    } else {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" className="gap-1" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="text-muted-foreground">Manage your subscription and payment details.</p>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Premium Plan</CardTitle>
              <CardDescription>Unlock all features and get unlimited access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">$15</span>
                <span className="text-muted-foreground">/ month</span>
              </div>
              <ul className="space-y-2 text-sm">
                {[
                  "Unlimited code generations",
                  "Unlimited chat interactions",
                  "Mermaid architecture diagrams",
                  "Code debugging and optimization explanations",
                  "Automated unit testing",
                  "Full API integrations (GitHub, Swagger, Firebase)",
                  "Priority support",
                  "Early access to new features",
                  "Advanced analytics and insights",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div>
          {subscription?.plan === "premium" ? (
            <Card>
              <CardHeader>
                <CardTitle>Subscription Active</CardTitle>
                <CardDescription>You are currently on the Premium Plan.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 rounded-md bg-green-100 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Premium active – enjoy benefits!</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Enter your payment information to upgrade to Premium.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input id="card-number" placeholder="•••• •••• •••• ••••" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry-date">Expiry Date</Label>
                    <Input id="expiry-date" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="•••" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name-on-card">Name on Card</Label>
                  <Input id="name-on-card" placeholder="John Doe" />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handlePayment}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Pay $15/month"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
