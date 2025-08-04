"use client";

import * as React from 'react';
import { Message } from '@/types/ai';
import { CodeBlock } from './CodeBlock';
import { Button } from '@/components/ui/button';
import { AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onInsertCode: (code: string, language: string) => void;
  onApplySuggestion: (suggestion: string) => void;
}

export function ChatMessage({ message, onInsertCode, onApplySuggestion }: ChatMessageProps) {
  return (
    <div className={`mb-4 ${message.role === 'user' ? 'text-right' : ''}`}>
      <div
        className={`inline-block rounded-lg p-3 max-w-[80%] break-words ${
          message.role === 'user' ? 'bg-[#3c3c3c]' : 'bg-[#1e1e1e]'
        }`}
      >
        {message.content}
      </div>
      {message.code && (
        <CodeBlock
          code={message.code.value}
          language={message.code.language || 'text'}
          onInsertCode={onInsertCode}
        />
      )}
      {message.problems && (
        <div className="mt-2">
          {message.problems.map((problem) => (
            <div key={problem.id} className="flex items-start py-1 px-2 hover:bg-[#2a2d2e] rounded-sm cursor-pointer">
              {problem.type === 'error' ? (
                <AlertCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
              ) : problem.type === 'warning' ? (
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500 mt-0.5" />
              ) : (
                <Info className="h-4 w-4 mr-2 text-blue-500 mt-0.5" />
              )}
              <div>
                <div>{problem.message}</div>
                <div className="text-gray-500 text-xs">
                  {problem.file}:{problem.line}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {message.suggestions && (
        <div className="mt-2 flex flex-wrap gap-2">
          {message.suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onApplySuggestion(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
