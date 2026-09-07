/**
 * @fileoverview TUI panes — reusable pane components for the Zhi terminal interface.
 * @since 0.2.6
 * @package zhi
 */
import React, { useState } from 'react';
import { Box, Text } from 'ink';
/** @brief Pane props. @since 0.2.6 */
export interface PaneProps {
  title?: string;
  focused?: boolean;
  width?: number | string;
  height?: number | string;
  children?: React.ReactNode;
  onResize?: (width: number, height: number) => void;
}

/** @brief Pane component. @since 0.2.6 */
export function Pane({ title, focused = false, width, height, children }: PaneProps) {
  return (
    <Box
      flexDirection="column"
      borderStyle={focused ? 'round' : 'single'}
      borderColor={focused ? 'cyan' : 'gray'}
      paddingX={1}
      paddingY={0}
      width={width as any}
      height={height as any}
    >
      {title && (
        <Text bold color={focused ? 'cyan' : 'white'}>
          {title}
        </Text>
      )}
      <Box marginTop={title ? 0 : 0} flexGrow={1}>
        {children}
      </Box>
    </Box>
  );
}

/** @brief Split pane — divides space horizontally or vertically. @since 0.2.6 */
export function SplitPane({
  direction = 'horizontal',
  children,
  gap = 0,
}: {
  direction?: 'horizontal' | 'vertical';
  children: React.ReactNode;
  gap?: number;
}) {
  return (
    <Box flexDirection={direction === 'horizontal' ? 'row' : 'column'} gap={gap}>
      {children}
    </Box>
  );
}

/** @brief Scrollable pane. @since 0.2.6 */
export function ScrollablePane({
  children,
  height = 20,
}: {
  children: React.ReactNode;
  height?: number;
}) {
  const [scroll] = useState(0);

  return (
    <Box flexDirection="column" height={height} overflow="hidden">
      <Box marginTop={-scroll}>{children}</Box>
    </Box>
  );
}

/** @brief Status pane — shows status indicators. @since 0.2.6 */
export function StatusPane({
  items,
  focused = false,
}: {
  items: Array<{ label: string; value: string; status?: 'ok' | 'warn' | 'error' | 'pending' }>;
  focused?: boolean;
}) {
  const statusColor = (status?: string) => {
    switch (status) {
      case 'ok':
        return 'green';
      case 'warn':
        return 'yellow';
      case 'error':
        return 'red';
      case 'pending':
        return 'gray';
      default:
        return 'white';
    }
  };

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

/** @brief Log pane — displays log entries. @since 0.2.6 */
export function LogPane({
  entries,
  maxEntries = 100,
  focused = false,
}: {
  entries: Array<{ level: string; message: string; timestamp: number }>;
  maxEntries?: number;
  focused?: boolean;
}) {
  const levelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'red';
      case 'warn':
        return 'yellow';
      case 'info':
        return 'cyan';
      case 'debug':
        return 'gray';
      default:
        return 'white';
    }
  };

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

/** @brief Input pane — text input with submit. @since 0.2.6 */
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

/** @brief Chart pane — simple bar chart. @since 0.2.6 */
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

export function GridPane({
  items,
  columns = 3,
}: {
  items: Array<{ id: string; content: React.ReactNode }>;
  columns?: number;
}) {
  const rows: (typeof items)[] = [];
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }
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
/** @brief Re-export all pane components from barrel. @since 0.2.6 */
export { CodeViewer, type CodeViewerProps } from './top/code-viewer/code-viewer';
export { Header } from './top/header/header';
export { Dag } from './top/dag/dag';
export { Detail } from './top/detail/detail';
export { FileTree } from './top/file-tree/file-tree';
export { MetricsPane } from './top/metrics/metrics';
export { Critics } from './middle/critics/critics';
export { Eval } from './middle/eval/eval';
export { DiffViewer } from './middle/diff/diff';
export { TerminalPane } from './middle/terminal/terminal';
export { NetworkPane } from './middle/network/network';
export { HelpPane, HelpPane as Help } from './bottom/help/help';
export { Log } from './bottom/log/log';
export { SessionsPane } from './middle/sessions/sessions';
export { MemoryPane } from './middle/memory/memory';
export { SettingsPane } from './middle/settings/settings';
export { OrchPane } from './middle/orch/orch';
export { BudgetPane } from './middle/budget/budget';
export { LoopPane } from './middle/loop/loop';
export { ReleasePane } from './middle/release/release';
export { AgentRosterPane } from './middle/roster/roster';
export { SkillBrowserPane } from './middle/skills/skills';
export { McpPane } from './middle/mcp/mcp';
export { ReviewPane } from './middle/review/review';
export { TracePane } from './middle/trace/trace';
export { DashboardPane } from './middle/dashboard/dashboard';
export { Pr } from './middle/pr/pr';
export { AgentPane } from './middle/agent/agent';
