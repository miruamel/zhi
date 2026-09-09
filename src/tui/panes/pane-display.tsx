/**
 * @fileoverview Pane display components — status, log, input, chart, tree, grid panes.
 * @since 0.1.11
 * @updated 0.1.11 — extracted from panes/index.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import React from 'react';
import { Box, Text } from 'ink';
import { Pane } from './pane-base';

/** @brief Status pane. @since 0.1.11 */
export function StatusPane({
  items,
  focused = false,
}: {
  items: Array<{ label: string; value: string; status?: 'ok' | 'warn' | 'error' | 'pending' }>;
  focused?: boolean;
}) {
  const statusColor = (s?: string) =>
    s === 'ok'
      ? 'green'
      : s === 'warn'
        ? 'yellow'
        : s === 'error'
          ? 'red'
          : s === 'pending'
            ? 'gray'
            : 'white';
  return (
    <Pane title="Status" focused={focused}>
      {items.map((item, i) => (
        <Box key={i}>
          <Text>{item.label}: </Text>
          <Text color={statusColor(item.status) as any}>{item.value}</Text>
        </Box>
      ))}
    </Pane>
  );
}

/** @brief Log pane. @since 0.1.11 */
export function LogPane({
  entries,
  maxEntries = 100,
  focused = false,
}: {
  entries: Array<{ level: string; message: string; timestamp: number }>;
  maxEntries?: number;
  focused?: boolean;
}) {
  const levelColor = (l: string) =>
    l === 'error'
      ? 'red'
      : l === 'warn'
        ? 'yellow'
        : l === 'info'
          ? 'cyan'
          : l === 'debug'
            ? 'gray'
            : 'white';
  const visible = entries.slice(-maxEntries);
  return (
    <Pane title="Log" focused={focused} height={20}>
      {visible.map((entry, i) => (
        <Text key={i} color={levelColor(entry.level) as any}>
          [{new Date(entry.timestamp).toLocaleTimeString()}] {entry.message}
        </Text>
      ))}
    </Pane>
  );
}

/** @brief Input pane. @since 0.1.11 */
export function InputPane({
  value,
  placeholder = 'Type a command...',
  focused = false,
}: {
  value: string;
  placeholder?: string;
  focused?: boolean;
}) {
  return (
    <Pane title="Input" focused={focused}>
      <Text>
        {'> '}
        {value || placeholder}
      </Text>
    </Pane>
  );
}

/** @brief Chart pane. @since 0.1.11 */
export function ChartPane({
  data,
  labels,
  title,
  focused = false,
}: {
  data: number[];
  labels?: string[];
  title?: string;
  focused?: boolean;
}) {
  const max = Math.max(...data, 1);
  const width = 40;
  return (
    <Pane title={title} focused={focused}>
      {data.map((value, i) => {
        const barLen = Math.round((value / max) * width);
        return (
          <Text key={i}>
            {labels?.[i] ?? `Item ${i}`.padEnd(10)} {'█'.repeat(barLen)} {value}
          </Text>
        );
      })}
    </Pane>
  );
}

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

/** @brief Grid pane. @since 0.1.11 */
export function GridPane({
  items,
  columns = 3,
}: {
  items: Array<{ id: string; content: React.ReactNode }>;
  columns?: number;
}) {
  const rows: (typeof items)[] = [];
  for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns));
  return (
    <Pane title="Grid">
      {rows.map((row, ri) => (
        <Box key={ri} flexDirection="row" gap={1}>
          {row.map((item) => (
            <Box key={item.id} flexDirection="column">
              {item.content}
            </Box>
          ))}
        </Box>
      ))}
    </Pane>
  );
}
