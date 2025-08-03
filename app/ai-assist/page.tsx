"use client";

import { EditorLayout } from "@/components/vscode/EditorLayout";
import { AppStateProvider } from "@/contexts/app-state-context";

export default function AIAssistPage() {
  return (
    <AppStateProvider>
      <EditorLayout />
    </AppStateProvider>
  );
}
