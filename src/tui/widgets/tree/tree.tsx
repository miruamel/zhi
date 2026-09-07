/**
 * @fileoverview Tree widget — file-system style tree view. @since 0.2.6
 * @package zhi
 */
import { Text } from 'ink';

/** @brief Tree node. @since 0.2.6 */
export interface TreeNode {
  id?: string;
  label: string;
  value?: string;
  children?: TreeNode[];
  expanded?: boolean;
  selectable?: boolean;
  icon?: string;
}

/** @brief Tree props. @since 0.2.6 */
export interface TreeProps {
  nodes?: TreeNode[];
  data?: TreeNode[];
  selected?: string;
  onSelect?: (value: string) => void;
  maxDepth?: number;
}

/** @brief Tree component — pure presentational, no hooks. @since 0.2.6 */
export function Tree({
  nodes,
  data,
  selected,
  onSelect,
  maxDepth = 5,
}: TreeProps): React.ReactElement {
  void onSelect;
  const items = nodes ?? data ?? [];

  const renderNode = (node: TreeNode, depth: number, path: string): React.ReactElement => {
    if (depth >= maxDepth) return <></>;
    const isSelected = selected === node.value;
    const hasChildren = (node.children?.length ?? 0) > 0;
    const prefix = depth > 0 ? '│  '.repeat(depth - 1) + (hasChildren ? '├─ ' : '└─ ') : '';
    const color = isSelected ? 'cyan' : 'gray';
    const icon = node.icon ?? (hasChildren ? '📁' : '📄');
    return (
      <Text key={path}>
        <Text color={color}>
          {prefix}
          {hasChildren ? '▼ ' : ''}
          {icon}
          {node.label}
        </Text>
        {'\n'}
        {node.children?.map((child) => renderNode(child, depth + 1, `${path}/${child.label}`))}
      </Text>
    );
  };

  return <Text>{items.map((node, i) => renderNode(node, 0, String(i)))}</Text>;
}
