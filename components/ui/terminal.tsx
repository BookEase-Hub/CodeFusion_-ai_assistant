"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, X, Terminal as TerminalIcon } from 'lucide-react';
import { useAppState } from '@/contexts/app-state-context';
import { FileNode as FileTreeItem } from '@/contexts/app-state-context';
import { cn } from '@/lib/utils';

// Terminal state interface
interface TerminalState {
  id: string;
  name: string;
  history: TerminalEntry[];
  currentDir: string;
  env: Record<string, string>;
  isRunning: boolean;
  activeCommand: string | null;
}

interface TerminalEntry {
  id: string;
  content: string;
  type: 'command' | 'output' | 'error';
  timestamp: string;
}

// Command parser interface
interface ParsedCommand {
  command: string;
  args: string[];
  pipe?: ParsedCommand;
  redirect?: { type: '>' | '>>'; file: string };
}

// Mock Git status response
const mockGitStatus = `
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
\tmodified:   src/App.tsx

Untracked files:
  (use "git add <file>..." to include in what will be committed)
\tnew-file.txt

no changes added to commit (use "git add" and/or "git commit -m")
`;

// Mock npm start output (simulated streaming)
const mockNpmStartOutput = [
  'Starting the development server...',
  'Compiled successfully!',
  '',
  'You can now view codefusion-project in the browser.',
  '  Local:            http://localhost:3000',
  '  On Your Network:  http://192.168.1.100:3000',
  '',
  'Note that the development build is not optimized.',
  'To create a production build, use npm run build.',
];

// Helper to find a file/folder in the file tree
const findNode = (nodes: FileTreeItem[], path: string): FileTreeItem | null => {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.type === 'folder' && node.children) {
      const found = findNode(node.children, path);
      if (found) return found;
    }
  }
  return null;
};

// Helper to resolve a path relative to the current directory
const resolvePath = (currentDir: string, inputPath: string): string => {
  if (inputPath.startsWith('/')) return inputPath;
  if (inputPath === '.') return currentDir;
  if (inputPath === '..') {
    const parts = currentDir.split('/').filter(Boolean);
    parts.pop();
    return parts.length ? `/${parts.join('/')}` : '/';
  }
  return `${currentDir === '/' ? '' : currentDir}/${inputPath}`;
};

// Parse command string into command, args, pipe, and redirect
const parseCommand = (cmd: string): ParsedCommand => {
  const parts = cmd.trim().split(/\s+/);
  let command = parts[0] || '';
  let args = parts.slice(1);
  let pipe: ParsedCommand | undefined;
  let redirect: { type: '>' | '>>'; file: string } | undefined;

  const pipeIndex = args.indexOf('|');
  if (pipeIndex !== -1) {
    const pipeCmd = args.slice(pipeIndex + 1).join(' ');
    args = args.slice(0, pipeIndex);
    pipe = parseCommand(pipeCmd);
  }

  const redirectIndex = args.findIndex((arg) => arg === '>' || arg === '>>');
  if (redirectIndex !== -1) {
    redirect = { type: args[redirectIndex] as '>' | '>>', file: args[redirectIndex + 1] };
    args = args.slice(0, redirectIndex);
  }

  return { command, args, pipe, redirect };
};

