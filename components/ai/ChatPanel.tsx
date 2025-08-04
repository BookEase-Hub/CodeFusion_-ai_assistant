"use client";

import * as React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAIStore } from '@/state/aiStore';
import { generateAIResponse } from '@/utils/ai/aiService';
import { ChatMessage } from './ChatMessage';
import { useAppState } from '@/contexts/app-state-context';

interface ChatPanelProps {
  onInsertCode: (code: string, language: string) => void;
}

export function ChatPanel({ onInsertCode }: ChatPanelProps) {
  const { messages, addMessage, clearChat } = useAIStore();
  const { state } = useAppState();
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
    };
    addMessage(userMessage);
    setInput('');

    setTimeout(() => {
      const aiResponse = generateAIResponse(input, {
        activeTab: state.activeTab,
        tabs: state.tabs,
        fileTree: state.currentProject?.files || [],
      });
      addMessage(aiResponse);
      setIsLoading(false);
    }, 1500);
  };

  const applySuggestion = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] text-white">
      <div className="p-2 font-semibold border-b border-[#3c3c3c] flex items-center justify-between">
        <span>AI ASSISTANT</span>
        <Button variant="ghost" size="icon" onClick={clearChat}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onInsertCode={onInsertCode}
            onApplySuggestion={applySuggestion}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-[#3c3c3c] bg-[#1e1e1e]">
        <div className="flex items-center">
          <Input
            ref={inputRef}
            type="text"
            className="flex-1 bg-[#333333] text-white border border-[#3c3c3c] rounded-md py-2 px-3 outline-none"
            placeholder="Ask for code, debugging, or diagrams..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button variant="default" className="ml-2" onClick={sendMessage} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}
