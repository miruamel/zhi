/**
 * @fileoverview Arranger tree ops — pure functions on LayoutNode tree. @since 0.2.0
 * @package zhi
 */
import type { LayoutNode, LayoutConstraint, LayoutEvent, SplitDirection } from './types';
import { DEFAULT_LAYOUT } from './types';

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
export function findParent(
  node: LayoutNode,
  id: string,
): { parent: LayoutNode; index: number } | null {
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
  _constraints: Record<string, LayoutConstraint> = {},
): LayoutNode {
  const node = findNode(root, paneId);
  if (!node || node.type !== 'leaf') return root;
  const half = (node.size ?? 50) / 2;
  return replaceNode(root, paneId, {
    id: paneId,
    direction,
    type: 'split',
    children: [
      { id: `${paneId}-a`, type: 'leaf', pane: paneId, size: half },
      { id: `${paneId}-b`, type: 'leaf', pane: `${paneId}-child`, size: half },
    ],
  });
}

/** @brief Replace a node by id with a new node. @since 0.2.0 */
export function replaceNode(root: LayoutNode, id: string, replacement: LayoutNode): LayoutNode {
  if (root.id === id) return replacement;
  if (!root.children) return root;
  return {
    ...root,
    children: root.children.map((c) =>
      c.id === id ? replacement : replaceNode(c, id, replacement),
    ),
  };
}

/** @brief Apply a layout event to the tree. @since 0.2.0 */
export function applyEvent(
  root: LayoutNode,
  event: LayoutEvent,
  constraints: Record<string, LayoutConstraint> = {},
): LayoutNode {
  const next = cloneNode(root);
  switch (event.type) {
    case 'resize': {
      const node = findNode(next, event.id);
      if (node) {
        node.size = Math.max(
          constraints[event.id]?.minSize ?? 5,
          Math.min(constraints[event.id]?.maxSize ?? 95, event.size),
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
      if (parent?.parent?.children) {
        parent.parent.children = parent.parent.children.filter((_, i) => i !== parent.index);
      }
      return next;
    }
    case 'split': {
      return splitNode(next, event.id, event.direction, constraints);
    }
    case 'reset':
      return cloneNode(DEFAULT_LAYOUT);
    default:
      return next;
  }
}
