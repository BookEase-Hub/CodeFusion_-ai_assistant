"use client";

import React from 'react';
import { useAppState } from '@/contexts/app-state-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Copy, ChevronRight } from 'lucide-react';
import { generateAIResponse } from '@/utils/ai/aiService';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { javascript } from '@codemirror/lang-javascript';
import { cn } from '@/lib/utils';


export function ChatPanel({ onInsertCode }: { onInsertCode: (code: string, language?: string) => void; }) {
  const { state, dispatch, addChatMessage } = useAppState();
  const { chatMessages, chatInput, tabs, activeTab, fileTree } = state;

  const handleSend = () => {
    if (!chatInput.trim()) return;

    const userMessage = { id: `msg-${Date.now()}`, role: 'user' as const, content: chatInput };
    addChatMessage(userMessage);

    const aiResponse = generateAIResponse(chatInput, { tabs, activeTab, fileTree });
    addChatMessage(aiResponse);

    dispatch({ type: 'SET_CHAT_INPUT', payload: '' });
  };

  return (
    <div className="h-full flex flex-col bg-[#252526] text-gray-300">
      <div className="p-2 font-semibold border-b border-[#3c3c3c] flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-blue-400" />
        AI Assistant
      </div>
      <ScrollArea className="flex-1 p-2">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "mb-4 p-3 rounded-lg max-w-[90%]",
              message.role === 'user' ? 'bg-blue-900/50 ml-auto' : 'bg-gray-700/50 mr-auto'
            )}
          >
            <div className="text-xs font-bold mb-1">{message.role}</div>
            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
            {message.code && (
              <div className="mt-2 bg-black/50 rounded-md overflow-hidden">
                <CodeMirror
                  value={message.code.value}
                  height="200px"
                  extensions={[javascript({ jsx: true })]}
                  theme={vscodeDark}
                  readOnly
                />
                <div className="p-2 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => onInsertCode(message.code?.value || '', message.code?.language)}>
                        <Copy className="h-4 w-4 mr-2" /> Insert Code
                    </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </ScrollArea>
      <div className="p-2 border-t border-[#3c3c3c] flex items-center gap-2">
        <Input
          value={chatInput}
          onChange={(e) => dispatch({ type: 'SET_CHAT_INPUT', payload: e.target.value })}
          placeholder="Ask AI Assistant..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="bg-gray-800 border-gray-600"
        />
        <Button onClick={handleSend}><ChevronRight className="h-5 w-5" /></Button>
      </div>
    </div>
  );
}
