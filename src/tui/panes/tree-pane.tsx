/**
 * @fileoverview Tree pane — recursively rendered collapsible node tree.
 * @since 0.1.11
 * @updated 0.1.12 — split from pane-display.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import React from 'react';
import { Box, Text } from 'ink';
import { Pane } from './pane-base';

/** @brief Tree pane. @since 0.1.11 */
export function TreePane({
  nodes,
  expanded = new Set<string>(),
  focused = false,
}: {
  nodes: Array<{ id: string; label: string; children?: typeof nodes; level?: number }>;
  expanded?: Set<string>;
  focused?: boolean;
}) {
  const renderNode = (node: (typeof nodes)[0], level: number): React.ReactNode => {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    return (
      <Box key={node.id} flexDirection="column">
        <Text>
          {'  '.repeat(level)}
          {hasChildren ? (isExpanded ? '▼ ' : '▶ ') : '• '}
          {node.label}
        </Text>
        {hasChildren && isExpanded && node.children!.map((child) => renderNode(child, level + 1))}
      </Box>
    );
  };
  return (
    <Pane title="Tree" focused={focused}>
      {nodes.map((node) => renderNode(node, 0))}
    </Pane>
  );
}