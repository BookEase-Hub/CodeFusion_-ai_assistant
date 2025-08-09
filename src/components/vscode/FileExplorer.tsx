"use client";

import React, { useState, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Folder, FolderPlus, RefreshCw, ChevronDown, ChevronRight, FilePlus, History } from "lucide-react";
import { FileTreeItem } from '@/types';
import { useAppState } from '@/contexts/app-state-context';
import { useFileManager } from '@/hooks/useFileManager';


const FileExplorerItemComponent = ({
    item,
    level,
    onFileSelect,
    onMoveItem,
  }: {
    item: FileTreeItem;
    level: number;
    onFileSelect: (path: string, type: 'file' | 'folder') => void;
    onMoveItem: (sourcePath: string, targetPath: string) => void;
    onShowHistory: (path: string) => void;
  }) => {

    const ref = useRef<HTMLDivElement>(null);
    const { dispatch } = useAppState();

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'item', // Generic type for both file and folder
        item: { path: item.path },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'item',
        drop: (draggedItem: { path: string }) => {
            if (item.type === 'folder' && item.path !== draggedItem.path) {
                onMoveItem(draggedItem.path, item.path);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver() && monitor.canDrop(),
        }),
    }));

    drag(drop(ref));

    const toggleFolder = () => {
        // This is a simplified toggle for now
        // A real implementation would dispatch an action to update the fileTree state
        item.isOpen = !item.isOpen;
    }

    const handleSelect = () => {
        if (item.type === 'folder') {
            toggleFolder();
        }
        onFileSelect(item.path, item.type);
    }

    return (
      <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }} className={isOver ? 'bg-gray-600 rounded-sm' : ''}>
        <div
          style={{ paddingLeft: `${level * 16}px` }}
          className="flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer rounded-sm"
          onClick={handleSelect}
        >
          {item.type === "folder" ? (
            <>
              {item.isOpen ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
              <Folder className="h-4 w-4 mr-1 text-blue-400" />
            </>
          ) : (
            <FileText className="h-4 w-4 mr-1 text-gray-400" />
          )}
          <span>{item.name}</span>
            <div className="ml-auto">
                {item.type === 'file' && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); onShowHistory(item.path); }}>
                                    <History className="h-3 w-3" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Show History</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </div>
        {item.isOpen && item.children && (
            <div>
                {item.children.map(child => (
                    <FileExplorerItemComponent
                        key={child.id}
                        item={child}
                        level={level + 1}
                        onFileSelect={onFileSelect}
                        onMoveItem={onMoveItem}
                        onShowHistory={onShowHistory}
                    />
                ))}
            </div>
        )}
      </div>
    );
};

interface FileExplorerProps {
    onFileSelect: (path: string) => void;
    onShowHistory: (path: string) => void;
}

export function FileExplorer({ onFileSelect, onShowHistory }: FileExplorerProps) {
  const { state: { fileTree }, dispatch } = useAppState();
  const { loadFileTree, createFolder, moveItem } = useFileManager();

  useEffect(() => {
    loadFileTree();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewFolder = () => {
    const folderName = prompt("Enter new folder name:");
    if (folderName) {
        createFolder(folderName);
    }
  };

  const handleFileClick = (path: string, type: 'file' | 'folder') => {
    if (type === 'file') {
        onFileSelect(path);
    }
  };

  const renderFileTree = (items: FileTreeItem[], level = 0) => {
    return items.map(item => (
        <FileExplorerItemComponent
            key={item.id}
            item={item}
            level={level}
            onFileSelect={handleFileClick}
            onMoveItem={moveItem}
            onShowHistory={onShowHistory}
        />
    ));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full bg-[#252526] text-gray-300 text-sm flex flex-col">
        <div className="p-2 font-semibold border-b border-[#3c3c3c] flex items-center justify-between">
          <span>EXPLORER</span>
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><FilePlus className="h-4 w-4" /></Button></TooltipTrigger>
                <TooltipContent><p>New File</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNewFolder}><FolderPlus className="h-4 w-4" /></Button></TooltipTrigger>
                <TooltipContent><p>New Folder</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" onClick={loadFileTree}><RefreshCw className="h-4 w-4" /></Button></TooltipTrigger>
                <TooltipContent><p>Refresh Explorer</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-1">
            {renderFileTree(fileTree)}
          </div>
        </ScrollArea>
      </div>
    </DndProvider>
  );
}
