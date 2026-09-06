/**
 * @fileoverview Tree — file-system style tree view.
 * @since 0.2.0
 */
import { Box, Text } from 'ink';
import { colors } from '../../core/colors';

export interface TreeNode {
  id: string;
  label: string;
  icon?: string;
  children?: TreeNode[];
  expanded?: boolean;
  indent?: number;
}

export interface TreeProps {
  nodes: TreeNode[];
  onExpand?: (id: string) => void;
  onSelect?: (id: string) => void;
  selected?: string;
}

const ICONS: Record<string, string> = {
  folder: '📁',
  file: '📄',
  folderOpen: '📂',
};

/** @brief Render a tree view. @since 0.2.0 */
export function Tree({ nodes, onExpand, onSelect, selected }: TreeProps) {
  const renderNode = (node: TreeNode, depth: number) => {
    const hasChildren = (node.children?.length ?? 0) > 0;
    const isExpanded = node.expanded ?? true;
    const icon = hasChildren ? (isExpanded ? ICONS.folderOpen : ICONS.folder) : (node.icon ?? ICONS.file);
    const indent = '  '.repeat(depth);
    const isSel = node.id === selected;

    return (
      <Box key={node.id} flexDirection="column">
        <Text>
          <Text dimColor>{indent}</Text>
          <Text>{icon} </Text>
          {hasChildren && (
            <Text dimColor>{isExpanded ? '▾ ' : '▸ '}</Text>
          )}
          <Text color={isSel ? colors.accent : colors.fg}>{node.label}</Text>
        </Text>
        {hasChildren && isExpanded && node.children!.map((child) => renderNode(child, depth + 1))}
      </Box>
    );
  };

  return (
    <Box flexDirection="column">
      {nodes.map((n) => renderNode(n, n.indent ?? 0))}
    </Box>
  );
}