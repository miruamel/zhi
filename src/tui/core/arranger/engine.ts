/**
 * @fileoverview Arranger engine — manages layout node tree with splits, resizes, collapses.
 * @description Pure function engine; no React dependency. Operates on LayoutNode tree.
 * @package zhi
 */

import type {
  LayoutNode,
  LayoutSnapshot,
  LayoutConstraint,
  LayoutEvent,
  SplitDirection,
} from './types';

/** @brief Find a node by id in the tree. @since 0.2.0 */
export function findNode(node: LayoutNode, id: string): LayoutNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const c of node.children) {
      const found = findNode(c, id);
      if (found) return found;
    }
  }
  return null;
}

/** @brief Find parent of a node. @since 0.2.0 */
export function findParent(node: LayoutNode, id: string): { parent: LayoutNode; index: number } | null {
  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].id === id) return { parent: node, index: i };
      const found = findParent(node.children[i], id);
      if (found) return found;
    }
  }
  return null;
}

/** @brief Compute total size of a node's children. @since 0.2.0 */
export function totalSize(node: LayoutNode): number {
  if (!node.children) return node.size ?? 0;
  return node.children.reduce((sum, c) => sum + (c.size ?? 0), 0);
}

/** @brief Clone a layout node tree (deep copy). @since 0.2.0 */
export function cloneNode(node: LayoutNode): LayoutNode {
  return {
    ...node,
    children: node.children ? node.children.map(cloneNode) : undefined,
  };
}

/** @brief Split a leaf node into two children. @since 0.2.0 */
export function splitNode(
  root: LayoutNode,
  paneId: string,
  direction: SplitDirection,
  constraints: Record<string, LayoutConstraint> = {}
): LayoutNode {
  const node = findNode(root, paneId);
  if (!node || node.type !== 'leaf') return root;
  const cons = constraints[paneId] ?? { minSize: 5, maxSize: 95 };
  const half = (node.size ?? 50) / 2;
  return replaceNode(root, paneId, {
    id: paneId,
    type: 'split',
    direction,
    children: [
      { id: `${paneId}-a`, type: 'leaf', pane: paneId, size: half },
      { id: `${paneId}-b`, type: 'leaf', pane: `${paneId}-child`, size: half },
    ],
  });
}

/** @brief Replace a node by id with a new node. @since 0.2.0 */
function replaceNode(root: LayoutNode, id: string, replacement: LayoutNode): LayoutNode {
  if (root.id === id) return replacement;
  if (!root.children) return root;
  return {
    ...root,
    children: root.children.map((c) => (c.id === id ? replacement : replaceNode(c, id, replacement))),
  };
}

/** @brief Apply a layout event to the tree. @since 0.2.0 */
export function applyEvent(
  root: LayoutNode,
  event: LayoutEvent,
  constraints: Record<string, LayoutConstraint> = {}
): LayoutNode {
  const next = cloneNode(root);
  switch (event.type) {
    case 'resize': {
      const node = findNode(next, event.id);
      if (node) {
        node.size = Math.max(
          constraints[event.id]?.minSize ?? 5,
          Math.min(constraints[event.id]?.maxSize ?? 95, event.size)
        );
      }
      return next;
    }
    case 'collapse':
    case 'expand': {
      const node = findNode(next, event.id);
      if (node) {
        node.collapsed = event.type === 'collapse';
      }
      return next;
    }
    case 'swap': {
      const a = findNode(next, event.idA);
      const b = findNode(next, event.idB);
      if (a && b) {
        const tmp = a.pane;
        a.pane = b.pane;
        b.pane = tmp;
      }
      return next;
    }
    case 'close': {
      const parent = findParent(next, event.id);
      if (parent) {
        parent.parent.children = parent.parent.children.filter((_, i) => i !== parent.index);
      }
      return next;
    }
    case 'split': {
      return splitNode(next, event.id, event.direction, constraints);
    }
    case 'reset':
      return cloneNode(require('./types').DEFAULT_LAYOUT);
    default:
      return next;
  }
}

/** @brief Arranger engine — manages layout state and notifies listeners. @since 0.2.0 */
export class Arranger {
  private root: LayoutNode;
  private listeners: ((snapshot: LayoutSnapshot) => void)[] = [];
  private constraints: Record<string, LayoutConstraint>;

  constructor(
    options: { constraints?: Record<string, LayoutConstraint> } = {},
    initial?: LayoutNode
  ) {
    const { DEFAULT_LAYOUT, DEFAULT_CONSTRAINTS } = require('./types');
    this.root = cloneNode(initial ?? DEFAULT_LAYOUT);
    this.constraints = { ...DEFAULT_CONSTRAINTS, ...(options.constraints ?? {}) };
  }

  /** @brief Get current layout snapshot. @since 0.2.0 */
  snapshot(): LayoutSnapshot {
    return {
      root: cloneNode(this.root),
      panes: { ...this.constraints },
      version: 1,
    };
  }
  /** @brief Find a node by id in the current tree. @since 0.2.0 */
  findNode(id: string): LayoutNode | null {
    return findNode(this.root, id);
  }

  /** @brief Find parent of a node. @since 0.2.0 */
  findParent(id: string): { parent: LayoutNode; index: number } | null {
    return findParent(this.root, id);
  }


  /** @brief Subscribe to layout changes. @since 0.2.0 */
  subscribe(listener: (snapshot: LayoutSnapshot) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
  /** @brief Apply a layout event and notify. @since 0.2.0 */
  dispatch(event: LayoutEvent): void {
    this.root = applyEvent(this.root, event, this.constraints);
    const next = this.snapshot();
    for (const l of this.listeners) l(next);
  }
  /** @brief Get visible pane ids in order. @since 0.2.0 */
  visiblePanes(): string[] {
    const result: string[] = [];
    const walk = (node: LayoutNode) => {
      if (node.type === 'leaf' && node.pane && !node.collapsed) result.push(node.pane);
      if (node.children) node.children.forEach(walk);
    };
    walk(this.root);
    return result;
  }

  /** @brief Reset to default layout. @since 0.2.0 */
  reset(): void {
    this.dispatch({ type: 'reset' });
  }
}
