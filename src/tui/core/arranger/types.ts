/**
 * @fileoverview Arranger types — layout engine for pane splits.
 * @description Defines the layout node tree, split directions, and constraints.
 * @package zhi
 */

/** Split direction for a layout node */
export type SplitDirection = 'vertical' | 'horizontal';

export interface LayoutNode {
  id: string;
  type: 'leaf' | 'split';
  pane?: string;
  direction?: SplitDirection;
  children?: LayoutNode[];
  size?: number;
  minSize?: number;
  maxSize?: number;
  collapsed?: boolean;
}

/** Layout constraint applied to a node */
export interface LayoutConstraint {
  minSize?: number;
  maxSize?: number;
  resizable?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

/** Layout snapshot for serialization */
export interface LayoutSnapshot {
  root: LayoutNode;
  panes: Record<string, LayoutConstraint>;
  version: number;
}

/** Layout engine options */
export interface ArrangerOptions {
  defaultSplit?: SplitDirection;
  gutter?: number;
  minPaneSize?: number;
  maxDepth?: number;
}

/** Layout event kinds */
export type LayoutEvent =
  | { type: 'split'; id: string; direction: SplitDirection }
  | { type: 'close'; id: string }
  | { type: 'resize'; id: string; size: number }
  | { type: 'collapse'; id: string }
  | { type: 'expand'; id: string }
  | { type: 'swap'; idA: string; idB: string }
  | { type: 'reset' };

/** Layout change callback */
export type LayoutListener = (snapshot: LayoutSnapshot) => void;

/** Default layout: header | (dag | detail | critics | eval | pr) | log | status */
export const DEFAULT_LAYOUT: LayoutNode = {
  id: 'root',
  type: 'split',
  direction: 'vertical',
  children: [
    { id: 'header', type: 'leaf', pane: 'header', size: 6 },
    {
      id: 'middle',
      type: 'split',
      direction: 'horizontal',
      children: [
        { id: 'dag', type: 'leaf', pane: 'dag', size: 20 },
        { id: 'detail', type: 'leaf', pane: 'detail', size: 30 },
        { id: 'critics', type: 'leaf', pane: 'critics', size: 25 },
        { id: 'eval', type: 'leaf', pane: 'eval', size: 15 },
        { id: 'pr', type: 'leaf', pane: 'pr', size: 10 },
        { id: 'terminal', type: 'leaf', pane: 'terminal', size: 12 },
        { id: 'network', type: 'leaf', pane: 'network', size: 12 },
        { id: 'agents', type: 'leaf', pane: 'agents', size: 15 },
        { id: 'agent', type: 'leaf', pane: 'agent', size: 20 },
        { id: 'skills', type: 'leaf', pane: 'skills', size: 10 },
        { id: 'mcp', type: 'leaf', pane: 'mcp', size: 10 },
        { id: 'review', type: 'leaf', pane: 'review', size: 15 },
        { id: 'trace', type: 'leaf', pane: 'trace', size: 15 },
        { id: 'dashboard', type: 'leaf', pane: 'dashboard', size: 15 },
        { id: 'release', type: 'leaf', pane: 'release', size: 12 },
        { id: 'orch', type: 'leaf', pane: 'orch', size: 18 },
        { id: 'budget', type: 'leaf', pane: 'budget', size: 18 },
        { id: 'loop', type: 'leaf', pane: 'loop', size: 12 },
        { id: 'sessions', type: 'leaf', pane: 'sessions', size: 15 },
        { id: 'memory', type: 'leaf', pane: 'memory', size: 15 },
        { id: 'config', type: 'leaf', pane: 'config', size: 15 },
      ],
    },
    { id: 'log', type: 'leaf', pane: 'log', size: 15 },
    { id: 'help', type: 'leaf', pane: 'help', size: 5 },
    { id: 'statusbar', type: 'leaf', pane: 'statusbar', size: 3 },
  ],
};

/** Default constraints per pane */
export const DEFAULT_CONSTRAINTS: Record<string, LayoutConstraint> = {
  header: { minSize: 4, maxSize: 12, resizable: false, collapsible: false },
  dag: { minSize: 10, maxSize: 60, resizable: true, collapsible: true },
  detail: { minSize: 15, maxSize: 80, resizable: true, collapsible: true },
  critics: { minSize: 10, maxSize: 50, resizable: true, collapsible: true },
  eval: { minSize: 8, maxSize: 40, resizable: true, collapsible: true },
  pr: { minSize: 8, maxSize: 30, resizable: true, collapsible: true },
  log: { minSize: 5, maxSize: 40, resizable: true, collapsible: true },
  statusbar: { minSize: 2, maxSize: 5, resizable: false, collapsible: false },
  'command-palette': { minSize: 3, maxSize: 20, resizable: false, collapsible: false },
  'file-tree': { minSize: 10, maxSize: 50, resizable: true, collapsible: true },
  'code-viewer': { minSize: 15, maxSize: 90, resizable: true, collapsible: true },
  diff: { minSize: 10, maxSize: 60, resizable: true, collapsible: true },
  terminal: { minSize: 5, maxSize: 40, resizable: true, collapsible: true },
  metrics: { minSize: 10, maxSize: 50, resizable: true, collapsible: true },
  agents: { minSize: 10, maxSize: 50, resizable: true, collapsible: true },
  network: { minSize: 10, maxSize: 50, resizable: true, collapsible: true },
  notifications: { minSize: 3, maxSize: 15, resizable: false, collapsible: true },
  config: { minSize: 15, maxSize: 80, resizable: true, collapsible: true },
  agent: { minSize: 15, maxSize: 90, resizable: true, collapsible: true },
  skills: { minSize: 10, maxSize: 50, resizable: true, collapsible: true },
  mcp: { minSize: 10, maxSize: 50, resizable: true, collapsible: true },
  review: { minSize: 10, maxSize: 60, resizable: true, collapsible: true },
  trace: { minSize: 10, maxSize: 60, resizable: true, collapsible: true },
  dashboard: { minSize: 10, maxSize: 50, resizable: true, collapsible: true },
  release: { minSize: 10, maxSize: 40, resizable: true, collapsible: true },
  orch: { minSize: 15, maxSize: 80, resizable: true, collapsible: true },
  sessions: { minSize: 10, maxSize: 50, resizable: true, collapsible: true },
  memory: { minSize: 10, maxSize: 50, resizable: true, collapsible: true },
  config: { minSize: 15, maxSize: 80, resizable: true, collapsible: true },
  help: { minSize: 3, maxSize: 10, resizable: false, collapsible: false },
};
