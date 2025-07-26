"use client"

import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { User, Shield, Bell, Palette, Code, Cpu, Moon, Sun, Monitor, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

export function Settings() {
  const [activeTab, setActiveTab] = useState("account")
  const { theme, setTheme } = useTheme()
  const [fontScale, setFontScale] = useState(100)
  const [editorFontSize, setEditorFontSize] = useState(14)
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
  })

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileData)
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const handleSaveSettings = (settingType: string) => {
    toast({
      title: "Settings Saved",
      description: `Your ${settingType} settings have been saved.`,
      duration: 3000,
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4">
            <TabsList className="flex flex-col h-auto p-0 bg-transparent space-y-1">
              <TabsTrigger
                value="account"
                className="justify-start px-3 py-2 h-9 font-normal data-[state=active]:bg-muted"
              >
                <User className="mr-2 h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="justify-start px-3 py-2 h-9 font-normal data-[state=active]:bg-muted"
              >
                <Palette className="mr-2 h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger
                value="editor"
                className="justify-start px-3 py-2 h-9 font-normal data-[state=active]:bg-muted"
              >
                <Code className="mr-2 h-4 w-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="ai" className="justify-start px-3 py-2 h-9 font-normal data-[state=active]:bg-muted">
                <Cpu className="mr-2 h-4 w-4" />
                AI Settings
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="justify-start px-3 py-2 h-9 font-normal data-[state=active]:bg-muted"
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="justify-start px-3 py-2 h-9 font-normal data-[state=active]:bg-muted"
              >
                <Shield className="mr-2 h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 space-y-6">
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Manage your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user?.avatar || "/placeholder.svg?height=64&width=64"} alt="User" />
                      <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline">Change Avatar</Button>
                      <Button variant="outline" className="text-destructive hover:text-destructive bg-transparent">
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" defaultValue="johndoe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" defaultValue="Software Developer" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      placeholder="Tell us about yourself"
                      value={profileData.bio}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Linked Accounts</CardTitle>
                  <CardDescription>Connect your accounts for seamless integration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "GitHub", icon: "/placeholder.svg?height=24&width=24", connected: true },
                    { name: "Google", icon: "/placeholder.svg?height=24&width=24", connected: true },
                    { name: "Microsoft", icon: "/placeholder.svg?height=24&width=24", connected: false },
                  ].map((account, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                          <Image
                            src={account.icon || "/placeholder.svg"}
                            alt={account.name}
                            className="h-6 w-6 object-contain"
                            width={24}
                            height={24}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {account.connected ? "Connected" : "Not connected"}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">{account.connected ? "Disconnect" : "Connect"}</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                  <CardDescription>Customize the appearance of the application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Color Theme</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        className={`flex flex-col items-center justify-center gap-1 h-auto py-4 relative ${theme === "light" ? "border-primary" : ""}`}
                        onClick={() => setTheme("light")}
                      >
                        <Sun className="h-6 w-6" />
                        <span>Light</span>
                        {theme === "light" && <Check className="h-4 w-4 text-primary absolute top-2 right-2" />}
                      </Button>
                      <Button
                        variant="outline"
                        className={`flex flex-col items-center justify-center gap-1 h-auto py-4 relative ${theme === "dark" ? "border-primary" : ""}`}
                        onClick={() => setTheme("dark")}
                      >
                        <Moon className="h-6 w-6" />
                        <span>Dark</span>
                        {theme === "dark" && <Check className="h-4 w-4 text-primary absolute top-2 right-2" />}
                      </Button>
                      <Button
                        variant="outline"
                        className={`flex flex-col items-center justify-center gap-1 h-auto py-4 relative ${theme === "system" ? "border-primary" : ""}`}
                        onClick={() => setTheme("system")}
                      >
                        <Monitor className="h-6 w-6" />
                        <span>System</span>
                        {theme === "system" && <Check className="h-4 w-4 text-primary absolute top-2 right-2" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Font Size</Label>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Small</span>
                        <span className="text-sm">{fontScale}%</span>
                        <span className="text-sm">Large</span>
                      </div>
                      <Slider
                        defaultValue={[fontScale]}
                        min={75}
                        max={150}
                        step={5}
                        onValueChange={(value) => setFontScale(value[0])}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <RadioGroup defaultValue="green" className="grid grid-cols-4 gap-2">
                      <div>
                        <RadioGroupItem value="green" id="green" className="sr-only peer" />
                        <Label
                          htmlFor="green"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-green-500 p-4 hover:bg-green-600 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="sr-only">Green</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="blue" id="blue" className="sr-only peer" />
                        <Label
                          htmlFor="blue"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-blue-500 p-4 hover:bg-blue-600 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="sr-only">Blue</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="purple" id="purple" className="sr-only peer" />
                        <Label
                          htmlFor="purple"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-purple-500 p-4 hover:bg-purple-600 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="sr-only">Purple</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="orange" id="orange" className="sr-only peer" />
                        <Label
                          htmlFor="orange"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-orange-500 p-4 hover:bg-orange-600 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="sr-only">Orange</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleSaveSettings("appearance")}
                  >
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Layout</CardTitle>
                  <CardDescription>Configure the layout of the application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-mode">Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Reduce spacing and padding throughout the interface
                      </p>
                    </div>
                    <Switch id="compact-mode" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sidebar-position">Sidebar Position</Label>
                      <p className="text-sm text-muted-foreground">Choose the position of the sidebar</p>
                    </div>
                    <Select defaultValue="left">
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="editor" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Editor Preferences</CardTitle>
                  <CardDescription>Customize your code editor experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="editor-theme">Editor Theme</Label>
                    <Select defaultValue="system">
                      <SelectTrigger id="editor-theme">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">Follow System</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="github">GitHub</SelectItem>
                        <SelectItem value="monokai">Monokai</SelectItem>
                        <SelectItem value="dracula">Dracula</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label>Font Size</Label>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">12px</span>
                        <span className="text-sm">{editorFontSize}px</span>
                        <span className="text-sm">24px</span>
                      </div>
                      <Slider
                        defaultValue={[editorFontSize]}
                        min={12}
                        max={24}
                        step={1}
                        onValueChange={(value) => setEditorFontSize(value[0])}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select defaultValue="fira-code">
                      <SelectTrigger id="font-family">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fira-code">Fira Code</SelectItem>
                        <SelectItem value="jetbrains-mono">JetBrains Mono</SelectItem>
                        <SelectItem value="cascadia-code">Cascadia Code</SelectItem>
                        <SelectItem value="roboto-mono">Roboto Mono</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="line-numbers">Line Numbers</Label>
                        <p className="text-sm text-muted-foreground">Show line numbers in the editor</p>
                      </div>
                      <Switch id="line-numbers" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="word-wrap">Word Wrap</Label>
                        <p className="text-sm text-muted-foreground">Wrap long lines to fit in the editor</p>
                      </div>
                      <Switch id="word-wrap" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-save">Auto Save</Label>
                        <p className="text-sm text-muted-foreground">Automatically save changes</p>
                      </div>
                      <Switch id="auto-save" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="format-on-save">Format on Save</Label>
                        <p className="text-sm text-muted-foreground">Automatically format code when saving</p>
                      </div>
                      <Switch id="format-on-save" defaultChecked />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleSaveSettings("editor")}
                  >
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Assistant Settings</CardTitle>
                  <CardDescription>Configure your AI coding assistant</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="ai-model">AI Model</Label>
                    <Select defaultValue="gpt-4">
                      <SelectTrigger id="ai-model">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                        <SelectItem value="claude">Claude</SelectItem>
                        <SelectItem value="deepseek">DeepSeek</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="code-suggestions">Code Suggestions</Label>
                        <p className="text-sm text-muted-foreground">Show AI-powered code suggestions while typing</p>
                      </div>
                      <Switch id="code-suggestions" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-complete">Auto-Complete</Label>
                        <p className="text-sm text-muted-foreground">Automatically complete code as you type</p>
                      </div>
                      <Switch id="auto-complete" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="error-detection">Error Detection</Label>
                        <p className="text-sm text-muted-foreground">
                          Detect and suggest fixes for errors in your code
                        </p>
                      </div>
                      <Switch id="error-detection" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="code-explanations">Code Explanations</Label>
                        <p className="text-sm text-muted-foreground">Provide explanations for selected code</p>
                      </div>
                      <Switch id="code-explanations" defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api-key">Custom API Key (Optional)</Label>
                    <Input id="api-key" type="password" placeholder="Enter your API key" />
                    <p className="text-sm text-muted-foreground">Leave blank to use the default API key</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleSaveSettings("AI")}
                  >
                    Save AI Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email Notifications</h3>
                    <div className="space-y-2">
                      {[
                        { id: "email-updates", label: "Product Updates" },
                        { id: "email-security", label: "Security Alerts" },
                        { id: "email-tips", label: "Tips & Tutorials" },
                        { id: "email-newsletter", label: "Newsletter" },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <Label htmlFor={item.id} className="flex-1">
                            {item.label}
                          </Label>
                          <Switch id={item.id} defaultChecked={item.id !== "email-newsletter"} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">In-App Notifications</h3>
                    <div className="space-y-2">
                      {[
                        { id: "app-mentions", label: "Mentions & Comments" },
                        { id: "app-updates", label: "Project Updates" },
                        { id: "app-ai", label: "AI Suggestions" },
                        { id: "app-security", label: "Security Alerts" },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <Label htmlFor={item.id} className="flex-1">
                            {item.label}
                          </Label>
                          <Switch id={item.id} defaultChecked />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notification-sound">Notification Sound</Label>
                    <Select defaultValue="chime">
                      <SelectTrigger id="notification-sound">
                        <SelectValue placeholder="Select sound" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chime">Chime</SelectItem>
                        <SelectItem value="bell">Bell</SelectItem>
                        <SelectItem value="ping">Ping</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleSaveSettings("notification")}
                  >
                    Save Notification Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security and authentication</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                      <Button className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
                        Update Password
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Switch id="two-factor" />
                    </div>
                    <div className="rounded-md border p-4 text-sm text-muted-foreground">
                      Two-factor authentication is not enabled yet. Enable it to add an extra layer of security to your
                      account.
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Active Sessions</h3>
                    <div className="space-y-4">
                      {[
                        { device: "MacBook Pro", location: "San Francisco, CA", lastActive: "Now", current: true },
                        {
                          device: "iPhone 13",
                          location: "San Francisco, CA",
                          lastActive: "2 hours ago",
                          current: false,
                        },
                        { device: "Windows PC", location: "New York, NY", lastActive: "3 days ago", current: false },
                      ].map((session, i) => (
                        <div key={i} className="flex items-start justify-between rounded-md border p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{session.device}</p>
                              {session.current && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                >
                                  Current
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{session.location}</p>
                            <p className="text-sm text-muted-foreground">Last active: {session.lastActive}</p>
                          </div>
                          {!session.current && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive bg-transparent"
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="text-destructive hover:text-destructive bg-transparent">
                    Log Out of All Devices
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

export default Settings
