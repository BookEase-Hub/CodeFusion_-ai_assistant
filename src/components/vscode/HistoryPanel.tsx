"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";

interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    filePath: string;
    history: { content: string; timestamp: string }[];
    onRestore: (content: string) => void;
}

export function HistoryPanel({ isOpen, onClose, filePath, history, onRestore }: HistoryPanelProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-[#252526] border-[#3c3c3c] text-gray-300">
        <DialogHeader>
          <DialogTitle>File History: {filePath}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          {history.length === 0 ? (
            <div className="text-gray-500 p-4">No version history available.</div>
          ) : (
            history.map((entry, index) => (
              <div key={index} className="p-2 border-b border-[#3c3c3c]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Version {history.length - index} ({new Date(entry.timestamp).toLocaleString()})</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRestore(entry.content)}
                  >
                    Restore
                  </Button>
                </div>
                <CodeMirror
                  value={entry.content}
                  extensions={[javascript({ jsx: true })]}
                  theme={vscodeDark}
                  height="200px"
                  readOnly
                />
              </div>
            ))
          )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
