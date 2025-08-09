import { useRef } from 'react';
import { useAppState } from '@/contexts/app-state-context';
import { FileSystemDB } from '@/lib/db';
import { FileTreeItem, EditorTab } from '@/types';
import { useToast } from "@/components/ui/use-toast";

export function useFileManager() {
  const { dispatch } = useAppState();
  const { toast } = useToast();
  const db = useRef(new FileSystemDB());

  const loadFileTree = async () => {
    const folders = await db.current.getAllFolders();
    // A real implementation would recursively load all files for each folder
    // and construct a complete tree. This is a simplified version.
    dispatch({ type: 'SET_FILE_TREE', payload: folders });
  };

  const openFile = async (path: string) => {
    const file = await db.current.getFile(path);
    if (file) {
      const newTab: EditorTab = {
        id: `tab-${Date.now()}`,
        name: file.name,
        path: file.path,
        content: file.content || '',
        language: file.language || 'text',
        isLocked: file.isLocked,
        version: file.version
      };
      dispatch({ type: 'ADD_TAB', payload: newTab });
    } else {
        toast({ title: "Error", description: `File not found: ${path}`, variant: "destructive" });
    }
  };

  const saveFile = async (tab: EditorTab) => {
    if (tab.isLocked) {
        toast({ title: "File Locked", description: "This file is locked and cannot be saved.", variant: "destructive" });
        return;
    }
    await db.current.saveFile(tab);
    dispatch({ type: 'UPDATE_TAB', payload: { id: tab.id, updates: { isDirty: false } } });
    toast({ title: "File Saved", description: `${tab.name} has been saved.` });
  };

  const createFile = async (fileName: string, content: string = '', parentPath: string = '') => {
    const path = parentPath ? `${parentPath}/${fileName}` : fileName;
    const newFile: FileTreeItem = {
      id: `file-${Date.now()}`,
      name: fileName,
      type: 'file',
      path,
      content,
      language: fileName.split('.').pop() || 'text',
    };
    await db.current.saveFile(newFile);
    // In a real app, we would update the parent folder's children array
    await loadFileTree(); // Refresh file tree
    toast({ title: "File Created", description: `File "${fileName}" created.` });
  };

  const createFolder = async (folderName: string, parentPath: string = '') => {
    const path = parentPath ? `${parentPath}/${folderName}` : folderName;
    const newFolder: FileTreeItem = {
        id: `folder-${Date.now()}`,
        name: folderName,
        type: 'folder',
        path,
        children: [],
        isOpen: true,
    };
    await db.current.saveFolder(newFolder);
    // In a real app, we would update the parent folder's children array
    await loadFileTree(); // Refresh file tree
    toast({ title: "Folder Created", description: `Folder "${folderName}" created.` });
  };

  const saveFolderAs = async (folder: FileTreeItem, newName?: string) => {
    const newFolder = { ...folder };
    if (newName) {
        newFolder.name = newName;
        newFolder.id = `folder-${Date.now()}`;
        newFolder.path = newName; // Simplified path for root folder
    }

    const saveChildren = async (items: FileTreeItem[], parentPath: string) => {
        for (const item of items) {
            const newPath = `${parentPath}/${item.name}`;
            if (item.type === 'file') {
                await db.current.saveFile({ ...item, path: newPath });
            } else if (item.type === 'folder') {
                const newFolderItem = { ...item, path: newPath, id: `${item.id}-${Date.now()}` };
                await db.current.saveFolder(newFolderItem);
                if (item.children) {
                    await saveChildren(item.children, newPath);
                }
            }
        }
    };

    await db.current.saveFolder(newFolder);
    if (newFolder.children) {
        await saveChildren(newFolder.children, newFolder.path);
    }

    toast({ title: "Workspace Saved", description: `Workspace "${newFolder.name}" has been saved.` });
    await loadFileTree();
  };

  const openFolder = async (folderId: string) => {
    const folder = await db.current.getFolder(folderId);
    if (folder) {
        dispatch({ type: 'SET_CURRENT_FOLDER', payload: folder });
        dispatch({ type: 'SET_FILE_TREE', payload: folder.children || [] });
        // Close all tabs first
        // In a real app, we'd have a 'CLOSE_ALL_TABS' action
        // For now, we manually clear them
        dispatch({ type: 'UPDATE_AIAssistant', payload: { tabs: [] } });

        const openFilesInFolder = (items: FileTreeItem[]) => {
            items.forEach(item => {
                if (item.type === 'file') {
                    openFile(item.path);
                } else if (item.children) {
                    openFilesInFolder(item.children);
                }
            });
        };
        if (folder.children) {
            openFilesInFolder(folder.children);
        }

        toast({ title: "Folder Opened", description: `Workspace "${folder.name}" has been opened.` });
    } else {
        toast({ title: "Error", description: "Could not find the selected folder.", variant: "destructive" });
    }
  };

  const closeFolder = () => {
    dispatch({ type: 'SET_CURRENT_FOLDER', payload: null });
    dispatch({ type: 'SET_FILE_TREE', payload: [] });
    dispatch({ type: 'UPDATE_AIAssistant', payload: { tabs: [] }});
    toast({ title: "Folder Closed", description: "The current workspace has been closed." });
  };

  const moveItem = async (sourcePath: string, targetFolderPath: string) => {
    toast({ title: "Move Item (Mock)", description: `Moved ${sourcePath} to ${targetFolderPath}` });
    // In a real app, this would involve:
    // 1. Finding the source item (file or folder)
    // 2. Finding the target folder
    // 3. Removing the item from its original parent's children array
    // 4. Adding the item to the target folder's children array
    // 5. Updating the path of the moved item and all its children recursively
    // 6. Saving all updated folder and file records to IndexedDB
    await loadFileTree(); // Refresh to reflect potential changes
  };

  return {
    loadFileTree,
    openFile,
    saveFile,
    createFile,
    createFolder,
    saveFolderAs,
    openFolder,
    closeFolder,
    moveItem,
  };
}
