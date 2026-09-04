/** @brief Tree widget: collapsible tree view with keyboard navigation. @since 0.1.1 */
import React, { useMemo, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../../core/style/colors';

/** @brief Single tree node. @since 0.1.1 */
export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  /** @brief Allow arbitrary metadata on nodes. @since 0.1.1 */
  [k: string]: unknown;
}

/** @brief Default-expanded state for the tree. @since 0.1.1 */
export type TreeDefaultExpanded = boolean | string[];

/** @brief Render a single node line. @since 0.1.1 */
export type TreeNodeRenderer = (
  node: TreeNode,
  ctx: { depth: number; expanded: boolean; hasChildren: boolean; selected: boolean },
) => React.ReactNode;

export interface TreeProps {
  data: TreeNode[];
  defaultExpanded?: TreeDefaultExpanded;
  onNodeClick?: (node: TreeNode) => void;
  renderNode?: TreeNodeRenderer;
  maxDepth?: number;
}

/** @brief A flattened visible row produced by the layout pass. @since 0.1.1 */
interface FlatRow {
  node: TreeNode;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
}

const INDENT = '  ';

/** @brief Walk `data` producing visible rows respecting `expanded` + `maxDepth`. @since 0.1.1 */
function flatten(
  nodes: TreeNode[],
  expanded: Set<string>,
  maxDepth: number | undefined,
  depth: number,
  out: FlatRow[],
): FlatRow[] {
  for (const node of nodes) {
    const hasChildren = (node.children?.length ?? 0) > 0;
    const isExpanded = hasChildren && expanded.has(node.id);
    out.push({ node, depth, hasChildren, expanded: isExpanded });
    if (isExpanded && (maxDepth === undefined || depth < maxDepth)) {
      flatten(node.children ?? [], expanded, maxDepth, depth + 1, out);
    }
  }
  return out;
}

/** @brief Build the initial expanded set from `defaultExpanded`. @since 0.1.1 */
function buildDefaultSet(data: TreeNode[], def: TreeDefaultExpanded | undefined): Set<string> {
  const out = new Set<string>();
  if (def === undefined) return out;
  if (def === true) {
    for (const node of data) collectIds(node, out);
    return out;
  }
  if (def === false) return out;
  for (const id of def) out.add(id);
  return out;
}

function collectIds(node: TreeNode, out: Set<string>): void {
  if (node.children?.length) {
    out.add(node.id);
    for (const child of node.children) collectIds(child, out);
  }
}

/** @brief Collapsible tree view with arrow/enter/space keyboard nav. @since 0.1.1 */
export function Tree({
  data,
  defaultExpanded,
  onNodeClick,
  renderNode,
  maxDepth,
}: TreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => buildDefaultSet(data, defaultExpanded));
  const [selectedId, setSelectedId] = useState<string | null>(data[0]?.id ?? null);

  const rows = useMemo<FlatRow[]>(
    () => flatten(data, expanded, maxDepth, 0, []),
    [data, expanded, maxDepth],
  );

  const selectedIndex = useMemo(
    () => rows.findIndex(r => r.node.id === selectedId),
    [rows, selectedId],
  );

  useInput((input: string, key: { upArrow?: boolean; downArrow?: boolean; return?: boolean }) => {
    if (rows.length === 0) return;
    const idx = selectedIndex >= 0 ? selectedIndex : 0;

    if (key.upArrow) {
      const next = idx > 0 ? idx - 1 : rows.length - 1;
      setSelectedId(rows[next]!.node.id);
      return;
    }
    if (key.downArrow) {
      const next = idx < rows.length - 1 ? idx + 1 : 0;
      setSelectedId(rows[next]!.node.id);
      return;
    }
    if (key.return || input === ' ') {
      const row = rows[idx];
      if (!row) return;
      if (key.return && row.hasChildren) {
        setExpanded(prev => toggleExpanded(prev, row.node.id));
      }
      if (onNodeClick) onNodeClick(row.node);
    }
  });

  return (
    <Box flexDirection="column">
      {rows.map((row, i) => {
        const selected = i === selectedIndex;
        const glyph = !row.hasChildren ? '  ' : row.expanded ? '▾ ' : '▸ ';
        const indent = INDENT.repeat(row.depth);
        const labelColor = selected ? colors.accent : colors.fg;
        const custom = renderNode?.(row.node, {
          depth: row.depth,
          expanded: row.expanded,
          hasChildren: row.hasChildren,
          selected,
        });
        return (
          <Box key={row.node.id}>
            <Text color={selected ? colors.accent : colors.fgDim}>{indent}{glyph}</Text>
            <Text color={labelColor} bold={selected}>
              {custom ?? row.node.label}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}

/** @brief Pure toggle: add `id` if absent, remove if present. @since 0.1.1 */
export function toggleExpanded(current: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}