"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, Check, CreditCard, Calendar, Download, ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { AppLayout } from "@/components/app-layout"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function BillingPage() {
  const { user, updateSubscription } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("plans")
  const [selectedPlan, setSelectedPlan] = useState<"free" | "premium">(user?.subscriptionPlan || "free")
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const { toast } = useToast()
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: ""
  })

  if (!user) return null

  // Calculate days left in trial if applicable
  const daysLeftInTrial = user.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

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
    }
    return v
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    if (formatted.length <= 19) {
      setCardDetails(prev => ({ ...prev, number: formatted }))
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value)
    if (formatted.length <= 5) {
      setCardDetails(prev => ({ ...prev, expiry: formatted }))
    }
  }

  const handleCVCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 4) {
      setCardDetails(prev => ({ ...prev, cvc: value }))
    }
  }

  const handleSubscriptionChange = async () => {
    if (selectedPlan === "premium") {
      // Validate card details
      const cardNumberValid = cardDetails.number.replace(/\s/g, "").length === 16
      const expiryValid = cardDetails.expiry.length === 5 && /^\d{2}\/\d{2}$/.test(cardDetails.expiry)
      const cvcValid = cardDetails.cvc.length >= 3

      if (!cardNumberValid || !expiryValid || !cvcValid) {
        toast({
          title: "Invalid card details",
          description: "Please enter valid card information",
          variant: "destructive",
        })
        return
      }
    }

    setIsSubmitting(true)
    try {
      await updateSubscription(selectedPlan)
      toast({
        title: "Subscription updated",
        description: `Your subscription has been updated to the ${selectedPlan === "premium" ? "Premium" : "Free"} plan.`,
      })
      setConfirmDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem updating your subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">Manage your subscription and billing information</p>
        </div>

        <Tabs defaultValue="plans" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="history">Billing History</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
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
                          ? "Unlimited access to all features"
                          : user.subscriptionStatus === "trial"
                            ? `5 free generations. Trial ends in ${daysLeftInTrial} days.`
                            : "5 free generations for the first week"}
                      </p>
                    </div>
                    {user.subscriptionPlan === "premium" ? (
                      <Button variant="outline">Manage Subscription</Button>
                    ) : (
                      <Button
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => {
                          setSelectedPlan("premium")
                          setConfirmDialogOpen(true)
                        }}
                      >
                        Upgrade to Premium
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className={selectedPlan === "free" ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Free Plan
                    {selectedPlan === "free" && (
                      <Badge variant="outline" className="ml-2">
                        Current Plan
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Basic access with limited features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">$0</div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>5 free generations for the first week</span>
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
                  <Button
                    variant={selectedPlan === "free" ? "outline" : "default"}
                    className="w-full"
                    onClick={() => {
                      setSelectedPlan("free")
                      if (user.subscriptionPlan !== "free") {
                        setConfirmDialogOpen(true)
                      }
                    }}
                    disabled={user.subscriptionPlan === "free"}
                  >
                    {user.subscriptionPlan === "free" ? "Current Plan" : "Downgrade"}
                  </Button>
                </CardFooter>
              </Card>

              <Card className={selectedPlan === "premium" ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Premium Plan
                    {selectedPlan === "premium" && (
                      <Badge variant="outline" className="ml-2">
                        Current Plan
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Full access to all features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">
                    $15<span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>Unlimited generations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>Advanced features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>Early access to new features</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={selectedPlan === "premium" ? "outline" : "default"}
                    className={`w-full ${selectedPlan !== "premium" ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                    onClick={() => {
                      setSelectedPlan("premium")
                      if (user.subscriptionPlan !== "premium") {
                        setConfirmDialogOpen(true)
                      }
                    }}
                    disabled={user.subscriptionPlan === "premium"}
                  >
                    {user.subscriptionPlan === "premium" ? "Current Plan" : "Upgrade"}
                  </Button>
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
                      { date: "2023-12-01", amount: "$15.00", status: "Paid" },
                      { date: "2023-11-01", amount: "$15.00", status: "Paid" },
                      { date: "2023-10-01", amount: "$15.00", status: "Paid" },
                    ].map((invoice, i) => (
                      <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="rounded-full p-2 bg-primary/10">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Premium Plan</p>
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
                          <Button variant="ghost" size="icon">
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
                    <Button
                      className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => setActiveTab("plans")}
                    >
                      View Plans
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Subscription Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedPlan === "premium" ? "Upgrade to Premium" : "Downgrade to Free"}</DialogTitle>
              <DialogDescription>
                {selectedPlan === "premium"
                  ? "You are about to upgrade to the Premium plan. You will be charged $15.00 per month."
                  : "You are about to downgrade to the Free plan. You will lose access to Premium features."}
              </DialogDescription>
            </DialogHeader>
            {selectedPlan === "premium" && (
              <div className="space-y-4 py-4">
                <div className="space-y-3">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 1234 1234 1234"
                    value={cardDetails.number}
                    onChange={handleCardNumberChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={handleExpiryChange}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="cvc">CVC</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Check className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>3-4 digit code on back of card</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={cardDetails.cvc}
                      onChange={handleCVCChange}
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubscriptionChange}
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {selectedPlan === "premium" ? "Upgrade" : "Downgrade"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

