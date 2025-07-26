"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Play, RefreshCw, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { CodeEditor } from "@/components/code-editor"
import { CodeAnalysisService } from "@/services/code-analysis-service"

export const CodeAnalyzer: React.FC = () => {
  const [code, setCode] = useState("function example() {\n  console.log('Hello, World!');\n}")
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const serviceRef = useRef(new CodeAnalysisService())
  const { toast } = useToast()

  const handleAnalyze = async () => {
    setIsLoading(true)
    setAnalysis(null)
    try {
      const result = await serviceRef.current.analyzeCode(code)
      setAnalysis(result)
      toast({
        title: "Analysis Complete",
        description: `Analyzed ${result.lines} lines of code.`,
      })
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "An error occurred during analysis.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Code Analyzer
        </CardTitle>
        <CardDescription>Get instant feedback on your code quality</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Your Code</h3>
          <CodeEditor
            value={code}
            onChange={(value) => setCode(value || "")}
            language="javascript"
            height="300px"
          />
        </div>
        <div>
          <h3 className="font-semibold mb-2">Analysis Results</h3>
          <ScrollArea className="h-[300px] border rounded-md p-4">
            {isLoading && (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing...
              </div>
            )}
            {analysis && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Metrics</h4>
                  <p>Lines of code: {analysis.lines}</p>
                  <p>Characters: {analysis.chars}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Issues</h4>
                  {analysis.issues.length > 0 ? (
                    <ul>
                      {analysis.issues.map((issue: any, index: number) => (
                        <li key={index} className="text-red-500">
                          {issue.message}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-green-500">No issues found.</p>
                  )}
                </div>
              </div>
            )}
            {!isLoading && !analysis && (
              <p className="text-muted-foreground">Click "Analyze Code" to see the results.</p>
            )}
          </ScrollArea>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleAnalyze} disabled={isLoading}>
          <Play className="h-4 w-4 mr-2" />
          Analyze Code
        </Button>
      </CardFooter>
    </Card>
  )
}
