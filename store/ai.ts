import { create } from 'zustand';
import { AIProblem, Message, FileNode, EditorTab } from '@/types/ai';

interface AIState {
  editorTabs: EditorTab[];
  activeEditorTab: string | null;
  chatMessages: Message[];
  chatInput: string;
  showExplorer: boolean;
  showTerminal: boolean;
  showProblems: boolean;
  activePanel: string | null;
  terminalHeight: number;
  problems: AIProblem[];
  currentProject: { files: FileNode[] } | null;

  // Actions
  addMessage: (message: Message) => void;
  setProblems: (problems: AIProblem[]) => void;
  clearChat: () => void;
  addEditorTab: (tab: EditorTab) => void;
  updateEditorTab: (id: string, updates: Partial<EditorTab>) => void;
  removeEditorTab: (id:string) => void;
  updateAIAssistant: (updates: Partial<AIState>) => void;
  setCurrentProject: (project: { files: FileNode[] } | null) => void;
}

export const useAIStore = create<AIState>((set) => ({
  editorTabs: [],
  activeEditorTab: null,
  chatMessages: [
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your AI coding assistant. I can help with code generation, debugging, optimization, and architecture visualization. Ask me anything!',
    },
  ],
  chatInput: "",
  showExplorer: true,
  showTerminal: false,
  showProblems: false,
  activePanel: "terminal",
  terminalHeight: 200,
  problems: [],
  currentProject: null,

  addMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  setProblems: (problems) => set({ problems }),
  clearChat: () => set({ chatMessages: [{
    id: '1',
    role: 'assistant',
    content: 'Hi! I\'m your AI coding assistant. I can help with code generation, debugging, optimization, and architecture visualization. Ask me anything!',
  }] }),
  addEditorTab: (tab) => set((state) => ({ editorTabs: [...state.editorTabs, tab], activeEditorTab: tab.id })),
  updateEditorTab: (id, updates) => set((state) => ({
    editorTabs: state.editorTabs.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab)),
  })),
  removeEditorTab: (id) => set((state) => {
    const newTabs = state.editorTabs.filter((tab) => tab.id !== id);
    const newActiveTab = newTabs.length > 0 ? (state.activeEditorTab === id ? newTabs[newTabs.length - 1].id : state.activeEditorTab) : null;
    return { editorTabs: newTabs, activeEditorTab: newActiveTab };
  }),
  updateAIAssistant: (updates) => set((state) => ({ ...state, ...updates })),
  setCurrentProject: (project) => set({ currentProject: project }),
}));
