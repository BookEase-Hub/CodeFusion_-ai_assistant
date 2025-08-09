import { FileNode } from '@/types';

export function generateMermaidFromTree(tree: FileNode[]): string {
  let mermaidString = 'graph TD\\n';
  const traverse = (nodes: FileNode[], parent?: FileNode) => {
    nodes.forEach((node) => {
      if (parent) {
        mermaidString += `  ${parent.id}["${parent.name}"] --> ${node.id}["${node.name}"]\\n`;
      } else {
        // Add root node
        mermaidString += `  ${node.id}["${node.name}"]\\n`;
      }
      if (node.type === 'folder' && node.children) {
        traverse(node.children, node);
      }
    });
  };
  traverse(tree);
  return mermaidString;
}
