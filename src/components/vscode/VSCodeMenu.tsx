"use client";

import React, { useState, useRef } from 'react';
import {
  Copy, Sparkles, FileCode2, FileIcon, Plus, PlusSquare, Folder, FolderPlus, Settings, Save, X,
  RefreshCw, ToggleRight, RotateCcw, RotateCw, Scissors, Clipboard, Search, Replace, Command,
  Layout, ArrowLeft, ArrowRight, Play, Bug, Square, StepForward, ArrowUp, ArrowDown, Terminal,
  Trash2, Info, BookOpen, FolderMinus, MoreHorizontal, Clock, FileText, Split, Maximize2,
  ChevronDown, ChevronRight, AlertCircle, AlertTriangle, Package, ZoomIn, ZoomOut, Download,
  GitBranch, Upload, GitCommit, GitMerge, GitPullRequest, FilePlus, FolderOpen, History,
  Lock, Unlock, Star, Eye, EyeOff, Palette, DownloadCloud, UploadCloud, Link, Unlink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuCheckboxItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { OpenRecentDialog } from './dialogs/OpenRecentDialog';
import { cn } from "@/lib/utils";

interface MenuItem {
    label: string;
    component?: React.ReactNode;
    shortcut?: string;
    icon?: React.ElementType;
    action?: () => void;
    submenu?: MenuItem[];
    divider?: boolean;
    disabled?: boolean;
    checked?: boolean;
  }

  interface MenuCategory {
    label: string;
    items: MenuItem[];
  }

  interface VSCodeMenuProps {
    onNewFile: () => void;
    onOpenFile: () => void;
    onSave: () => void;
    onSaveAsFolder: () => void;
    onCloseFolder: () => void;
  }

export function VSCodeMenu({ onNewFile, onOpenFile, onSave, onSaveAsFolder, onCloseFolder }: VSCodeMenuProps) {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const menuData: MenuCategory[] = [
      {
        label: "File",
        items: [
          { label: "New File", shortcut: "Ctrl+N", icon: Plus, action: onNewFile },
          { label: "Open File...", shortcut: "Ctrl+O", icon: FileIcon, action: onOpenFile },
          { label: "Open Folder...", component: <OpenRecentDialog /> },
          { label: "Close Folder", icon: FolderMinus, action: onCloseFolder },
          { divider: true },
          { label: "Save", shortcut: "Ctrl+S", icon: Save, action: onSave },
          { label: "Save As Folder...", icon: Save, action: onSaveAsFolder },
          { divider: true },
          { label: "Exit" },
        ],
      },
      {
        label: "Edit",
        items: [
            { label: "Undo", shortcut: "Ctrl+Z", icon: RotateCcw },
            { label: "Redo", shortcut: "Ctrl+Y", icon: RotateCw },
            { divider: true },
            { label: "Cut", shortcut: "Ctrl+X", icon: Scissors },
            { label: "Copy", shortcut: "Ctrl+C", icon: Copy },
            { label: "Paste", shortcut: "Ctrl+V", icon: Clipboard },
        ],
      },
      {
        label: "View",
        items: [
            { label: "Command Palette", shortcut: "Ctrl+Shift+P", icon: Command },
            { label: "Explorer", shortcut: "Ctrl+Shift+E" },
        ],
      },
      // Add other menus like Selection, Go, Run, Terminal, Help as needed
    ];

    const renderMenuItem = (item: MenuItem, index: number) => {
      if (item.divider) {
        return <DropdownMenuSeparator key={`divider-${index}`} />;
      }

      if (item.submenu) {
        return (
            <DropdownMenuSub key={item.label}>
            <DropdownMenuSubTrigger>
              {item.icon && <item.icon className="h-4 w-4 mr-2" />}
              <span>{item.label}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {item.submenu.map(renderMenuItem)}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        );
      }

      if (item.component) {
        return <DropdownMenuItem key={item.label} asChild>{item.component}</DropdownMenuItem>
      }

      return (
        <DropdownMenuItem key={item.label} onClick={item.action} disabled={item.disabled}>
            {item.icon && <item.icon className="h-4 w-4 mr-2" />}
            <span>{item.label}</span>
            {item.shortcut && <span className="ml-auto text-xs tracking-widest text-muted-foreground">{item.shortcut}</span>}
        </DropdownMenuItem>
      );
    };

    return (
      <div className="flex h-8 items-center text-sm px-2 border-b bg-[#333333] text-gray-300">
        {menuData.map((category) => (
          <DropdownMenu key={category.label}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 rounded-none hover:bg-[#3c3c3c]">
                {category.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#252526] border-[#3c3c3c] text-gray-300">
              {category.items.map(renderMenuItem)}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
    );
  }
