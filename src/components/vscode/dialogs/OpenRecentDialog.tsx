"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { FileSystemDB } from '@/lib/db';
import { useFileManager } from '@/hooks/useFileManager';
import { Folder, Clock } from 'lucide-react';

interface RecentFolder {
    id: string;
    name: string;
    path: string;
    timestamp: number;
}

export function OpenRecentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [recentFolders, setRecentFolders] = useState<RecentFolder[]>([]);
  const db = useRef(new FileSystemDB());
  const { openFolder } = useFileManager();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const loadRecent = async () => {
        try {
          const folders = await db.current.getRecentFolders();
          setRecentFolders(folders);
        } catch (error) {
          toast({ title: "Error", description: "Failed to load recent folders." });
        }
      };
      loadRecent();
    }
  }, [isOpen, toast]);

  const handleOpen = async (folderId: string) => {
    await openFolder(folderId);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center w-full text-left">
            <Folder className="h-4 w-4 mr-2" />
            <span>Open Folder...</span>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-[#252526] border-[#3c3c3c] text-gray-300">
        <DialogHeader>
          <DialogTitle>Open Recent Folder</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-60">
          {recentFolders.length === 0 ? (
            <p className="text-sm text-gray-400 p-4 text-center">No recent folders found.</p>
          ) : (
            recentFolders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center justify-between p-2 hover:bg-[#3c3c3c] rounded cursor-pointer"
                onClick={() => handleOpen(folder.id)}
              >
                <div className='flex items-center'>
                    <Folder className="h-4 w-4 mr-2 text-blue-400" />
                    <span>{folder.name}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(folder.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
