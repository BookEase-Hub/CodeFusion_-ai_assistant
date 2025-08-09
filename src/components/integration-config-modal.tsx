"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Eye, EyeOff, ExternalLink } from "lucide-react"
import { useIntegrations, type Integration } from "@/contexts/integration-context"

interface IntegrationConfigModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  integration: Integration | null
}

export function IntegrationConfigModal({ open, onOpenChange, integration }: IntegrationConfigModalProps) {
  const [config, setConfig] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const { connectIntegration, updateIntegration } = useIntegrations()

  React.useEffect(() => {
    if (integration) {
      setConfig(integration.config || {})
      setTestResult(null)
    }
  }, [integration])

  const handleSave = async () => {
    if (!integration) return

    setLoading(true)
    try {
      await connectIntegration(integration.id, config)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save integration config:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async () => {
    if (!integration) return

    setLoading(true)
    setTestResult(null)

    try {
      // Simulate testing the connection
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock test results based on integration type
      const success = Math.random() > 0.3 // 70% success rate for demo

      setTestResult({
        success,
        message: success
          ? `Successfully connected to ${integration.name}!`
          : `Failed to connect to ${integration.name}. Please check your credentials.`,
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: "Connection test failed. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const renderConfigFields = () => {
    if (!integration) return null

    switch (integration.id) {
      case "github":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="token">Personal Access Token</Label>
              <div className="relative">
                <Input
                  id="token"
                  type={showSecrets.token ? "text" : "password"}
                  value={config.token || ""}
                  onChange={(e) => setConfig({ ...config, token: e.target.value })}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => toggleSecretVisibility("token")}
                >
                  {showSecrets.token ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Generate a token at{" "}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center"
                >
                  GitHub Settings <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="auto-sync"
                checked={config.autoSync || false}
                onCheckedChange={(checked) => setConfig({ ...config, autoSync: checked })}
              />
              <Label htmlFor="auto-sync">Enable automatic synchronization</Label>
            </div>
          </div>
        )

      case "openai":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showSecrets.apiKey ? "text" : "password"}
                  value={config.apiKey || ""}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => toggleSecretVisibility("apiKey")}
                >
                  {showSecrets.apiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="model">Default Model</Label>
              <Select
                value={config.model || "gpt-3.5-turbo"}
                onValueChange={(value) => setConfig({ ...config, model: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maxTokens">Max Tokens</Label>
              <Input
                id="maxTokens"
                type="number"
                value={config.maxTokens || 2048}
                onChange={(e) => setConfig({ ...config, maxTokens: Number.parseInt(e.target.value) })}
                min="1"
                max="4096"
              />
            </div>
          </div>
        )

      case "mongodb":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="connectionString">Connection String</Label>
              <div className="relative">
                <Textarea
                  id="connectionString"
                  value={config.connectionString || ""}
                  onChange={(e) => setConfig({ ...config, connectionString: e.target.value })}
                  placeholder="mongodb+srv://username:password@cluster.mongodb.net/database"
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="database">Default Database</Label>
              <Input
                id="database"
                value={config.database || ""}
                onChange={(e) => setConfig({ ...config, database: e.target.value })}
                placeholder="myapp"
              />
            </div>
          </div>
        )

      case "vercel":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="token">Access Token</Label>
              <div className="relative">
                <Input
                  id="token"
                  type={showSecrets.token ? "text" : "password"}
                  value={config.token || ""}
                  onChange={(e) => setConfig({ ...config, token: e.target.value })}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => toggleSecretVisibility("token")}
                >
                  {showSecrets.token ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="team">Team ID (Optional)</Label>
              <Input
                id="team"
                value={config.team || ""}
                onChange={(e) => setConfig({ ...config, team: e.target.value })}
                placeholder="team_xxxxxxxxxxxxxxxxxxxx"
              />
            </div>
          </div>
        )

      case "stripe":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="secretKey">Secret Key</Label>
              <div className="relative">
                <Input
                  id="secretKey"
                  type={showSecrets.secretKey ? "text" : "password"}
                  value={config.secretKey || ""}
                  onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
                  placeholder="sk_test_xxxxxxxxxxxxxxxxxxxx"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => toggleSecretVisibility("secretKey")}
                >
                  {showSecrets.secretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="webhookSecret">Webhook Secret (Optional)</Label>
              <div className="relative">
                <Input
                  id="webhookSecret"
                  type={showSecrets.webhookSecret ? "text" : "password"}
                  value={config.webhookSecret || ""}
                  onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
                  placeholder="whsec_xxxxxxxxxxxxxxxxxxxx"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => toggleSecretVisibility("webhookSecret")}
                >
                  {showSecrets.webhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )

      case "aws":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="accessKeyId">Access Key ID</Label>
              <Input
                id="accessKeyId"
                value={config.accessKeyId || ""}
                onChange={(e) => setConfig({ ...config, accessKeyId: e.target.value })}
                placeholder="AKIAIOSFODNN7EXAMPLE"
              />
            </div>

            <div>
              <Label htmlFor="secretAccessKey">Secret Access Key</Label>
              <div className="relative">
                <Input
                  id="secretAccessKey"
                  type={showSecrets.secretAccessKey ? "text" : "password"}
                  value={config.secretAccessKey || ""}
                  onChange={(e) => setConfig({ ...config, secretAccessKey: e.target.value })}
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => toggleSecretVisibility("secretAccessKey")}
                >
                  {showSecrets.secretAccessKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="region">Region</Label>
              <Select
                value={config.region || "us-east-1"}
                onValueChange={(value) => setConfig({ ...config, region: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                  <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                  <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                  <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "supabase":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">Project URL</Label>
              <Input
                id="url"
                value={config.url || ""}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://xxxxxxxxxxx.supabase.co"
              />
            </div>

            <div>
              <Label htmlFor="anonKey">Anon Key</Label>
              <div className="relative">
                <Textarea
                  id="anonKey"
                  value={config.anonKey || ""}
                  onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="serviceKey">Service Role Key (Optional)</Label>
              <div className="relative">
                <Input
                  id="serviceKey"
                  type={showSecrets.serviceKey ? "text" : "password"}
                  value={config.serviceKey || ""}
                  onChange={(e) => setConfig({ ...config, serviceKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>
        )

      case "huggingface":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="token">Access Token</Label>
              <div className="relative">
                <Input
                  id="token"
                  type={showSecrets.token ? "text" : "password"}
                  value={config.token || ""}
                  onChange={(e) => setConfig({ ...config, token: e.target.value })}
                  placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => toggleSecretVisibility("token")}
                >
                  {showSecrets.token ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Generate a token at{" "}
                <a
                  href="https://huggingface.co/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center"
                >
                  Hugging Face Settings <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </p>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            Configuration options for {integration.name} are not yet available.
          </div>
        )
    }
  }

  if (!integration) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure {integration.name}</DialogTitle>
          <DialogDescription>
            Set up your {integration.name} integration with the required credentials and settings.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="test">Test Connection</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            {renderConfigFields()}
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Test your {integration.name} connection to ensure everything is working correctly.
              </p>

              <Button onClick={handleTest} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>

              {testResult && (
                <div
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg ${
                    testResult.success
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {testResult.success ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Success
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Failed</Badge>
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Configuration"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
