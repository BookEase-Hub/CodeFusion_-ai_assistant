"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Code,
  Cpu,
  FileCode2,
  GitBranch,
  GitPullRequest,
  MessageSquareCode,
  Plug,
  Sparkles,
  Zap,
  CreditCard,
  Check,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CodeEditor } from "@/components/code-editor";
import { useAuth } from "@/contexts/auth-context";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, subscription } = useAuth(); // Assuming subscription details are available here
  const { requireAuth } = useRequireAuth();
  const router = useRouter();

  // Calculate days left in trial if applicable
  const daysLeftInTrial = user?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isTrialActive = user?.subscriptionPlan === "free" && user.subscriptionStatus === "trial";
  const isSubscribed = user?.subscriptionPlan === "premium"; // Assuming a 'premium' plan indicates active subscription

  const handleTabChange = (value: string) => {
    if (value !== "overview") {
      if (!requireAuth(`the ${value} tab`)) {
        return;
      }
    }
    setActiveTab(value);
  };

  const handleRecentProjectsClick = () => {
    if (requireAuth("Recent Projects")) {
      router.push("/projects");
    }
  };

  const handleOpenAIAssistant = () => {
    if (requireAuth("the AI Assistant")) {
      router.push("/ai-assist");
    }
  };

  const handleUpgradeClick = () => {
    if (requireAuth("Billing")) {
      router.push("/billing");
    }
  };

  const handleViewDetailedReport = () => {
    if (requireAuth("Detailed AI Reports")) {
      // Navigate or show detailed report
    }
  };

  const handleEditSnippet = () => {
    if (requireAuth("Code Snippet editing")) {
      // Handle edit snippet logic
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome to CodeFusion</h1>
        <p className="text-muted-foreground">Your AI-powered coding assistant for seamless development</p>
      </div>

      {/* Trial Information Card */}
      {isTrialActive && (
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Free Trial</CardTitle>
            <CardDescription>
              Unlimited access to all Premium features. {daysLeftInTrial} days left in your 14-day trial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2 flex-1 w-full">
                <div className="flex justify-between text-sm">
                  <span>Trial Progress</span>
                  <span>{daysLeftInTrial} / 14 days</span>
                </div>
                <Progress
                  value={((14 - daysLeftInTrial) / 14) * 100}
                  className="h-2"
                  aria-label={`Trial progress: ${daysLeftInTrial} days remaining out of 14`}
                />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleUpgradeClick}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Upgrade to Premium
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-4">
                    <p className="font-semibold">Premium Plan ($15/month)</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li className="flex items-center gap-1">
                        <Check className="h-4 w-4 text-primary" />
                        Unlimited code generations
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="h-4 w-4 text-primary" />
                        Unlimited chat interactions
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="h-4 w-4 text-primary" />
                        Mermaid architecture diagrams
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="h-4 w-4 text-primary" />
                        Code debugging and optimization explanations
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="h-4 w-4 text-primary" />
                        Automated unit testing
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="h-4 w-4 text-primary" />
                        Full API integrations (GitHub, Swagger, Firebase)
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="h-4 w-4 text-primary" />
                        Priority support
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="h-4 w-4 text-primary" />
                        Early access to new features
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="h-4 w-4 text-primary" />
                        Advanced analytics and insights
                      </li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Status for Premium Users */}
      {isSubscribed && (
        <Card className="bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-800 dark:text-green-200">Premium Active</CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Enjoy all premium benefits with unlimited access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-medium">Subscription confirmed</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Suggestions</CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FileCode2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">2 updated today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Integrations</CardTitle>
            <Plug className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Code Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">+5% from last analysis</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Your most recently updated projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "E-commerce Platform", lang: "TypeScript", progress: 75, updated: "2h ago" },
                    { name: "API Gateway", lang: "Go", progress: 45, updated: "1d ago" },
                    { name: "Mobile App", lang: "React Native", progress: 90, updated: "3d ago" },
                  ].map((project, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium leading-none">{project.name}</p>
                        <p className="text-sm text-muted-foreground">{project.lang}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24">
                          <Progress value={project.progress} className="h-2" />
                        </div>
                        <div className="text-sm text-muted-foreground">{project.updated}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 bg-transparent"
                  onClick={handleRecentProjectsClick}
                >
                  View all projects
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>Get help with your coding tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/20 p-2">
                      <Cpu className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">How can I help you today?</p>
                      <p className="text-sm text-muted-foreground">Ask me about code, debugging, or best practices.</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    "Optimize this function for performance",
                    "Debug my React component",
                    "Explain this algorithm",
                    "Generate unit tests",
                  ].map((suggestion, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="justify-start bg-transparent"
                      onClick={() => {
                        if (requireAuth("AI Assistant suggestions")) {
                          router.push("/ai-assist");
                        }
                      }}
                    >
                      <MessageSquareCode className="mr-2 h-4 w-4" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleOpenAIAssistant}
                >
                  Open AI Assistant
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Code Snippets</CardTitle>
              <CardDescription>Your recently saved code snippets</CardDescription>
            </CardHeader>
            <CardContent>
              <CodeEditor
                value={`function optimizePerformance(data) {
  // Use memoization for expensive calculations
  const cache = new Map();
  
  return function(id) {
    if (cache.has(id)) {
      return cache.get(id);
    }
    
    const result = data
      .filter(item => item.id === id)
      .map(item => processItem(item))
      .reduce((acc, val) => acc + val, 0);
      
    cache.set(id, result);
    return result;
  };
}`}
                language="javascript"
                height="200px"
                readOnly
              />
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" onClick={handleEditSnippet}>
                Edit Snippet
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Quality Analysis</CardTitle>
              <CardDescription>AI-powered insights to improve your code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">Maintainability</span>
                  </div>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">Performance</span>
                  </div>
                  <span className="text-sm font-medium">87%</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <span className="text-sm font-medium">Security</span>
                  </div>
                  <span className="text-sm font-medium">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium">Accessibility</span>
                  </div>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" onClick={handleViewDetailedReport}>
                View Detailed Report
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Suggestions</CardTitle>
              <CardDescription>AI-generated recommendations to improve your code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Replace multiple useState calls with useReducer",
                    description: "Simplify state management in your React component",
                    severity: "medium",
                  },
                  {
                    title: "Implement memoization for expensive calculations",
                    description: "Improve performance by caching results",
                    severity: "high",
                  },
                  {
                    title: "Add proper error handling to async functions",
                    description: "Prevent unhandled promise rejections",
                    severity: "high",
                  },
                ].map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
                    <div
                      className={`rounded-full p-1.5 ${
                        suggestion.severity === "high"
                          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      <Zap className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{suggestion.title}</p>
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                    </div>
                    <Badge
                      className={
                        suggestion.severity === "high"
                          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      }
                    >
                      {suggestion.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent-activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Your recent actions and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[
                  {
                    icon: GitPullRequest,
                    title: "Pull Request Merged",
                    description: "PR #42: Add authentication feature",
                    time: "2 hours ago",
                    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                  },
                  {
                    icon: Code,
                    title: "Code Snippet Created",
                    description: "Optimized performance function",
                    time: "5 hours ago",
                    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
                  },
                  {
                    icon: GitBranch,
                    title: "Branch Created",
                    description: "feature/user-dashboard from main",
                    time: "1 day ago",
                    color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
                  },
                  {
                    icon: MessageSquareCode,
                    title: "AI Assistant Used",
                    description: "Generated unit tests for auth module",
                    time: "2 days ago",
                    color: "bg-primary/20 text-primary",
                  },
                ].map((activity, i) => (
                  <div key={i} className="relative flex items-start gap-4">
                    <div className="absolute left-0 top-0 bottom-0 flex w-6 justify-center">
                      <div className="w-px bg-border" />
                    </div>
                    <div className={`relative rounded-full p-2 ${activity.color}`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
