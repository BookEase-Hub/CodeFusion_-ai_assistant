"use client";

import * as React from 'react';
import { ZoomIn, ZoomOut, Maximize2, Download, Edit, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onDownload: () => void;
  onEditDiagram: () => void;
  onUpdateDiagram: () => void;
}

export function Toolbar({
  onZoomIn,
  onZoomOut,
  onResetView,
  onDownload,
  onEditDiagram,
  onUpdateDiagram,
}: ToolbarProps) {
  return (
    <div className="flex gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onZoomIn}><ZoomIn className="h-4 w-4" /></Button></TooltipTrigger>
          <TooltipContent><p>Zoom In</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onZoomOut}><ZoomOut className="h-4 w-4" /></Button></TooltipTrigger>
          <TooltipContent><p>Zoom Out</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onResetView}><Maximize2 className="h-4 w-4" /></Button></TooltipTrigger>
          <TooltipContent><p>Reset View</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onDownload}><Download className="h-4 w-4" /></Button></TooltipTrigger>
          <TooltipContent><p>Download SVG</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onEditDiagram}><Edit className="h-4 w-4" /></Button></TooltipTrigger>
          <TooltipContent><p>Edit Diagram</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onUpdateDiagram}><RefreshCw className="h-4 w-4" /></Button></TooltipTrigger>
          <TooltipContent><p>Update Diagram</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
