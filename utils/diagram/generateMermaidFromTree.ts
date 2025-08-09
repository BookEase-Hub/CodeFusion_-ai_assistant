import { FileNode } from '@/types/ai';

export function generateMermaidFromTree(tree: FileNode[]): string {
  let mermaidString = 'graph TD\n';
  const traverse = (nodes: FileNode[], parent?: FileNode) => {
    nodes.forEach((node) => {
      if (parent) {
        const parentId = parent.id.replace(/[^a-zA-Z0-9_]/g, '_');
        const nodeId = node.id.replace(/[^a-zA-Z0-9_]/g, '_');
        mermaidString += `  ${parentId}["${parent.name}"] --> ${nodeId}["${node.name}"]\n`;
      }
      if (node.type === 'folder' && node.children) {
        traverse(node.children, node);
      }
    });
  };
  traverse(tree);
  return mermaidString;
}
