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
      ],
    },
    { id: 'log', type: 'leaf', pane: 'log', size: 15 },
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
  'diff': { minSize: 10, maxSize: 60, resizable: true, collapsible: true },
  'terminal': { minSize: 5, maxSize: 40, resizable: true, collapsible: true },
  'metrics': { minSize: 10, maxSize: 50, resizable: true, collapsible: true },
  'agents': { minSize: 10, maxSize: 50, resizable: true, collapsible: true },
  'network': { minSize: 10, maxSize: 50, resizable: true, collapsible: true },
  notifications: { minSize: 3, maxSize: 15, resizable: false, collapsible: true },
  config: { minSize: 15, maxSize: 80, resizable: true, collapsible: true },
};