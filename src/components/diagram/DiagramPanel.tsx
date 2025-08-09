"use client";

import * as React from 'react';
import mermaid from 'mermaid';
import { useAppState } from '@/contexts/app-state-context';
import { generateMermaidFromTree } from '@/utils/diagram/generateMermaidFromTree';
import { Toolbar } from './Toolbar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DiagramPanelProps {
  onUpdateDiagram: (path: string, content: string) => void;
}

export function DiagramPanel({ onUpdateDiagram }: DiagramPanelProps) {
  const { state } = useAppState();
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [diagramContent, setDiagramContent] = React.useState<string>('');
  const mermaidRef = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  const activeDiagram = state.aiAssistant.editorTabs.find(
    (tab) => tab.id === state.aiAssistant.activeEditorTab && tab.language === 'mermaid'
  );

  React.useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
  }, []);

  React.useEffect(() => {
    if (activeDiagram) {
      setDiagramContent(activeDiagram.content);
    } else {
      // Fallback content if no diagram is active
      setDiagramContent('graph TD; A[Start] --> B{Is it working?}; B -- Yes --> C[Great!]; B -- No --> D[Check console];');
    }
  }, [state.aiAssistant.activeEditorTab, state.aiAssistant.editorTabs, activeDiagram]);

  React.useEffect(() => {
    const renderDiagram = async () => {
      try {
        if (mermaidRef.current && diagramContent) {
          // Add a unique ID for mermaid to render into
          const diagramId = `mermaid-diagram-${Date.now()}`;
          mermaidRef.current.innerHTML = `<div id="${diagramId}"></div>`;
          const { svg } = await mermaid.render(diagramId, diagramContent);
          if(mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
          setError(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Mermaid rendering error: ${errorMessage}`);
      }
    };
    if (diagramContent) {
        renderDiagram();
    }
  }, [diagramContent]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  const handleResetView = () => { setZoomLevel(1); setPan({ x: 0, y: 0 }); };

  const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); };
  const handleMouseMove = (e: React.MouseEvent) => { if (isDragging) { setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); } };
  const handleMouseUp = () => setIsDragging(false);

  const handleDownload = () => {
    if (mermaidRef.current?.innerHTML) {
      const svg = mermaidRef.current.innerHTML;
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'architecture-diagram.svg';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleEditDiagram = () => {
    const path = activeDiagram?.path || '/src/architecture.mmd';
    onUpdateDiagram(path, diagramContent);
  };

  const handleUpdateDiagram = () => {
    // This function is now a placeholder as fileTree is not available.
    // In a real implementation, you might fetch project structure from a server
    // or have another way to access it.
    console.log("Updating diagram based on current project structure is not implemented.");
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] text-gray-300">
      <div className="p-2 font-semibold border-b border-[#3c3c3c] flex items-center justify-between">
        <span>ARCHITECTURE DIAGRAM</span>
        <Toolbar onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onResetView={handleResetView} onDownload={handleDownload} onEditDiagram={handleEditDiagram} onUpdateDiagram={handleUpdateDiagram} />
      </div>
      <ScrollArea className="flex-1">
        <div
          className="p-4 flex justify-center items-center min-h-full"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
            <div
                ref={mermaidRef}
                style={{ transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`, transition: 'transform 0.2s' }}
            />
        </div>
        {error && <div className="p-4 text-red-500">{error}</div>}
      </ScrollArea>
    </div>
  );
}
