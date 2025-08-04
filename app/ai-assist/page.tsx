"use client"

import { AppStateProvider, useAppState } from "@/contexts/app-state-context";
import CodeFusionApp from "@/components/code-fusion-app";
import CodeFusionPanel from "@/components/ai/ChatPanel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

function AiAssistPage() {
  const {
    state: {
      tabs,
      activeTab,
      currentProject,
    },
    setTabs,
    setActiveTab,
    updateProject,
  } = useAppState();

  const handleInsertCode = (code: string, language: string) => {
    if (activeTab) {
      const tab = tabs.find((t) => t.id === activeTab);
      if (tab) {
        const newContent = tab.content + "\n" + code;
        const newTabs = tabs.map((t) =>
          t.id === activeTab ? { ...t, content: newContent } : t
        );
        setTabs(newTabs);
      }
    }
  };

  const handleUpdateDiagram = (path: string, content: string) => {
    const newTabs = tabs.map((t) =>
      t.path === path ? { ...t, content } : t
    );
    setTabs(newTabs);
    if (currentProject) {
      const newFiles = currentProject.files.map((f) =>
        f.path === path ? { ...f, content } : f
      );
      updateProject({ ...currentProject, files: newFiles });
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>
        <CodeFusionApp />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>
        <CodeFusionPanel
          onInsertCode={handleInsertCode}
          onUpdateDiagram={handleUpdateDiagram}
          fileTree={currentProject?.files || []}
          activeTab={activeTab}
          tabs={tabs}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default function AiAssistPageWrapper() {
  return (
    <AppStateProvider>
      <AiAssistPage />
    </AppStateProvider>
  );
}
