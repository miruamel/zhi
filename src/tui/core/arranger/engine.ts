/**
 * @fileoverview Arranger engine — manages layout state and notifies listeners. @since 0.2.0
 * @package zhi
 */
import type { LayoutNode, LayoutSnapshot, LayoutConstraint, LayoutEvent } from './types';
import { cloneNode, findNode, findParent, applyEvent } from './tree';

/** @brief Arranger engine — manages layout state and notifies listeners. @since 0.2.0 */
export class Arranger {
  private root: LayoutNode;
  private listeners: ((snapshot: LayoutSnapshot) => void)[] = [];
  private constraints: Record<string, LayoutConstraint>;

  constructor(
    options: { constraints?: Record<string, LayoutConstraint> } = {},
    initial?: LayoutNode,
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
