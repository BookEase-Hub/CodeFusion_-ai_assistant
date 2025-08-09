"use client";

import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { EditorTab, ChatMessage, FileNode } from '@/types';

interface AppState {
  tabs: EditorTab[];
  activeTab: string | null;
  fileTree: FileNode[];
  currentFolder: FileTreeItem | null;
  chatMessages: ChatMessage[];
  chatInput: string;
  showExplorer: boolean;
  showTerminal: boolean;
  showProblems: boolean;
  activePanel: 'terminal' | 'problems' | null;
  terminalHeight: number;
}

type Action =
  | { type: 'ADD_TAB'; payload: EditorTab }
  | { type: 'REMOVE_TAB'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: string | null }
  | { type: 'UPDATE_TAB'; payload: { id: string; updates: Partial<EditorTab> } }
  | { type: 'SET_FILE_TREE'; payload: FileNode[] }
  | { type: 'SET_CURRENT_FOLDER'; payload: FileTreeItem | null }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_CHAT_INPUT'; payload: string }
  | { type: 'TOGGLE_EXPLORER' }
  | { type: 'TOGGLE_TERMINAL' }
  | { type: 'SET_TERMINAL_HEIGHT'; payload: number }
  | { type: 'UPDATE_AIAssistant'; payload: Partial<AppState> };


const initialState: AppState = {
  tabs: [],
  activeTab: null,
  fileTree: [],
  currentFolder: null,
  chatMessages: [
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI coding assistant. How can I help you today?",
    },
  ],
  chatInput: '',
  showExplorer: true,
  showTerminal: false,
  showProblems: false,
  activePanel: 'terminal',
  terminalHeight: 200,
};

const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

const appStateReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_TAB':
      if (state.tabs.find(tab => tab.id === action.payload.id)) {
        return { ...state, activeTab: action.payload.id };
      }
      return { ...state, tabs: [...state.tabs, action.payload], activeTab: action.payload.id };
    case 'REMOVE_TAB': {
      const newTabs = state.tabs.filter((tab) => tab.id !== action.payload);
      let newActiveTab = state.activeTab;
      if (state.activeTab === action.payload) {
        const closingTabIndex = state.tabs.findIndex(tab => tab.id === action.payload);
        newActiveTab = newTabs[closingTabIndex - 1]?.id || newTabs[0]?.id || null;
      }
      return { ...state, tabs: newTabs, activeTab: newActiveTab };
    }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'UPDATE_TAB':
      return {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === action.payload.id ? { ...tab, ...action.payload.updates } : tab
        ),
      };
    case 'SET_FILE_TREE':
        return { ...state, fileTree: action.payload };
    case 'SET_CURRENT_FOLDER':
        return { ...state, currentFolder: action.payload };
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatMessages: [...state.chatMessages, action.payload] };
    case 'SET_CHAT_INPUT':
        return { ...state, chatInput: action.payload };
    case 'TOGGLE_EXPLORER':
        return { ...state, showExplorer: !state.showExplorer };
    case 'TOGGLE_TERMINAL':
        return { ...state, showTerminal: !state.showTerminal };
    case 'SET_TERMINAL_HEIGHT':
        return { ...state, terminalHeight: action.payload };
    case 'UPDATE_AIAssistant':
        return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }

  // Convenience functions to abstract dispatch calls
  const { state, dispatch } = context;

  const updateAIAssistant = (payload: Partial<AppState>) => dispatch({ type: 'UPDATE_AIAssistant', payload });
  const addEditorTab = (payload: EditorTab) => dispatch({ type: 'ADD_TAB', payload });
  const updateEditorTab = (id: string, updates: Partial<EditorTab>) => dispatch({ type: 'UPDATE_TAB', payload: { id, updates } });
  const removeEditorTab = (payload: string) => dispatch({ type: 'REMOVE_TAB', payload });
  const addChatMessage = (payload: ChatMessage) => dispatch({ type: 'ADD_CHAT_MESSAGE', payload });

  return {
    state,
    updateAIAssistant,
    addEditorTab,
    updateEditorTab,
    removeEditorTab,
    addChatMessage,
    dispatch,
  };
};
