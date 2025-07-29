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
  Info,
  Calendar,
  Star,
  Globe,
  Shield,
  Clock,
  Database,
  Users,
  Rocket,
  BarChart3,
  Headphones,
  Lightbulb,
  Wrench,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  User,
  Home,
  FolderOpen,
  Bot,
  Layers,
  Cloud,
  Github,
  Menu,
  X
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-context";
import { useRequireAuth } from "@/hooks/use-require-auth";

// Mock data for projects
const mockProjects = [
  {
    id: "1",
    name: "E-commerce Platform",
    description: "A modern e-commerce platform with React and Node.js",
    language: "TypeScript",
    stars: 24,
    lastUpdated: "2 hours ago",
    progress: 75,
  },
  {
    id: "2",
    name: "API Gateway",
    description: "Microservices API gateway with authentication and rate limiting",
    language: "Go",
    stars: 18,
    lastUpdated: "1 day ago",
    progress: 45,
  },
  {
    id: "3",
    name: "Mobile App",
    description: "Cross-platform mobile application for task management",
    language: "React Native",
    stars: 32,
    lastUpdated: "3 days ago",
    progress: 90,
  },
];

// Mock data for API integrations
const apiIntegrations = [
  {
    id: "1",
    name: "GitHub",
    description: "Connect to your GitHub repositories",
    status: "connected",
    icon: "/placeholder.svg?height=40&width=40",
    lastSync: "10 minutes ago",
    category: "version-control",
  },
  {
    id: "2",
    name: "OpenAI",
    description: "AI-powered code generation and assistance",
    status: "connected",
    icon: "/placeholder.svg?height=40&width=40",
    lastSync: "1 hour ago",
    category: "ai",
  },
  {
    id: "3",
    name: "AWS",
    description: "Cloud infrastructure and deployment",
    status: "disconnected",
    icon: "/placeholder.svg?height=40&width=40",
    lastSync: "Never",
    category: "cloud",
  },
  {
    id: "4",
    name: "MongoDB",
    description: "NoSQL database integration",
    status: "connected",
    icon: "/placeholder.svg?height=40&width=40",
    lastSync: "2 days ago",
    category: "database",
  },
  {
    id: "5",
    name: "Stripe",
    description: "Payment processing integration",
    status: "error",
    icon: "/placeholder.svg?height=40&width=40",
    lastSync: "Failed 3 hours ago",
    category: "payment",
  },
  {
    id: "6",
    name: "Vercel",
    description: "Deployment and hosting platform",
    status: "connected",
    icon: "/placeholder.svg?height=40&width=40",
    lastSync: "5 hours ago",
    category: "deployment",
  },
];

