"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Terminal, FileText, Folder, RefreshCw, Clock, Send, Copy, ZoomIn, ZoomOut, Maximize2, Download, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { mermaid } from "@codemirror/lang-mermaid";
import { useToast } from "@/components/ui/use-toast";
import { useEditorContext } from "@/contexts/EditorContext";
import { aiService } from "@/lib/ai/agentService";
import { cn } from "@/lib/utils";
import * as mermaidLib from "mermaid";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "code" | "command" | "file";
  code?: { language: string; value: string };
  suggestions?: string[];
}

interface FileTreeItem {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileTreeItem[];
}

interface EditorTab {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
}

const CodeFusionPanel = ({
  onInsertCode,
  onUpdateDiagram,
  fileTree,
  activeTab,
  tabs,
}: {
  onInsertCode: (code: string, language: string) => void;
  onUpdateDiagram: (path: string, content: string) => void;
  fileTree: FileTreeItem[];
  activeTab: string | null;
  tabs: EditorTab[];
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Welcome to CodeFusion AI! I can help with code generation, debugging, refactoring, terminal commands, and project architecture visualization. Try asking for a component, a command, or a diagram.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [diagramContent, setDiagramContent] = useState<string>("");
  const [diagramError, setDiagramError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const { activeFile, projectStructure, terminalHistory, updateTerminalHistory } = useEditorContext();
  const { toast } = useToast();

  // Initialize Mermaid
  useEffect(() => {
    mermaidLib.initialize({ startOnLoad: true, theme: "dark" });
  }, []);

  // Scroll to bottom for chat messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Generate context-aware suggestions
  const generateSuggestions = useCallback(
    (input: string) => {
      const lowerInput = input.toLowerCase();
      const currentTab = tabs.find((tab) => tab.id === activeTab);
      const suggestions: string[] = [];

      if (!input) {
        suggestions.push(
          "Generate a React component",
          "Run npm install",
          "Refactor current file",
          "Create project architecture diagram"
        );
      } else if (lowerInput.includes("react") || lowerInput.includes("component")) {
        suggestions.push(
          "Generate a functional component",
          "Add state management with Redux",
          "Create a custom React hook"
        );
      } else if (lowerInput.includes("debug") || lowerInput.includes("fix")) {
        suggestions.push(
          `Debug ${currentTab?.name || "current file"}`,
          "Fix TypeScript errors",
          "Analyze runtime issues"
        );
      } else if (lowerInput.includes("terminal") || lowerInput.includes("command")) {
        suggestions.push(
          "Run npm start",
          "Execute tests with Jest",
          "Install a new package"
        );
      } else if (lowerInput.includes("refactor")) {
        suggestions.push(
          "Convert to functional components",
          "Extract logic to custom hook",
          "Optimize performance"
        );
      } else if (lowerInput.includes("diagram") || lowerInput.includes("architecture")) {
        suggestions.push(
          "Generate project architecture diagram",
          "Update existing Mermaid diagram",
          "Export diagram as SVG"
        );
      }
      return suggestions.slice(0, 3);
    },
    [activeTab, tabs]
  );

  // Update suggestions when input or active tab changes
  useEffect(() => {
    setSuggestions(generateSuggestions(input));
  }, [input, activeTab, generateSuggestions]);

  // Handle Mermaid diagram rendering
  const activeDiagram = tabs.find((tab) => tab.id === activeTab && tab.language === "mermaid");

  useEffect(() => {
    if (activeDiagram) {
      setDiagramContent(activeDiagram.content);
    } else {
      const projectStructure = fileTree
        .filter((node) => node.type === "folder")
        .map((node) => `  ${node.name} --> ${node.children?.map((child) => child.name).join("|") || "No children"}`)
        .join("\n");
      setDiagramContent(`graph TD
  Project --> ${projectStructure || "No folders found"}`);
    }
  }, [activeTab, tabs, fileTree]);

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        if (mermaidRef.current && diagramContent) {
          const { svg } = await mermaidLib.render("architecture-diagram", diagramContent);
          mermaidRef.current.innerHTML = svg;
          setDiagramError(null);
        }
      } catch (err) {
        setDiagramError(`Mermaid rendering error: ${(err as Error).message}`);
      }
    };
    renderDiagram();
  }, [diagramContent]);

  // Handle sending messages and interacting with LangChain.js
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await aiService.runTask(input);
      let aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.output,
        type: "text",
        suggestions: generateSuggestions(""),
      };

      // Handle code or diagram responses
      if (response.output.includes("```")) {
        const codeMatch = response.output.match(/```(\w+)?\n([\s\S]*?)\n```/);
        if (codeMatch) {
          const language = codeMatch[1] || "javascript";
          aiMessage = {
            ...aiMessage,
            type: language === "mermaid" ? "file" : "code",
            code: { language, value: codeMatch[2] },
          };
          if (language === "mermaid") {
            setDiagramContent(codeMatch[2]);
            onUpdateDiagram("/src/architecture.mmd", codeMatch[2]);
          }
        }
      } else if (response.output.includes("command executed")) {
        aiMessage = { ...aiMessage, type: "command" };
        updateTerminalHistory([...terminalHistory, input]);
      }

      setMessages((prev) => [...prev, aiMessage]);
      toast({
        title: "AI Response",
        description: "Task completed successfully.",
      });
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : String(error)}`,
        type: "text",
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast({
        title: "Error",
        description: "Failed to process request.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Copy code or diagram to clipboard
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: "Content copied to clipboard." });
  };

  // Insert code into editor
  const handleInsert = (code: string, language: string) => {
    onInsertCode(code, language);
    toast({ title: "Code Inserted", description: "Code inserted into editor." });
  };

  // Apply suggestion to input
  const applySuggestion = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  // Diagram controls
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  const handleResetView = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleDownload = () => {
    if (mermaidRef.current) {
      const svg = mermaidRef.current.innerHTML;
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "architecture-diagram.svg";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded", description: "Diagram saved as SVG." });
    }
  };
  const handleEditDiagram = () => {
    const newPath = activeDiagram?.path || "/src/architecture.mmd";
    onUpdateDiagram(newPath, diagramContent);
    toast({ title: "Diagram Updated", description: `Saved to ${newPath}` });
  };
  const handleUpdateDiagram = () => {
    const projectStructure = fileTree
      .filter((node) => node.type === "folder")
      .map((node) => `  ${node.name} --> ${node.children?.map((child) => child.name).join("|") || "No children"}`)
      .join("\n");
    const newDiagram = `graph TD
  Project --> ${projectStructure || "No folders found"}`;
    setDiagramContent(newDiagram);
    if (activeDiagram) {
      onUpdateDiagram(activeDiagram.path, newDiagram);
    }
    toast({ title: "Diagram Updated", description: "Project structure refreshed." });
  };

  // Render individual message
  const renderMessage = (message: Message, index: number) => {
    return (
      <div
        key={index}
        className={`mb-4 ${message.role === "user" ? "ml-auto" : "mr-auto"} max-w-[80%]`}
      >
        <div
          className={cn(
            "rounded-lg p-3",
            message.role === "user" ? "bg-[#007acc] text-white" : "bg-[#2a2d2e] text-gray-200"
          )}
        >
          {message.type === "code" || message.type === "file" ? (
            <div className="relative">
              <CodeMirror
                value={message.code!.value}
                height="200px"
                theme={vscodeDark}
                extensions={
                  message.code!.language === "python"
                    ? [python()]
                    : message.code!.language === "mermaid"
                    ? [mermaid()]
                    : [javascript()]
                }
                readOnly
                className="rounded-md overflow-hidden"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyCode(message.code!.value)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy {message.type === "file" ? "Diagram" : "Code"}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleInsert(message.code!.value, message.code!.language)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Insert into Editor</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ) : message.type === "command" ? (
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        {message.suggestions && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.suggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-gray-400 border-[#3c3c3c]"
                onClick={() => applySuggestion(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] text-gray-200 font-mono">
      {/* Header */}
      <div className="p-3 border-b border-[#3c3c3c] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-400" />
          <h1 className="text-lg font-semibold">CodeFusion AI</h1>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setMessages([
                    {
                      id: "1",
                      role: "assistant",
                      content:
                        "Welcome to CodeFusion AI! I can help with code generation, debugging, refactoring, terminal commands, and project architecture visualization. Try asking for a component, a command, or a diagram.",
                    },
                  ])
                }
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear Panel</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="bg-[#2a2d2e] border-b border-[#3c3c3c] rounded-none">
          <TabsTrigger value="chat" className="text-gray-300">
            Chat
          </TabsTrigger>
          <TabsTrigger value="agent" className="text-gray-300">
            Agent Mode
          </TabsTrigger>
          <TabsTrigger value="history" className="text-gray-300">
            Task History
          </TabsTrigger>
          <TabsTrigger value="diagram" className="text-gray-300">
            Architecture Diagram
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col m-0">
          <ScrollArea className="flex-1 p-4">
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </ScrollArea>
          <div className="p-4 border-t border-[#3c3c3c] bg-[#2a2d2e]">
            {suggestions.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {suggestions.map((suggestion, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
            <div className="flex items-center">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask for code, debugging, or project analysis..."
                className="flex-1 bg-[#3c3c3c] border-[#3c3c3c] text-white"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading}
                className="ml-2 bg-[#007acc] hover:bg-[#005f99]"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Agent Mode Tab */}
        <TabsContent value="agent" className="flex-1 p-4 m-0">
          <div className="bg-[#2a2d2e] p-4 rounded-lg mb-4">
            <h2 className="font-semibold text-white mb-2">Agent Mode</h2>
            <p className="text-sm text-gray-400">
              Let the AI autonomously handle complex tasks like multi-file refactoring, project setup, or running build scripts.
            </p>
          </div>
          <div className="space-y-4">
            <div className="border border-[#3c3c3c] rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Button
                  variant="outline"
                  className="border-[#3c3c3c] text-gray-300"
                  onClick={() => {
                    setInput("Refactor the current file to improve code quality");
                    handleSend();
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Refactor File
                </Button>
                <Button
                  variant="outline"
                  className="border-[#3c3c3c] text-gray-300"
                  onClick={() => {
                    setInput("Run tests for the current project");
                    handleSend();
                  }}
                >
                  <Terminal className="h-4 w-4 mr-2" />
                  Run Tests
                </Button>
                <Button
                  variant="outline"
                  className="border-[#3c3c3c] text-gray-300"
                  onClick={() => {
                    setInput("Analyze project structure and suggest improvements");
                    handleSend();
                  }}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  Analyze Project
                </Button>
                <Button
                  variant="outline"
                  className="border-[#3c3c3c] text-gray-300"
                  onClick={() => {
                    setInput("Generate a project architecture diagram");
                    handleSend();
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Create Diagram
                </Button>
              </div>
            </div>
            <div className="border border-[#3c3c3c] rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">Custom Agent Task</h3>
              <div className="flex">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe a complex task (e.g., 'Create a new API service')..."
                  className="flex-1 bg-[#3c3c3c] border-[#3c3c3c] text-white"
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="ml-2 bg-[#007acc] hover:bg-[#005f99]"
                >
                  {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Execute"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Task History Tab */}
        <TabsContent value="history" className="flex-1 p-4 m-0">
          <div className="bg-[#2a2d2e] p-4 rounded-lg">
            <h2 className="font-semibold text-white mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Task History
            </h2>
            <p className="text-sm text-gray-400">
              {messages.length > 1
                ? "Your previous AI interactions are listed below."
                : "No tasks in history. Start a conversation to populate this section."}
            </p>
          </div>
          <ScrollArea className="mt-4 flex-1">
            {messages
              .filter((msg) => msg.role === "user")
              .map((msg, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-[#3c3c3c] rounded">
                  <span className="text-sm truncate">{msg.content}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => applySuggestion(msg.content)}
                    className="text-gray-400"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </ScrollArea>
        </TabsContent>

        {/* Architecture Diagram Tab */}
        <TabsContent value="diagram" className="flex-1 p-4 m-0">
          <div className="bg-[#2a2d2e] p-4 rounded-lg mb-4">
            <h2 className="font-semibold text-white mb-2 flex items-center">
              <Folder className="h-4 w-4 mr-2" />
              Architecture Diagram
            </h2>
            <p className="text-sm text-gray-400">
              Visualize your project structure with an interactive Mermaid diagram. Zoom, pan, or export as SVG.
            </p>
          </div>
          <div className="border border-[#3c3c3c] rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium text-white">Diagram Controls</h3>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom In</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom Out</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleResetView}>
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reset View</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleDownload}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download SVG</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleEditDiagram}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Diagram</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleUpdateDiagram}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Update Diagram</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <ScrollArea className="flex-1 h-[calc(100%-100px)]">
              <div
                ref={mermaidRef}
                className="p-4"
                style={{
                  transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`,
                  transformOrigin: "center",
                  cursor: isDragging ? "grabbing" : "grab",
                  transition: isDragging ? "none" : "transform 0.2s",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              {diagramError && (
                <div className="p-4 text-red-500">{diagramError}</div>
              )}
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodeFusionPanel;
