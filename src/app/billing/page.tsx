"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Check, CreditCard, Calendar, Download, Crown, ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import AppLayout from "@/components/app-layout"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

export default function BillingPage() {
  const { user, updateSubscription } = useAuth()
  const { requireAuth } = useRequireAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("plans")
  const [selectedPlan, setSelectedPlan] = useState<"free" | "premium">(user?.subscriptionPlan || "free")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card")
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const { toast } = useToast()

  // Credit card form state
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
    email: user?.email || "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
  })

  if (!user) return null

  // Calculate days left in trial if applicable
  const daysLeftInTrial = user.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const totalTrialDays = 14
  const daysUsed = totalTrialDays - daysLeftInTrial
  const trialProgress = (daysUsed / totalTrialDays) * 100

  const premiumBenefits = [
    { icon: "⚡", text: "Unlimited generations" },
    { icon: "💻", text: "Unlimited code generation" },
    { icon: "📊", text: "Mermaid architecture diagrams" },
    { icon: "🔍", text: "Explanations for debugging & code optimization" },
    { icon: "🧪", text: "Automated testing" },
    { icon: "🔗", text: "Full API integrations (GitHub, Swagger, Firebase)" },
    { icon: "🎯", text: "Priority support" },
    { icon: "🚀", text: "Early access to new features" },
    { icon: "📈", text: "Advanced analytics" },
  ]

  const handlePayment = async () => {
    if (!requireAuth("processing payment")) {
      return
    }

    setPaymentProcessing(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Simulate successful payment
      await updateSubscription("premium")

      setPaymentSuccess(true)
      setConfirmDialogOpen(false)

      toast({
        title: "Payment Successful!",
        description: "Welcome to CodeFusion Premium! You now have unlimited access to all features.",
      })

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was a problem processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPaymentProcessing(false)
    }
  }

  const handleTabChange = (value: string) => {
    if (requireAuth(`viewing ${value} information`)) {
      setActiveTab(value)
    }
  }

  const handlePlanSelect = (plan: "free" | "premium") => {
    if (requireAuth(`selecting the ${plan} plan`)) {
      setSelectedPlan(plan)
      if (user.subscriptionPlan !== plan && plan === "premium") {
        setConfirmDialogOpen(true)
      }
    }
  }

  const handleDownloadInvoice = () => {
    requireAuth("downloading invoices")
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
            <p className="text-muted-foreground">Manage your subscription and billing information</p>
          </div>
        </div>

        <Tabs defaultValue="plans" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="history">Billing History</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            {/* Current Plan Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Current Plan
                  {user.subscriptionPlan === "premium" && (
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  You are currently on the {user.subscriptionPlan === "premium" ? "Premium" : "Free"} plan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">
                          {user.subscriptionPlan === "premium" ? "Premium Plan" : "Free Plan"}
                        </h3>
                        <Badge variant={user.subscriptionPlan === "premium" ? "default" : "outline"}>
                          {user.subscriptionStatus === "trial" ? "Trial" : "Active"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {user.subscriptionPlan === "premium"
                          ? "✅ Premium active – enjoy unlimited benefits!"
                          : user.subscriptionStatus === "trial"
                            ? `14-day free trial with unlimited features. ${daysLeftInTrial} days remaining.`
                            : "Limited access to basic features"}
                      </p>
                    </div>

                    {user.subscriptionPlan === "premium" ? (
                      <Button variant="outline" disabled>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Premium Active
                      </Button>
                    ) : (
                      <Button
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        onClick={() => handlePlanSelect("premium")}
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade to Premium
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plan Comparison */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className={selectedPlan === "free" ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Free Plan
                    {user.subscriptionPlan === "free" && (
                      <Badge variant="outline" className="ml-2">
                        Current Plan
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>14-day trial with unlimited features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">$0</div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>14-day free trial</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>Unlimited access during trial</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>Basic support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>Community access</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full bg-transparent" disabled>
                    {user.subscriptionPlan === "free" ? "Current Plan" : "Free Plan"}
                  </Button>
                </CardFooter>
              </Card>

              <Card
                className={`${selectedPlan === "premium" ? "border-primary" : ""} ${user.subscriptionPlan === "premium" ? "bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950" : ""}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      Premium Plan
                      <Crown className="h-5 w-5 text-purple-600" />
                    </div>
                    {user.subscriptionPlan === "premium" && (
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        Active
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Unlimited access to all premium features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">
                    $15<span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                  <div className="space-y-2">
                    {premiumBenefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-base">{benefit.icon}</span>
                        <span>{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  {user.subscriptionPlan === "premium" ? (
                    <Button variant="outline" className="w-full bg-transparent" disabled>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />✅ Premium active – enjoy benefits!
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      onClick={() => handlePlanSelect("premium")}
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      Pay $15/month
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View your billing history and download invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {user.subscriptionPlan === "premium" ? (
                  <div className="space-y-4">
                    {[
                      { date: "2024-01-01", amount: "$15.00", status: "Paid", invoice: "INV-001" },
                      { date: "2023-12-01", amount: "$15.00", status: "Paid", invoice: "INV-002" },
                      { date: "2023-11-01", amount: "$15.00", status: "Paid", invoice: "INV-003" },
                    ].map((invoice, i) => (
                      <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="rounded-full p-2 bg-primary/10">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Premium Plan - {invoice.invoice}</p>
                            <p className="text-sm text-muted-foreground">{invoice.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-medium">{invoice.amount}</p>
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          >
                            {invoice.status}
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={handleDownloadInvoice}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full p-3 bg-primary/10 mb-4">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">No billing history</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      You are currently on the Free plan. Upgrade to Premium to view your billing history.
                    </p>
                    <Button className="mt-4" onClick={() => setActiveTab("plans")}>
                      View Plans
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-600" />
                Upgrade to Premium
              </DialogTitle>
              <DialogDescription>
                Complete your payment to unlock unlimited access to all premium features.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Payment Method Selection */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Payment Method</h4>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as "card" | "paypal")}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="card" id="card" className="sr-only peer" />
                    <Label
                      htmlFor="card"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <CreditCard className="h-6 w-6 mb-2" />
                      Credit Card
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="paypal" id="paypal" className="sr-only peer" />
                    <Label
                      htmlFor="paypal"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 mb-2">
                        <path
                          d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 4.643-5.813 4.643h-2.189c-.988 0-1.829.722-1.968 1.698l-1.12 7.106c-.022.132-.004.267.05.385h3.578c.524 0 .968-.382 1.05-.9l.466-2.942c.14-.976.981-1.698 1.968-1.698h.627c3.595 0 6.664-1.414 7.612-5.618.386-1.724.162-3.14-.613-4.387z"
                          fill="#00457c"
                        />
                      </svg>
                      PayPal
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Credit Card Form */}
              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <Separator />
                  <h4 className="text-sm font-medium">Card Information</h4>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                        maxLength={19}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                          id="cvc"
                          placeholder="123"
                          value={cardDetails.cvc}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/\D/g, "") })}
                          maxLength={4}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <Separator />
                  <h4 className="text-sm font-medium">Billing Address</h4>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={cardDetails.email}
                        onChange={(e) => setCardDetails({ ...cardDetails, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="123 Main St"
                        value={cardDetails.address}
                        onChange={(e) => setCardDetails({ ...cardDetails, address: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="New York"
                          value={cardDetails.city}
                          onChange={(e) => setCardDetails({ ...cardDetails, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          placeholder="10001"
                          value={cardDetails.postalCode}
                          onChange={(e) => setCardDetails({ ...cardDetails, postalCode: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        placeholder="United States"
                        value={cardDetails.country}
                        onChange={(e) => setCardDetails({ ...cardDetails, country: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium">Order Summary</h4>
                <div className="flex justify-between text-sm">
                  <span>CodeFusion Premium (Monthly)</span>
                  <span>$15.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>$15.00/month</span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={paymentProcessing}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handlePayment}
                disabled={paymentProcessing}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {paymentProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay $15/month
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={paymentSuccess} onOpenChange={setPaymentSuccess}>
          <DialogContent className="max-w-md text-center">
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <DialogTitle>Payment Successful!</DialogTitle>
              <DialogDescription>
                Welcome to CodeFusion Premium! You now have unlimited access to all features.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✅ Unlimited generations activated</p>
                <p>✅ Premium features unlocked</p>
                <p>✅ Priority support enabled</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => router.push("/dashboard")} className="w-full">
                Go to Dashboard
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