// Premium benefits data
const premiumBenefits = [
  { icon: Globe, title: "Unlimited generations", description: "Generate code without limits" },
  { icon: Code, title: "Unlimited code generation", description: "Create as much code as you need" },
  { icon: Layers, title: "Mermaid architecture diagrams", description: "Visualize your system architecture" },
  { icon: Wrench, title: "Explanations for debugging", description: "Get help fixing your code" },
  { icon: Wrench, title: "Code optimization", description: "Improve your code performance" },
  { icon: Shield, title: "Automated testing", description: "Generate test suites automatically" },
  { icon: Cloud, title: "Full API integrations", description: "Connect with GitHub, Swagger, Firebase" },
  { icon: Headphones, title: "Priority support", description: "Get faster help from our team" },
  { icon: Rocket, title: "Early access to new features", description: "Try new tools before everyone else" },
  { icon: BarChart3, title: "Advanced analytics", description: "Track your coding performance" },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const router = useRouter();
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("blank");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Calculate days left in trial if applicable
  const daysLeftInTrial = user?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 14;

  const trialCreditsRemaining = 14;
  const trialEnded = daysLeftInTrial <= 0;

  const handleTabChange = (value: string) => {
    if (value !== "overview") {
      if (!requireAuth(`the ${value} tab`)) {
        return;
      }
    }
    setActiveTab(value);
  };

  const handleSubscribe = async () => {
    if (requireAuth("Billing")) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubscribed(true);
        setIsLoading(false);
      }, 1500);
    }
  };

  const handleCreateProject = () => {
    if (requireAuth("project creation")) {
      const newProject = {
        id: `project-${Date.now()}`,
        name: projectName,
        type: projectType,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        progress: 0,
      };

      // Save project to localStorage
      const savedProjects = JSON.parse(localStorage.getItem('codefusion-projects') || '[]');
      savedProjects.push(newProject);
      localStorage.setItem('codefusion-projects', JSON.stringify(savedProjects));

      // Close dialog and redirect to AI assistant
      setShowNewProjectDialog(false);
      router.push('/ai-assist');
    }
  };

  const handleUpgradeClick = () => {
    if (requireAuth("Billing")) {
      router.push("/billing");
    }
  };

  // Navigation items
  const navItems = [
    { icon: Home, label: "Dashboard", value: "overview" },
    { icon: FolderOpen, label: "Projects", value: "projects" },
    { icon: Bot, label: "AI Assistant", value: "ai-assist" },
    { icon: Layers, label: "API Hub", value: "api-hub" },
    { icon: Settings, label: "Settings", value: "settings" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full bg-white border-r">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">CodeFusion</h2>
            </div>
            <nav className="flex-1 p-2">
              {navItems.map((item) => (
                <Button
                  key={item.value}
                  variant={activeTab === item.value ? "secondary" : "ghost"}
                  className="w-full justify-start mb-1"
                  onClick={() => {
                    handleTabChange(item.value);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
            <div className="p-4 border-t">
              <Button variant="outline" className="w-full">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r pt-5">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xl font-bold">CodeFusion</h2>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.value}
                  variant={activeTab === item.value ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleTabChange(item.value)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setSidebarOpen(true)}>
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="hidden md:flex">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="ai-assist">AI Assistant</TabsTrigger>
              <TabsTrigger value="api-hub">API Hub</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">+2 from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Generations</CardTitle>
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">128</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">API Integrations</CardTitle>
                    <Plug className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">3 connected</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Code Quality</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">92%</div>
                    <p className="text-xs text-muted-foreground">+3% from last month</p>
                  </CardContent>
                </Card>
              </div>

              {user && user.subscriptionPlan === "free" && user.subscriptionStatus === "trial" && (
                <Card className="bg-primary/10 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Free Trial</CardTitle>
                    <CardDescription>
                      {trialEnded
                        ? "End of Free Tier – Upgrade to Access Premium Features"
                        : `${trialCreditsRemaining} Free Trial Credits Remaining`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1 w-full">
                        <div className="flex justify-between text-sm">
                          <span>14-day free trial</span>
                          <span>{daysLeftInTrial} days left</span>
                        </div>
                        <Progress
                          value={Math.round(((14 - daysLeftInTrial) / 14) * 100)}
                          className="h-2"
                          max={100}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={handleUpgradeClick}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Billing
                        </Button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Info className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">Premium Benefits</h4>
                              <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Unlimited generations</li>
                                <li>Unlimited code generation</li>
                                <li>Mermaid architecture diagrams</li>
                                <li>Explanations for debugging & code optimization</li>
                                <li>Automated testing</li>
                                <li>Full API integrations (GitHub, Swagger, Firebase)</li>
                                <li>Priority support</li>
                                <li>Early access to new features</li>
                                <li>Advanced analytics</li>
                              </ul>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Projects</CardTitle>
                    <CardDescription>Your most recently updated projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockProjects.slice(0, 3).map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h3 className="font-medium">{project.name}</h3>
                            <p className="text-sm text-muted-foreground">{project.description}</p>
                          </div>
                          <Badge variant="secondary">{project.language}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => handleTabChange("projects")}>
                      <FolderOpen className="mr-2 h-4 w-4" />
                      View All Projects
                    </Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Get started with common tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start" onClick={() => setShowNewProjectDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Project
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => handleTabChange("ai-assist")}>
                      <Bot className="mr-2 h-4 w-4" />
                      Open AI Assistant
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => handleTabChange("api-hub")}>
                      <Plug className="mr-2 h-4 w-4" />
                      Connect APIs
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Layers className="mr-2 h-4 w-4" />
                      View Documentation
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Projects</h2>
                  <p className="text-muted-foreground">Manage your coding projects</p>
                </div>
                <Button onClick={() => setShowNewProjectDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockProjects.map((project) => (
                  <Card key={project.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5" />
                        {project.name}
                      </CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary">{project.language}</Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Star className="mr-1 h-4 w-4" />
                          {project.stars}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      <div className="mt-4 text-sm text-muted-foreground">
                        Updated {project.lastUpdated}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button size="sm" onClick={() => router.push('/ai-assist')}>
                        <Code className="mr-2 h-4 w-4" />
                        Code
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ai-assist" className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">AI Assistant</h2>
                  <p className="text-muted-foreground">Generate code with AI assistance</p>
                </div>
                <Button onClick={() => setShowNewProjectDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>AI Code Generation</CardTitle>
                  <CardDescription>Describe what you want to build and our AI will generate the code</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="prompt">What would you like to create?</Label>
                      <div className="flex gap-2">
                        <Input id="prompt" placeholder="e.g., A React component for a login form" />
                        <Button>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">
                        Your generated code will appear here. Start by describing what you want to build.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">
                    <FileCode2 className="mr-2 h-4 w-4" />
                    View Examples
                  </Button>
                  <Button>
                    <Bot className="mr-2 h-4 w-4" />
                    Advanced Mode
                  </Button>
                </CardFooter>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Generations</CardTitle>
                    <CardDescription>Your latest AI-generated code snippets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h3 className="font-medium">Login Component</h3>
                            <p className="text-sm text-muted-foreground">React/TypeScript</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Code className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>AI Capabilities</CardTitle>
                    <CardDescription>What our AI assistant can help you with</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        "Code generation from descriptions",
                        "Bug fixing and debugging",
                        "Code optimization suggestions",
                        "Architecture diagram creation",
                        "Test suite generation",
                        "Documentation writing"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="api-hub" className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">API Hub</h2>
                  <p className="text-muted-foreground">Connect and manage your API integrations</p>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Integration
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Connected Services</CardTitle>
                  <CardDescription>Manage your API connections and integrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {apiIntegrations.map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                          <div>
                            <h3 className="font-medium">{integration.name}</h3>
                            <p className="text-sm text-muted-foreground">{integration.description}</p>
                          </div>
                        </div>
                        <Badge variant={integration.status === "connected" ? "default" : integration.status === "error" ? "destructive" : "secondary"}>
                          {integration.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>GitHub Integration</CardTitle>
                  <CardDescription>Connect your GitHub account to manage repositories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Github className="h-12 w-12 mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Connect to GitHub</h3>
                    <p className="text-muted-foreground mb-4">
                      Link your GitHub account to clone repositories and push code directly from CodeFusion
                    </p>
                    <Button>
                      <Github className="mr-2 h-4 w-4" />
                      Connect GitHub
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Settings</h2>
                  <p className="text-muted-foreground">Manage your account and preferences</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" defaultValue="Test User" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="test@example.com" />
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                    <CardDescription>Manage your subscription and payment methods</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Free Trial</h3>
                          <p className="text-sm text-muted-foreground">
                            {daysLeftInTrial} days remaining
                          </p>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <Separator />
                      <Button className="w-full" onClick={handleUpgradeClick}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Upgrade to Premium
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Start a new coding project with AI assistance
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blank">Blank Project</SelectItem>
                  <SelectItem value="web-app">Web Application</SelectItem>
                  <SelectItem value="api">API Service</SelectItem>
                  <SelectItem value="mobile">Mobile App</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
