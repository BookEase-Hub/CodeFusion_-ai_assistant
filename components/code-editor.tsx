"use client"

import * as React from "react"
import CodeMirror from "@uiw/react-codemirror"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import { javascript } from "@codemirror/lang-javascript"
import { json } from "@codemirror/lang-json"
import { html } from "@codemirror/lang-html"
import { python } from "@codemirror/lang-python"

interface CodeEditorProps {
  value: string
  language?: string
  height?: string
  onChange?: (value: string) => void
  readOnly?: boolean
}

export function CodeEditor({
  value,
  language = "javascript",
  height = "400px",
  onChange,
  readOnly = false,
}: CodeEditorProps) {
  const extensions = React.useMemo(() => {
    switch (language?.toLowerCase()) {
      case "js":
      case "javascript":
      case "tsx":
      case "typescript":
        return [javascript({ jsx: true, typescript: true })]
      case "json":
        return [json()]
      case "html":
        return [html()]
      case "python":
        return [python()]
      default:
        return []
    }
  }, [language])

  return (
    <CodeMirror
      value={value}
      height={height}
      theme={vscodeDark}
      extensions={extensions}
      editable={!readOnly}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        foldGutter: true,
      }}
      onChange={(val) => onChange?.(val)}
      style={{
        fontSize: 14,
        fontFamily: `"Fira Code", "JetBrains Mono", monospace`,
        borderRadius: "8px",
        overflow: "hidden",
      }}
    />
  )
}
