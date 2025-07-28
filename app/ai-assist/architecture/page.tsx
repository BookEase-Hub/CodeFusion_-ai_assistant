"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ZoomIn, ZoomOut, Download, RefreshCw } from "lucide-react"
import mermaid from "mermaid"

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
  themeVariables: {
    primaryColor: "#007acc",
    primaryTextColor: "#ffffff",
    primaryBorderColor: "#3c3c3c",
    lineColor: "#3c3c3c",
    sectionBkgColor: "#252526",
    altSectionBkgColor: "#1e1e1e",
    gridColor: "#3c3c3c",
    secondaryColor: "#252526",
    tertiaryColor: "#3c3c3c",
  },
})

export default function VSCodeArchitecture() {
  const architectureRef = useRef<HTMLDivElement>(null)
  const workflowRef = useRef<HTMLDivElement>(null)
  const extensionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const renderDiagrams = async () => {
      try {
        if (architectureRef.current) {
          const { svg } = await mermaid.render(
            "architecture-diagram",
            `
            graph TD
              A["VS Code Menu System"] --> B["File"]
              A --> C["Edit"]
              A --> D["Selection"]
              A --> E["View"]
              A --> F["Go"]
              A --> G["Run"]
              A --> H["Terminal"]
              A --> I["Help"]

              B --> B1["New File/Folder"]
              B --> B2["Open File/Folder"]
              B --> B3["Save Operations"]
              B --> B4["Preferences"]

              C --> C1["Clipboard Operations"]
              C --> C2["Find & Replace"]
              C --> C3["Line Operations"]
              C --> C4["Selection Operations"]

              D --> D1["Selection Operations"]

              E --> E1["Command Palette"]
              E --> E2["Sidebar Panels"]
              E --> E3["Editor Layout"]
              E --> E4["Appearance Settings"]

              F --> F1["Navigation History"]
              F --> F2["Go to Location"]
              F --> F3["Go to Symbol"]
              F --> F4["Go to Problem"]

              G --> G1["Debug Operations"]
              G --> G2["Run Tasks"]
              G --> G3["Breakpoints"]

              H --> H1["Terminal Operations"]
              H --> H2["Terminal Configuration"]

              I --> I1["Documentation"]
              I --> I2["Support"]
              I --> I3["About"]

              J["Editor Component"] --> K["Tabs"]
              J --> L["Editor Area"]
              J --> M["Status Bar"]

              K --> K1["Tab Management"]
              L --> L1["Code Editing"]
              L --> L2["Intellisense"]
              M --> M1["Status Information"]

              N["Sidebar"] --> N1["Explorer"]
              N --> N2["Search"]
              N --> N3["Source Control"]
              N --> N4["Run and Debug"]
              N --> N5["Extensions"]

              O["Panel"] --> O1["Problems"]
              O --> O2["Output"]
              O --> O3["Debug Console"]
              O --> O4["Terminal"]

              A --- J
              J --- N
              J --- O
            `,
          )
          architectureRef.current.innerHTML = svg
        }

        if (workflowRef.current) {
          const { svg } = await mermaid.render(
            "workflow-diagram",
            `
            flowchart TD
              A["Start VS Code"] --> B{"Check for Updates"}
              B -->|"Updates Available"| C["Install Updates"]
              B -->|"No Updates"| D["Load Workspace"]
              C --> D

              D --> E["Initialize Extensions"]
              E --> F["Load File Explorer"]
              F --> G["Restore Editor State"]

              G --> H{"Open Files?"}
              H -->|"Yes"| I["Load Files in Editor"]
              H -->|"No"| J["Show Welcome Page"]

              I --> K["Ready for Editing"]
              J --> K

              K --> L{"User Action"}
              L -->|"Edit File"| M["Update File in Memory"]
              L -->|"Save File"| N["Write to Disk"]
              L -->|"Run Code"| O["Execute in Terminal"]
              L -->|"Debug"| P["Start Debugger"]

              M --> L
              N --> L
              O --> L
              P --> L

              L -->|"Exit"| Q["Save Workspace State"]
              Q --> R["Close VS Code"]
            `,
          )
          workflowRef.current.innerHTML = svg
        }

        if (extensionsRef.current) {
          const { svg } = await mermaid.render(
            "extensions-diagram",
            `
            graph TD
              A["VS Code Extension API"] --> B["Language Extensions"]
              A --> C["Debugger Extensions"]
              A --> D["Themes"]
              A --> E["Snippets"]
              A --> F["Custom UI Extensions"]

              B --> B1["Syntax Highlighting"]
              B --> B2["IntelliSense"]
              B --> B3["Formatters"]
              B --> B4["Linters"]

              C --> C1["Language Debuggers"]
              C --> C2["Custom Debug UI"]

              D --> D1["Color Themes"]
              D --> D2["Icon Themes"]

              F --> F1["Webviews"]
              F --> F2["Custom Editors"]
              F --> F3["Tree Views"]
              F --> F4["Status Bar Items"]

              G["Extension Marketplace"] --> G1["Browse Extensions"]
              G --> G2["Install Extensions"]
              G --> G3["Update Extensions"]
              G --> G4["Disable Extensions"]

              H["Extension Lifecycle"] --> H1["Activation Events"]
              H --> H2["Extension Context"]
              H --> H3["Subscriptions"]
              H --> H4["Disposal"]

              A --- G
              A --- H
            `,
          )
          extensionsRef.current.innerHTML = svg
        }
      } catch (error) {
        console.error("Error rendering diagrams:", error)
      }
    }

    renderDiagrams()
  }, [])

  const handleZoomIn = () => {
    const svg = document.querySelector("svg")
    if (svg) {
      const viewBox = svg.getAttribute("viewBox")?.split(" ").map(Number) || [0, 0, 1000, 1000]
      const newWidth = viewBox[2] * 0.8
      const newHeight = viewBox[3] * 0.8
      const newX = viewBox[0] + (viewBox[2] - newWidth) / 2
      const newY = viewBox[1] + (viewBox[3] - newHeight) / 2
      svg.setAttribute("viewBox", `${newX} ${newY} ${newWidth} ${newHeight}`)
    }
  }

  const handleZoomOut = () => {
    const svg = document.querySelector("svg")
    if (svg) {
      const viewBox = svg.getAttribute("viewBox")?.split(" ").map(Number) || [0, 0, 1000, 1000]
      const newWidth = viewBox[2] * 1.2
      const newHeight = viewBox[3] * 1.2
      const newX = viewBox[0] - (newWidth - viewBox[2]) / 2
      const newY = viewBox[1] - (newHeight - viewBox[3]) / 2
      svg.setAttribute("viewBox", `${newX} ${newY} ${newWidth} ${newHeight}`)
    }
  }

  const handleDownload = () => {
    const svg = document.querySelector("svg")
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)
      const downloadLink = document.createElement("a")
      downloadLink.href = svgUrl
      downloadLink.download = "vs-code-architecture.svg"
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="p-4 bg-[#1e1e1e] rounded-lg border border-[#3c3c3c] h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">VS Code Architecture Diagrams</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Tabs defaultValue="architecture" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="architecture">Component Architecture</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="extensions">Extensions</TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-auto mt-4 bg-[#252526] rounded-md p-4">
          <TabsContent value="architecture" className="h-full">
            <div ref={architectureRef} className="h-full flex items-center justify-center" />
          </TabsContent>
          <TabsContent value="workflow" className="h-full">
            <div ref={workflowRef} className="h-full flex items-center justify-center" />
          </TabsContent>
          <TabsContent value="extensions" className="h-full">
            <div ref={extensionsRef} className="h-full flex items-center justify-center" />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
