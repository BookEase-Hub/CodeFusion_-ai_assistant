import { create } from 'zustand';
import { AIProblem, Message } from '@/types/ai';

interface AIState {
  messages: Message[];
  problems: AIProblem[];
  addMessage: (message: Message) => void;
  setProblems: (problems: AIProblem[]) => void;
  clearChat: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your AI coding assistant. I can help with code generation, debugging, optimization, and architecture visualization. Ask me anything!',
    },
  ],
  problems: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setProblems: (problems) => set({ problems }),
  clearChat: () => set({ messages: [] }),
}));
