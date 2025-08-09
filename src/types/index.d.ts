export interface FileTreeItem {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  children?: FileTreeItem[];
  isOpen?: boolean;
  language?: string;
  version?: number;
  history?: { content: string; timestamp: string }[];
  isLocked?: boolean;
  isStarred?: boolean;
}

export interface EditorTab {
  id: string;
  name: string;
  content: string;
  language?: string;
  path?: string;
  isDirty?: boolean;
  version?: number;
  isLocked?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  code?: { language: string; value: string };
  suggestions?: string[];
  problems?: AIProblem[];
}

export interface AIProblem {
  id: string;
  type: "error" | "warning" | "info";
  message: string;
  file: string;
  line: number;
}

// This is the same as FileTreeItem, but was named FileNode in some provided snippets.
// Using a single type for consistency.
export type FileNode = FileTreeItem;
