"use client"

import React, { useImperativeHandle, useEffect, useRef } from "react";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { python } from "@codemirror/lang-python";
import { css } from "@codemirror/lang-css";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { basicSetup } from "codemirror";

interface CodeEditorProps {
  value: string;
  language?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export const CodeEditor = React.forwardRef<{ view?: EditorView }, CodeEditorProps>(
  ({ value, language = "javascript", onChange, readOnly = false }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView>();

    useImperativeHandle(ref, () => ({
      get view() {
        return viewRef.current;
      }
    }));

    useEffect(() => {
      if (!editorRef.current) return;

      const extensions = [
        basicSetup,
        vscodeDark,
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange?.(update.state.doc.toString());
          }
        }),
      ];

      switch (language?.toLowerCase()) {
        case "js":
        case "javascript":
        case "tsx":
        case "typescript":
          extensions.push(javascript({ jsx: true, typescript: true }));
          break;
        case "json":
          extensions.push(json());
          break;
        case "html":
          extensions.push(html());
          break;
        case "python":
          extensions.push(python());
          break;
        case "css":
            extensions.push(css());
            break;
      }

      if (readOnly) {
          extensions.push(EditorState.readOnly.of(true));
      }

      const state = EditorState.create({
        doc: value,
        extensions: extensions,
      });

      const view = new EditorView({
        state,
        parent: editorRef.current,
      });

      viewRef.current = view;

      return () => {
        view.destroy();
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language, readOnly]);

    useEffect(() => {
        if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
            viewRef.current.dispatch({
                changes: { from: 0, to: viewRef.current.state.doc.length, insert: value }
            })
        }
    }, [value]);

    return <div ref={editorRef} className="h-full w-full" />;
  }
);

CodeEditor.displayName = "CodeEditor";
