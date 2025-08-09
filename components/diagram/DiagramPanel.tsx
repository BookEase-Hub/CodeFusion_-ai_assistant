"use client";

import * as React from 'react';
import mermaid from 'mermaid';
import { useAIStore } from '@/store/ai';
import { generateMermaidFromTree } from '@/utils/diagram/generateMermaidFromTree';
import { Toolbar } from './Toolbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileNode } from '@/types/ai';

interface DiagramPanelProps {
  onUpdateDiagram: (path: string, content: string) => void;
}

export function DiagramPanel({ onUpdateDiagram }: DiagramPanelProps) {
  const { editorTabs, activeEditorTab, currentProject } = useAIStore();
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [diagramContent, setDiagramContent] = React.useState<string>('');
  const mermaidRef = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  const activeDiagram = editorTabs.find(
    (tab) => tab.id === activeEditorTab && tab.language === 'mermaid'
  );

  React.useEffect(() => {
    if (activeDiagram) {
      setDiagramContent(activeDiagram.content);
    } else {
      if (currentProject) {
        const projectStructure = generateMermaidFromTree(currentProject.files as FileNode[]);
        setDiagramContent(projectStructure);
      }
    }
  }, [activeEditorTab, editorTabs, activeDiagram, currentProject]);

  React.useEffect(() => {
    const renderDiagram = async () => {
      try {
        if (mermaidRef.current && diagramContent) {
          mermaidRef.current.innerHTML = ""; // Clear previous diagram
          const { svg } = await mermaid.render('architecture-diagram', diagramContent);
          mermaidRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (err) {
        setError(`Mermaid rendering error: ${(err as Error).message}`);
      }
    };
    renderDiagram();
  }, [diagramContent]);

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
    if (activeDiagram) {
        if(activeDiagram.path) {
            onUpdateDiagram(activeDiagram.path, diagramContent);
        }
    } else {
      const newPath = '/src/architecture.mmd';
      onUpdateDiagram(newPath, diagramContent);
    }
  };

  const handleUpdateDiagram = () => {
    if(currentProject) {
        const projectStructure = generateMermaidFromTree(currentProject.files as FileNode[]);
        const newDiagram = projectStructure;
        setDiagramContent(newDiagram);
        if (activeDiagram) {
            if(activeDiagram.path) {
                onUpdateDiagram(activeDiagram.path, newDiagram);
            }
        }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] text-gray-300">
      <div className="p-2 font-semibold border-b border-[#3c3c3c] flex items-center justify-between">
        <span>ARCHITECTURE DIAGRAM</span>
        <Toolbar
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
          onDownload={handleDownload}
          onEditDiagram={handleEditDiagram}
          onUpdateDiagram={handleUpdateDiagram}
        />
      </div>
      <ScrollArea className="flex-1">
        <div
          ref={mermaidRef}
          className="p-4"
          style={{
            transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: isDragging ? 'none' : 'transform 0.2s',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        {error && (
          <div className="p-4 text-red-500">
            {error}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
