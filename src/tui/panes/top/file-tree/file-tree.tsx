/**
 * @fileoverview File Tree pane — directory listing with expand/collapse.
 * @since 0.2.0
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { Tree, type TreeNode } from '../../../widgets/tree';

export interface FileTreeEntry {
  path: string;
  type: 'file' | 'dir';
  size?: number;
  modified?: number;
}

export interface FileTreeProps {
  files: FileTreeEntry[];
  root?: string;
  selected?: string;
  onSelect?: (path: string) => void;
}

/** @brief Build a tree from flat file list. @since 0.2.0 */
export function buildTree(files: FileTreeEntry[]): TreeNode[] {
  const roots: Map<string, TreeNode> = new Map();
  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));

  for (const f of sorted) {
    const parts = f.path.split('/');
    let currentPath = '';
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLast = i === parts.length - 1;

      if (isLast) {
        if (!roots.has(currentPath)) {
          roots.set(currentPath, {
            id: currentPath,
            label: part,
            icon: f.type === 'dir' ? undefined : undefined,
            children: f.type === 'dir' ? [] : undefined,
          });
        }
      } else {
        if (!roots.has(currentPath)) {
          const dirNode: TreeNode = {
            id: currentPath,
            label: part,
            children: [],
            expanded: true,
          };
          roots.set(currentPath, dirNode);
        }
      }
    }
  }
  return Array.from(roots.values());
}

/** @brief Render a file tree pane. @since 0.2.0 */
export function FileTree({ files, root, selected, onSelect }: FileTreeProps) {
  const nodes = buildTree(files);
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={colors.complete} paddingX={1} flexGrow={1}>
      <Text color={colors.complete} bold>
        _FILES {root ? `· ${root}` : ''} ({files.length})
      </Text>
      <Tree nodes={nodes} selected={selected} onSelect={onSelect} />
    </Box>
  );
}