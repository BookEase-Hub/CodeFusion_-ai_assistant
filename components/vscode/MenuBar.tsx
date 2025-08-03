"use client"

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface MenuBarProps {
  onOpenFolder: () => void;
}

export function MenuBar({ onOpenFolder }: MenuBarProps) {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: "Action Triggered",
      description: `${action}`,
    });
  };

  return (
    <div className="h-8 bg-[#333333] text-gray-300 flex items-center px-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-full px-3 text-sm rounded-none">File</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#252526] border-[#3c3c3c] text-gray-300">
          <DropdownMenuItem onClick={() => handleAction("New File")}>New File</DropdownMenuItem>
          <DropdownMenuItem onClick={onOpenFolder}>Open Folder...</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleAction("Save")}>Save</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("Save As...")}>Save As...</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleAction("Exit")}>Exit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-full px-3 text-sm rounded-none">Edit</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#252526] border-[#3c3c3c] text-gray-300">
          <DropdownMenuItem onClick={() => handleAction("Undo")}>Undo</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("Redo")}>Redo</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleAction("Cut")}>Cut</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("Copy")}>Copy</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("Paste")}>Paste</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-full px-3 text-sm rounded-none">View</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#252526] border-[#3c3c3c] text-gray-300">
          <DropdownMenuItem onClick={() => handleAction("Toggle Explorer")}>Toggle Explorer</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("Toggle Panel")}>Toggle Panel</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
