import { Message, AIProblem } from '@/types/ai';
import { EditorTab, FileNode } from '@/contexts/app-state-context';

export function analyzeCode(code: string, language: string): AIProblem[] {
    const problems: AIProblem[] = [];
    if (language === "typescript" || language === "javascript") {
      if (code.includes("let ") && !code.includes("const ")) {
        problems.push({ id: `prob-${Date.now()}`, type: "info", message: "Consider using 'const' instead of 'let' for immutable variables", file: "current file", line: code.split("\n").findIndex((line) => line.includes("let ")) + 1 });
      }
      if (code.includes("null") || code.includes("undefined")) {
        problems.push({ id: `prob-${Date.now() + 1}`, type: "warning", message: "Potential null/undefined reference", file: "current file", line: code.split("\n").findIndex((line) => line.includes("null") || line.includes("undefined")) + 1 });
      }
    }
    return problems;
  };

export function generateAIResponse(
  input: string,
  context: {
    activeTab: string | null;
    tabs: EditorTab[];
    fileTree: FileNode[];
  }
): Message {
  const lowerInput = input.toLowerCase();
  const { activeTab, tabs, fileTree } = context;
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  if (lowerInput.includes('function') || lowerInput.includes('create') || lowerInput.includes('write')) {
    if (lowerInput.includes('react') || lowerInput.includes('component')) {
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Here\'s a React component based on your request:',
        code: {
          language: 'typescript',
          value: `import React, { useState } from 'react';
function ${input.split(' ').pop() || 'MyComponent'}() {
  const [count, setCount] = useState(0);
  return (
    <div className="component">
      <h2>${input.split(' ').pop() || 'MyComponent'}</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
export default ${input.split(' ').pop() || 'MyComponent'};`,
        },
        suggestions: ['Add state management', 'Create a custom hook', 'Export as SVG'],
      };
    } else if (lowerInput.includes('python')) {
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Here\'s a Python function for you:',
        code: {
          language: 'python',
          value: `def ${input.split(' ').pop() || 'process_data'}(data):
    """
    Process and analyze data
    """
    if not data:
        return None
    processed = [item * 2 if isinstance(item, (int, float)) else str(item).upper() for item in data]
    return processed
# Example usage
sample_data = [1, 2, "hello", 3.14, "world"]
result = ${input.split(' ').pop() || 'process_data'}(sample_data)
print(result)`,
        },
        suggestions: ['Add error handling', 'Optimize for large datasets', 'Generate test cases'],
      };
    } else if (lowerInput.includes('diagram') || lowerInput.includes('architecture')) {
      const projectStructure =
        fileTree
          .filter((node) => node.type === 'folder')
          .map((node) => `  ${node.name} --> ${node.children?.map((child) => child.name).join(', ') || 'No children'}`)
          .join('\n') || 'No folders found';
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Generated a project architecture diagram:',
        code: {
          language: 'mermaid',
          value: `graph TD\n  Project --> ${projectStructure}`,
        },
        suggestions: ['Update diagram', 'Export as SVG', 'Add dependencies'],
      };
    }
  } else if (lowerInput.includes('debug') || lowerInput.includes('fix') || lowerInput.includes('error')) {
    const problems = currentTab ? analyzeCode(currentTab.content, currentTab.language || 'javascript') : [];
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: problems.length ? 'Found issues in your code:' : 'No issues found in the current file.',
      problems,
      code: problems.length
        ? {
            language: currentTab?.language || 'javascript',
            value: `// Suggested fix for ${currentTab?.name || 'current file'}
${currentTab?.content.replace(/let /g, 'const ') || '// No changes needed'}`,
          }
        : undefined,
      suggestions: ['Run linter', 'Apply all fixes', 'Explain issues'],
    };
  } else if (lowerInput.includes('optimize') || lowerInput.includes('performance')) {
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'Here\'s an optimized version of your code:',
      code: {
        language: currentTab?.language || 'javascript',
        value: `// Optimized code
function optimizedFunction(arr) {
  return arr.filter(num => num % 2 === 0);
}`,
      },
      suggestions: ['Profile performance', 'Add memoization', 'Reduce bundle size'],
    };
  } else if (lowerInput.includes('explain')) {
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: currentTab
        ? `Explanation of ${currentTab.name}:\nThis file contains a ${currentTab.language} component/function. Let me break it down:\n- Imports: ${
            currentTab.content
              .split('\n')
              .filter((line) => line.includes('import'))
              .join(', ') || 'None'
          }\n- Main functionality: ${
            currentTab.content.includes('function') ? 'Defines a function/component' : 'Other structure'
          }`
        : 'Please select a file to explain.',
      suggestions: ['Generate documentation', 'Add comments', 'Simplify code'],
    };
  }
  return {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: 'I can help with coding, debugging, optimization, or diagrams. Please provide more details!',
    suggestions: ['Generate a React component', 'Debug current file', 'Create architecture diagram'],
  };
}
