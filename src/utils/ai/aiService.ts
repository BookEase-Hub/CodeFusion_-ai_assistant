import { Message, AIProblem } from '@/types/ai';
import { EditorTab, FileNode } from '@/types';

export function analyzeCode(code: string, language: string): AIProblem[] {
    const problems: AIProblem[] = [];
    if (language === "typescript" || language === "javascript") {
      if (code.includes("let ") && !code.includes("const ")) {
        problems.push({ id: `prob-${Date.now()}`, type: "info", message: "Consider using 'const' instead of 'let' for immutable variables", file: "current file", line: code.split("\\n").findIndex((line) => line.includes("let ")) + 1 });
      }
      if (code.includes("null") || code.includes("undefined")) {
        problems.push({ id: `prob-${Date.now() + 1}`, type: "warning", message: "Potential null/undefined reference", file: "current file", line: code.split("\\n").findIndex((line) => line.includes("null") || line.includes("undefined")) + 1 });
      }
    }
    return problems;
  };

export function generateAIResponse(
  input: string,
  context: {
    activeTab: string | null;
    tabs: EditorTab[];
  }
): Message {
  const lowerInput = input.toLowerCase();
  const { activeTab, tabs } = context;
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  if (lowerInput.includes('function') || lowerInput.includes('create') || lowerInput.includes('write')) {
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Here is a sample function:',
        code: {
          language: 'javascript',
          value: `function greet(name) {\n  return \`Hello, \${name}!\`;\n}`,
        },
        suggestions: ['Add a return type', 'Add error handling'],
      };
  } else if (lowerInput.includes('debug') || lowerInput.includes('fix') || lowerInput.includes('error')) {
    const problems = currentTab ? analyzeCode(currentTab.content, currentTab.language || 'javascript') : [];
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: problems.length ? 'Found issues in your code:' : 'No issues found in the current file.',
      problems,
    };
  }
  return {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: "I'm sorry, I can't help with that right now. I can generate functions or debug your code.",
    suggestions: ['Generate a function', 'Debug current file'],
  };
}
