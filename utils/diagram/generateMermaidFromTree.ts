import { FileNode } from '@/contexts/app-state-context';

export function generateMermaidFromTree(tree: FileNode[]): string {
  let mermaidString = 'graph TD\n';
  const traverse = (nodes: FileNode[], parent?: FileNode) => {
    nodes.forEach((node) => {
      if (parent) {
        mermaidString += `  ${parent.id}["${parent.name}"] --> ${node.id}["${node.name}"]\n`;
      }
      if (node.type === 'folder' && node.children) {
        traverse(node.children, node);
      }
    });
  };
  traverse(tree);
  return mermaidString;
}
