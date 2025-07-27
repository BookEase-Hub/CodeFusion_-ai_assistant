"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Upload, FileCode, Zap } from "lucide-react"

export function CodeAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setAnalysis({
      maintainability: 92,
      performance: 87,
      security: 78,
      accessibility: 85,
      suggestions: [
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
      ],
    })
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Code Analyzer</CardTitle>
          <CardDescription>Upload a file to analyze its quality and get optimization suggestions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload File</Label>
            <div className="flex items-center gap-2">
              <Input id="file-upload" type="file" onChange={handleFileChange} />
              <Button onClick={handleAnalyze} disabled={!file || loading}>
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>Showing results for {file?.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Maintainability</span>
                </div>
                <span className="text-sm font-medium">{analysis.maintainability}%</span>
              </div>
              <Progress value={analysis.maintainability} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">Performance</span>
                </div>
                <span className="text-sm font-medium">{analysis.performance}%</span>
              </div>
              <Progress value={analysis.performance} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium">Security</span>
                </div>
                <span className="text-sm font-medium">{analysis.security}%</span>
              </div>
              <Progress value={analysis.security} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  <span className="text-sm font-medium">Accessibility</span>
                </div>
                <span className="text-sm font-medium">{analysis.accessibility}%</span>
              </div>
              <Progress value={analysis.accessibility} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Suggestions</CardTitle>
            <CardDescription>AI-generated recommendations to improve your code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.suggestions.map((suggestion: any, i: number) => (
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
