"use client";

import * as React from 'react';
import { Copy, Clipboard, FileCode2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeEditor } from '@/components/code-editor';

interface CodeBlockProps {
  code: string;
  language: string;
  onInsertCode: (code: string, language: string) => void;
}

export function CodeBlock({ code, language, onInsertCode }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-2 rounded-md overflow-hidden">
      <CodeEditor value={code} language={language} height="200px" readOnly />
      <div className="absolute top-2 right-2 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          disabled={copied}
        >
          {copied ? <Clipboard className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onInsertCode(code, language)}
        >
          <FileCode2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
