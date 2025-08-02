"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CreditCard, User, Settings, Crown, Zap, Shield, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  // Calculate days left in trial if applicable
  const daysLeftInTrial = user.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  // Calculate trial progress (14-day trial)
  const totalTrialDays = 14
  const daysUsed = totalTrialDays - daysLeftInTrial
  const trialProgress = (daysUsed / totalTrialDays) * 100

  // Determine credits remaining
  const getCreditsDisplay = () => {
    if (user.subscriptionPlan === "premium") {
      return "Unlimited Premium Access"
    }

    if (user.subscriptionStatus === "trial" && daysLeftInTrial > 0) {
      return `${daysLeftInTrial} Free Trial Days Remaining`
    }

    return "End of Free Tier – Upgrade to Access Premium Features"
  }

  const getCreditsColor = () => {
    if (user.subscriptionPlan === "premium") return "text-green-600"
    if (user.subscriptionStatus === "trial" && daysLeftInTrial > 0) return "text-blue-600"
    return "text-red-600"
  }

  const premiumBenefits = [
    "✅ Unlimited generations",
    "✅ Unlimited code generation",
    "✅ Mermaid architecture diagrams",
    "✅ Explanations for debugging & code optimization",
    "✅ Automated testing",
    "✅ Full API integrations (GitHub, Swagger, Firebase)",
    "✅ Priority support",
    "✅ Early access to new features",
    "✅ Advanced analytics",
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.name}!</p>
      </div>

      {/* Trial Status Card */}
      {user.subscriptionPlan === "free" && (
        <Card
          className={`${user.subscriptionStatus === "trial" && daysLeftInTrial > 0 ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800" : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              {user.subscriptionStatus === "trial" && daysLeftInTrial > 0 ? (
                <>
                  <Zap className="h-5 w-5 text-blue-600" />
                  14-Day Free Trial
                </>
              ) : (
                <>
                  <Crown className="h-5 w-5 text-red-600" />
                  Trial Expired
                </>
              )}
            </CardTitle>
            <CardDescription>
              {user.subscriptionStatus === "trial" && daysLeftInTrial > 0
                ? "Unlimited features during your trial period"
                : "Upgrade to continue accessing premium features"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2 flex-1 w-full">
                <div className="flex justify-between text-sm">
                  <span className={getCreditsColor()}>{getCreditsDisplay()}</span>
                  {user.subscriptionStatus === "trial" && (
                    <span className="text-muted-foreground">
                      Day {daysUsed} of {totalTrialDays}
                    </span>
                  )}
                </div>
                <Progress value={user.subscriptionStatus === "trial" ? trialProgress : 100} className="h-2" />
              </div>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild>
                        <Link href="/billing">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Billing
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-semibold">Premium Benefits:</p>
                        {premiumBenefits.slice(0, 4).map((benefit, i) => (
                          <p key={i} className="text-xs">
                            {benefit}
                          </p>
                        ))}
                        <p className="text-xs text-muted-foreground">...and more!</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {user.subscriptionStatus !== "trial" || daysLeftInTrial === 0 ? (
                  <Button
                    asChild
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Link href="/billing">
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade to Premium
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium Active Card */}
      {user.subscriptionPlan === "premium" && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 dark:from-purple-950 dark:to-blue-950 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              Premium Active
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Pro</Badge>
            </CardTitle>
            <CardDescription>Enjoy unlimited access to all premium features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2 flex-1 w-full">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-medium">✅ Premium active – enjoy benefits!</span>
                  <span className="text-muted-foreground">
                    Next billing: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
                <Progress value={100} className="h-2 bg-purple-100" />
              </div>
              <Button asChild variant="outline">
                <Link href="/billing">
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Subscription
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {user.subscriptionPlan === "premium" ? (
                <>
                  Premium
                  <Crown className="h-5 w-5 text-purple-600" />
                </>
              ) : (
                "Free"
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {user.subscriptionStatus === "active"
                ? "Your subscription is active"
                : user.subscriptionStatus === "trial"
                  ? `Trial ends in ${daysLeftInTrial} days`
                  : "Your subscription is inactive"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.avatar ? "80%" : "60%"}</div>
            <p className="text-xs text-muted-foreground">
              {user.avatar ? "Complete your billing information" : "Add an avatar and billing information"}
            </p>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/profile">Complete Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Analytics</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.subscriptionPlan === "premium" ? "Unlimited" : daysLeftInTrial > 0 ? "Unlimited*" : "Limited"}
            </div>
            <p className="text-xs text-muted-foreground">
              {user.subscriptionPlan === "premium"
                ? "Full access to all features"
                : daysLeftInTrial > 0
                  ? "Trial access to all features"
                  : "Upgrade for unlimited access"}
            </p>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings">View Analytics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[
                { title: "Code Generated", time: "2 hours ago", icon: "💻" },
                { title: "Architecture Diagram Created", time: "5 hours ago", icon: "📊" },
                { title: "API Integration Tested", time: "1 day ago", icon: "🔗" },
                { title: "Profile Updated", time: "2 days ago", icon: "👤" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex items-center justify-center mr-4">
                    <div className="rounded-full p-2 bg-primary/10">
                      <span className="text-sm">{activity.icon}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start bg-transparent" asChild>
                <Link href="/ai-assist">
                  <Zap className="mr-2 h-4 w-4" />
                  AI Assistant
                </Link>
              </Button>
              <Button variant="outline" className="justify-start bg-transparent" asChild>
                <Link href="/projects">
                  <Shield className="mr-2 h-4 w-4" />
                  My Projects
                </Link>
              </Button>
              <Button variant="outline" className="justify-start bg-transparent" asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
              <Button variant="outline" className="justify-start bg-transparent" asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Link>
              </Button>
              <Button variant="outline" className="justify-start bg-transparent" asChild>
                <Link href="/billing">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Subscription
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