export function TerminalComponent({ onNewFile, onNewFolder }: { onNewFile: (path: string, content: string) => void; onNewFolder: (path: string) => void }) {
  const { state: { currentProject }, updateProject } = useAppState();
  const [terminals, setTerminals] = useState<TerminalState[]>([
    {
      id: `terminal-${Date.now()}`,
      name: 'Terminal 1',
      history: [{ id: `entry-${Date.now()}`, content: 'Welcome to CodeFusion Terminal', type: 'output', timestamp: new Date().toISOString() }],
      currentDir: '/src',
      env: { PATH: '/bin:/usr/bin', HOME: '/home/user' },
      isRunning: false,
      activeCommand: null,
    },
  ]);
  const [activeTerminalId, setActiveTerminalId] = useState(terminals[0].id);
  const terminalRefs = useRef<Map<string, Terminal>>(new Map());
  const fitAddons = useRef<Map<string, FitAddon>>(new Map());
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const [commandInput, setCommandInput] = useState<string>('');
  const [historyIndex, setHistoryIndex] = useState<Map<string, number>>(new Map());
  const [commandHistory, setCommandHistory] = useState<Map<string, string[]>>(new Map());
  const [isStreaming, setIsStreaming] = useState<Map<string, boolean>>(new Map());

  // Initialize xterm.js for each terminal
  useEffect(() => {
    terminals.forEach((term) => {
      if (!terminalRefs.current.has(term.id)) {
        const xterm = new Terminal({
          theme: { background: '#1e1e1e', foreground: '#d4d4d4', cursor: '#d4d4d4' },
          fontFamily: 'Fira Code, monospace',
          fontSize: 14,
          cursorBlink: true,
        });
        const fitAddon = new FitAddon();
        xterm.loadAddon(fitAddon);
        terminalRefs.current.set(term.id, xterm);
        fitAddons.current.set(term.id, fitAddon);

        const container = document.getElementById(`terminal-${term.id}`);
        if (container) {
          xterm.open(container);
          fitAddon.fit();
          (xterm as any).write('');
          term.history.forEach((entry) => {
            xterm.writeln(`${entry.type === 'command' ? '$ ' : ''}${entry.content}`);
          });
        }

        xterm.onData((data) => {
          if (data === '\r') {
            handleCommandSubmit(term.id);
          } else if (data === '\x7f') {
            setCommandInput((prev) => prev.slice(0, -1));
            (xterm as any).write('');
            (xterm as any).write('$ ' + commandInput.slice(0, -1));
          } else {
            setCommandInput((prev) => prev + data);
            xterm.write(data);
          }
        });
      }
    });

    // Cleanup
    const terminalRefsForCleanup = terminalRefs.current;
    const fitAddonsForCleanup = fitAddons.current;
    return () => {
      terminals.forEach((term) => {
        const xterm = terminalRefsForCleanup.get(term.id);
        if (xterm) {
          xterm.dispose();
          terminalRefsForCleanup.delete(term.id);
          fitAddonsForCleanup.delete(term.id);
        }
      });
    };
  }, [terminals, commandInput, handleCommandSubmit]);

  // Resize terminals on window resize
  useEffect(() => {
    const handleResize = () => {
      fitAddons.current.forEach((fitAddon) => fitAddon.fit());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load command history from localStorage
  useEffect(() => {
    terminals.forEach((term) => {
      const savedHistory = localStorage.getItem(`terminal-history-${term.id}`);
      if (savedHistory) {
        setCommandHistory((prev) => new Map(prev.set(term.id, JSON.parse(savedHistory))));
      }
    });
  }, [terminals]);

  // Focus input on active terminal change
  useEffect(() => {
    const input = inputRefs.current.get(activeTerminalId);
    if (input) input.focus();
  }, [activeTerminalId]);

  // Simulate streaming output for long-running commands
  const simulateStreamingOutput = useCallback((terminalId: string, outputs: string[], interval = 500) => {
    setIsStreaming((prev) => new Map(prev.set(terminalId, true)));
    let index = 0;
    const timer = setInterval(() => {
      if (index < outputs.length) {
        appendToHistory(terminalId, outputs[index], 'output');
        index++;
      } else {
        setIsStreaming((prev) => new Map(prev.set(terminalId, false)));
        clearInterval(timer);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [appendToHistory]);

  // Append to terminal history
  const appendToHistory = useCallback((terminalId: string, content: string, type: TerminalEntry['type']) => {
    setTerminals((prev) =>
      prev.map((term) =>
        term.id === terminalId
          ? {
              ...term,
              history: [
                ...term.history,
                { id: `entry-${Date.now()}-${Math.random()}`, content, type, timestamp: new Date().toISOString() },
              ],
            }
          : term,
      ),
    );
    const xterm = terminalRefs.current.get(terminalId);
    if (xterm) {
      xterm.writeln(`${type === 'command' ? '$ ' : ''}${content}`);
      xterm.scrollToBottom();
    }
  }, []);

  // Execute parsed command
  const executeCommand = useCallback(
    (terminalId: string, parsedCmd: ParsedCommand) => {
      const term = terminals.find((t) => t.id === terminalId);
      if (!term || !currentProject) return;

      setTerminals((prev) =>
        prev.map((t) => (t.id === terminalId ? { ...t, isRunning: true, activeCommand: parsedCmd.command } : t)),
      );

      try {
        let output = '';
        switch (parsedCmd.command.toLowerCase()) {
          case 'help':
            output = `
Available commands:
  cat <file>        - Display file contents
  cd <dir>          - Change directory
  clear             - Clear terminal
  cp <src> <dest>   - Copy file or folder
  date              - Show current date
  echo <message>    - Echo message
  grep <pattern> <file> - Search pattern in file
  ls                - List directory contents
  mkdir <dir>       - Create directory
  mv <src> <dest>   - Move or rename file/folder
  npm start         - Start development server
  pwd               - Print working directory
  rm <path>         - Remove file or folder
  touch <file>      - Create empty file
            `;
            appendToHistory(terminalId, output, 'output');
            break;

          case 'clear':
            setTerminals((prev) =>
              prev.map((t) =>
                t.id === terminalId ? { ...t, history: [] } : t,
              ),
            );
            const xterm = terminalRefs.current.get(terminalId);
            if (xterm) xterm.clear();
            break;

          case 'ls':
            const dirNode = findNode(currentProject.files, term.currentDir);
            output = dirNode?.children?.map((node) => node.name).join('\n') || '';
            appendToHistory(terminalId, output || 'dir empty', 'output');
            break;

          case 'pwd':
            output = term.currentDir;
            appendToHistory(terminalId, output, 'output');
            break;

          case 'echo':
            output = parsedCmd.args.join(' ');
            appendToHistory(terminalId, output, 'output');
            break;

          case 'date':
            output = new Date().toLocaleString();
            appendToHistory(terminalId, output, 'output');
            break;

          case 'mkdir':
            if (!parsedCmd.args[0]) throw new Error('mkdir: missing directory name');
            const newDirPath = resolvePath(term.currentDir, parsedCmd.args[0]);
            if (findNode(currentProject.files, newDirPath)) throw new Error(`mkdir: ${newDirPath}: Directory exists`);
            onNewFolder(newDirPath);
            appendToHistory(terminalId, `Created directory: ${newDirPath}`, 'output');
            break;

          case 'touch':
            if (!parsedCmd.args[0]) throw new Error('touch: missing file name');
            const newFilePath = resolvePath(term.currentDir, parsedCmd.args[0]);
            if (findNode(currentProject.files, newFilePath)) throw new Error(`touch: ${newFilePath}: File exists`);
            onNewFile(newFilePath, '');
            appendToHistory(terminalId, `Created file: ${newFilePath}`, 'output');
            break;

          case 'cd':
            const targetDir = parsedCmd.args[0] ? resolvePath(term.currentDir, parsedCmd.args[0]) : term.env.HOME;
            const dir = findNode(currentProject.files, targetDir);
            if (!dir || dir.type !== 'folder') throw new Error(`cd: ${targetDir}: No such directory`);
            setTerminals((prev) =>
              prev.map((t) => (t.id === terminalId ? { ...t, currentDir: targetDir } : t)),
            );
            appendToHistory(terminalId, `Changed directory to ${targetDir}`, 'output');
            break;

          case 'rm':
            if (!parsedCmd.args[0]) throw new Error('rm: missing path');
            const rmPath = resolvePath(term.currentDir, parsedCmd.args[0]);
            const rmNode = findNode(currentProject.files, rmPath);
            if (!rmNode) throw new Error(`rm: ${rmPath}: No such file or directory`);
            if (rmNode.type === 'folder' && rmNode.children?.length && !parsedCmd.args.includes('-r')) {
              throw new Error(`rm: ${rmPath}: Directory not empty. Use -r to remove recursively`);
            }
            const removeNode = (nodes: FileTreeItem[]): FileTreeItem[] =>
              nodes.filter((node) => {
                if (node.path === rmPath) return false;
                if (node.type === 'folder' && node.children) {
                  node.children = removeNode(node.children);
                }
                return true;
              });
            updateProject({ ...currentProject, files: removeNode(currentProject.files) });
            appendToHistory(terminalId, `Removed ${rmPath}`, 'output');
            break;

          case 'mv':
            if (parsedCmd.args.length < 2) throw new Error('mv: missing source or destination');
            const srcPath = resolvePath(term.currentDir, parsedCmd.args[0]);
            const destPath = resolvePath(term.currentDir, parsedCmd.args[1]);
            const srcNode = findNode(currentProject.files, srcPath);
            if (!srcNode) throw new Error(`mv: ${srcPath}: No such file or directory`);
            if (findNode(currentProject.files, destPath)) throw new Error(`mv: ${destPath}: Destination exists`);
            const moveNode = (nodes: FileTreeItem[]): FileTreeItem[] =>
              nodes.map((node) => {
                if (node.path === srcPath) {
                  return { ...node, path: destPath, name: destPath.split('/').pop()! };
                }
                if (node.type === 'folder' && node.children) {
                  node.children = moveNode(node.children);
                }
                return node;
              });
            updateProject({ ...currentProject, files: moveNode(currentProject.files) });
            appendToHistory(terminalId, `Moved ${srcPath} to ${destPath}`, 'output');
            break;

          case 'cp':
            if (parsedCmd.args.length < 2) throw new Error('cp: missing source or destination');
            const cpSrcPath = resolvePath(term.currentDir, parsedCmd.args[0]);
            const cpDestPath = resolvePath(term.currentDir, parsedCmd.args[1]);
            const cpSrcNode = findNode(currentProject.files, cpSrcPath);
            if (!cpSrcNode) throw new Error(`cp: ${cpSrcPath}: No such file or directory`);
            if (findNode(currentProject.files, cpDestPath)) throw new Error(`cp: ${cpDestPath}: Destination exists`);
            const copyNode = (node: FileTreeItem): FileTreeItem => ({
              ...node,
              id: `${node.id}-copy-${Date.now()}`,
              path: cpDestPath,
              name: cpDestPath.split('/').pop()!,
              children: node.children ? node.children.map(copyNode) : undefined,
            });
            const addNode = (nodes: FileTreeItem[], destPath: string, newNode: FileTreeItem): FileTreeItem[] => {
              const parts = destPath.split('/').filter(Boolean);
              const parentPath = parts.length > 1 ? `/${parts.slice(0, -1).join('/')}` : '/';
              return nodes.map((node) => {
                if (node.path === parentPath && node.type === 'folder') {
                  return { ...node, children: [...(node.children || []), newNode] };
                }
                if (node.type === 'folder' && node.children) {
                  return { ...node, children: addNode(node.children, destPath, newNode) };
                }
                return node;
              });
            };
            updateProject({ ...currentProject, files: addNode(currentProject.files, cpDestPath, copyNode(cpSrcNode)) });
            appendToHistory(terminalId, `Copied ${cpSrcPath} to ${cpDestPath}`, 'output');
            break;

          case 'cat':
            if (!parsedCmd.args[0]) throw new Error('cat: missing file');
            const catPath = resolvePath(term.currentDir, parsedCmd.args[0]);
            const catNode = findNode(currentProject.files, catPath);
            if (!catNode || catNode.type !== 'file') throw new Error(`cat: ${catPath}: No such file or not a file`);
            output = catNode.content || '';
            appendToHistory(terminalId, output, 'output');
            break;

          case 'grep':
            if (parsedCmd.args.length < 2) throw new Error('grep: missing pattern or file');
            const pattern = parsedCmd.args[0];
            const grepPath = resolvePath(term.currentDir, parsedCmd.args[1]);
            const grepNode = findNode(currentProject.files, grepPath);
            if (!grepNode || grepNode.type !== 'file') throw new Error(`grep: ${grepPath}: No such file or not a file`);
            const regex = new RegExp(pattern, 'g');
            output = grepNode.content
              ?.split('\n')
              .filter((line) => regex.test(line))
              .join('\n') || '';
            appendToHistory(terminalId, output || 'No matches found', 'output');
            break;

          case 'npm':
            if (parsedCmd.args[0] === 'start') {
              simulateStreamingOutput(terminalId, mockNpmStartOutput);
            } else {
              throw new Error(`npm: unknown command ${parsedCmd.args.join(' ')}`);
            }
            break;

          case 'git':
            if (parsedCmd.args[0] === 'status') {
              appendToHistory(terminalId, mockGitStatus, 'output');
            } else {
              throw new Error(`git: unknown command ${parsedCmd.args.join(' ')}`);
            }
            break;

          default:
            throw new Error(`Command not found: ${parsedCmd.command}`);
        }

        // Handle piping
        if (parsedCmd.pipe) {
          // Simulate piping by passing output to the next command
          const pipeOutput = output;
          const nextCmd = { ...parsedCmd.pipe, args: [pipeOutput, ...parsedCmd.pipe.args] };
          executeCommand(terminalId, nextCmd);
        }

        // Handle redirection
        if (parsedCmd.redirect && output) {
          const redirectPath = resolvePath(term.currentDir, parsedCmd.redirect.file);
          const redirectNode = findNode(currentProject.files, redirectPath);
          if (redirectNode && redirectNode.type !== 'file') {
            throw new Error(`Redirect: ${redirectPath}: Not a file`);
          }
          if (parsedCmd.redirect.type === '>') {
            onNewFile(redirectPath, output);
          } else {
            const existingContent = redirectNode?.content || '';
            onNewFile(redirectPath, existingContent + '\n' + output);
          }
          appendToHistory(terminalId, `Redirected output to ${redirectPath}`, 'output');
        }
      } catch (error) {
        appendToHistory(terminalId, `Error: ${(error as Error).message}`, 'error');
      } finally {
        setTerminals((prev) =>
          prev.map((t) => (t.id === terminalId ? { ...t, isRunning: false, activeCommand: null } : t)),
        );
      }
    },
    [terminals, currentProject, onNewFile, onNewFolder, updateProject, simulateStreamingOutput, appendToHistory],
  );

  // Handle command submission
  const handleCommandSubmit = useCallback(
    (terminalId: string) => {
      const term = terminals.find((t) => t.id === terminalId);
      if (!term || !currentProject) return;

      const cmd = commandInput.trim();
      if (!cmd) {
        (terminalRefs.current.get(terminalId) as any)?.write('');
        (terminalRefs.current.get(terminalId) as any)?.write('$ ');
        return;
      }

      appendToHistory(terminalId, cmd, 'command');
      setCommandHistory((prev) => {
        const history = prev.get(terminalId) || [];
        const newHistory = [...history, cmd].slice(-50);
        localStorage.setItem(`terminal-history-${terminalId}`, JSON.stringify(newHistory));
        return new Map(prev.set(terminalId, newHistory));
      });
      setHistoryIndex((prev) => new Map(prev.set(terminalId, (commandHistory.get(terminalId)?.length || 0))));
      setCommandInput('');

      const parsedCmd = parseCommand(cmd);
      executeCommand(terminalId, parsedCmd);

      const xterm = terminalRefs.current.get(terminalId);
      if (xterm) {
        (xterm as any).write('');
        (xterm as any).write('$ ');
      }
    },
    [commandInput, terminals, currentProject, commandHistory, executeCommand, appendToHistory],
  );

  // Handle keyboard navigation for command history
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, terminalId: string) => {
      const term = terminals.find((t) => t.id === terminalId);
      if(!term) return;
      const history = commandHistory.get(terminalId) || [];
      const currentIndex = historyIndex.get(terminalId) || history.length;

      if (e.key === 'Enter') {
        handleCommandSubmit(terminalId);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          const prevIndex = currentIndex - 1;
          setCommandInput(history[prevIndex]);
          setHistoryIndex((prev) => new Map(prev.set(terminalId, prevIndex)));
          const xterm = terminalRefs.current.get(terminalId);
          if (xterm) {
            xterm.clear();
            term.history.forEach((entry) => xterm.writeln(`${entry.type === 'command' ? '$ ' : ''}${entry.content}`));
            (xterm as any).write('');
            (xterm as any).write('$ ' + history[prevIndex]);
          }
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < history.length - 1) {
          const nextIndex = currentIndex + 1;
          setCommandInput(history[nextIndex]);
          setHistoryIndex((prev) => new Map(prev.set(terminalId, nextIndex)));
          const xterm = terminalRefs.current.get(terminalId);
          if (xterm) {
            xterm.clear();
            term.history.forEach((entry) => xterm.writeln(`${entry.type === 'command' ? '$ ' : ''}${entry.content}`));
            (xterm as any).write('');
            (xterm as any).write('$ ' + history[nextIndex]);
          }
        } else if (currentIndex === history.length - 1) {
          setCommandInput('');
          setHistoryIndex((prev) => new Map(prev.set(terminalId, history.length)));
          const xterm = terminalRefs.current.get(terminalId);
          if (xterm) {
            xterm.clear();
            term.history.forEach((entry) => xterm.writeln(`${entry.type === 'command' ? '$ ' : ''}${entry.content}`));
            (xterm as any).write('');
            (xterm as any).write('$ ');
          }
        }
      }
    },
    [commandHistory, historyIndex, handleCommandSubmit, terminals],
  );

  // Add new terminal
  const addTerminal = useCallback(() => {
    const newTerminal: TerminalState = {
      id: `terminal-${Date.now()}`,
      name: `Terminal ${terminals.length + 1}`,
      history: [{ id: `entry-${Date.now()}`, content: 'Welcome to CodeFusion Terminal', type: 'output', timestamp: new Date().toISOString() }],
      currentDir: '/src',
      env: { PATH: '/bin:/usr/bin', HOME: '/home/user' },
      isRunning: false,
      activeCommand: null,
    };
    setTerminals([...terminals, newTerminal]);
    setActiveTerminalId(newTerminal.id);
  }, [terminals]);

  // Close terminal
  const closeTerminal = useCallback((terminalId: string) => {
    const xterm = terminalRefs.current.get(terminalId);
    if (xterm) {
      xterm.dispose();
      terminalRefs.current.delete(terminalId);
      fitAddons.current.delete(terminalId);
    }
    setTerminals((prev) => {
      const newTerminals = prev.filter((t) => t.id !== terminalId);
      if (newTerminals.length > 0 && activeTerminalId === terminalId) {
        setActiveTerminalId(newTerminals[0].id);
      }
      return newTerminals;
    });
    localStorage.removeItem(`terminal-history-${terminalId}`);
  }, [activeTerminalId]);

  // Handle terminal rename
  const renameTerminal = useCallback((terminalId: string, newName: string) => {
    setTerminals((prev) =>
      prev.map((t) => (t.id === terminalId ? { ...t, name: newName } : t)),
    );
  }, []);

  const term = terminals.find((t) => t.id === activeTerminalId);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-white font-mono">
      {/* Terminal Tabs */}
      <Tabs value={activeTerminalId} onValueChange={setActiveTerminalId} className="flex items-center bg-[#252526] p-1 border-b border-[#3c3c3c]">
        <TabsList className="bg-transparent">
          {terminals.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="text-gray-300 data-[state=active]:bg-[#1e1e1e] flex items-center"
            >
              <span
                className="cursor-text"
                onDoubleClick={() => {
                  const newName = prompt('Enter new terminal name:', t.name);
                  if (newName) renameTerminal(t.id, newName);
                }}
              >
                {t.name}
              </span>
              {terminals.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 w-5 h-5 p-0 hover:bg-[#3c3c3c]"
                  onClick={() => closeTerminal(t.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        <Button variant="ghost" size="sm" className="ml-2 w-6 h-6 p-0" onClick={addTerminal}>
          <Plus className="w-4 h-4" />
        </Button>
        <div className="flex-1" />
        <span className="text-sm text-gray-400">{term?.currentDir}</span>
      </Tabs>

      {/* Terminal Content */}
      {terminals.map((t) => (
        <TabsContent key={t.id} value={t.id} className="flex-1 m-0">
          <div
            id={`terminal-${t.id}`}
            className={cn('h-full', t.id !== activeTerminalId && 'hidden')}
            style={{ touchAction: 'none' }}
          />
          <div className="bg-[#1e1e1e] p-2 border-t border-[#3c3c3c]">
            <div className="flex items-center">
              <span className="text-green-400 mr-2">$</span>
              <input
                ref={(el) => el && inputRefs.current.set(t.id, el)}
                type="text"
                value={t.id === activeTerminalId ? commandInput : ''}
                onChange={(e) => t.id === activeTerminalId && setCommandInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, t.id)}
                className="flex-1 bg-transparent border-none outline-none text-white"
                disabled={t.isRunning}
                placeholder={t.isRunning ? `Running ${t.activeCommand}...` : ''}
              />
            </div>
          </div>
        </TabsContent>
      ))}
    </div>
  );
}
