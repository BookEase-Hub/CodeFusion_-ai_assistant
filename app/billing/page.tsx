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

export default function BillingPage() {
  const { user, updateSubscription } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("plans")
  const [selectedPlan, setSelectedPlan] = useState<"free" | "premium">(user?.subscriptionPlan || "free")
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "stripe" | "evertry">("stripe")
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const { toast } = useToast()

  if (!user) return null

  // Calculate days left in trial if applicable
  const daysLeftInTrial = user.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const handleSubscriptionChange = async () => {
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
          <DialogContent>
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
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Select Payment Method</h4>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as "paypal" | "stripe" | "evertry")}
                    className="grid grid-cols-3 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="paypal" id="paypal" className="sr-only peer" />
                      <Label
                        htmlFor="paypal"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
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
                    <div>
                      <RadioGroupItem value="stripe" id="stripe" className="sr-only peer" />
                      <Label
                        htmlFor="stripe"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 mb-2">
                          <path
                            d="M13.479 9.883c-1.626-.604-2.512-.931-2.512-1.618 0-.604.465-.931 1.395-.931 1.626 0 3.298.652 4.465 1.233l.652-4.097C16.422 3.86 14.796 3.5 13.2 3.5 9.572 3.5 7.062 5.511 7.062 8.487c0 4.097 6.093 4.33 6.093 6.558 0 .652-.605 1.046-1.534 1.046-1.302 0-3.252-.605-4.554-1.395l-.698 4.144c1.395.698 3.205 1.162 5.021 1.162 3.903 0 6.372-1.929 6.372-5.116.046-4.283-6.139-4.516-6.139-6.558 0-.465.419-.838 1.302-.838 1.023 0 2.465.326 3.58.884l.674-4.097z"
                            fill="#6772e5"
                          />
                        </svg>
                        Stripe
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="evertry" id="evertry" className="sr-only peer" />
                      <Label
                        htmlFor="evertry"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 mb-2">
                          <rect width="24" height="24" rx="4" fill="#4CAF50" />
                          <path d="M7 12h10M12 7v10" stroke="white" strokeWidth="2" />
                        </svg>
                        EverTry
                      </Label>
                    </div>
                  </RadioGroup>
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
