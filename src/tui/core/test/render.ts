/**
 * @brief Test render helper — render ink elements to string for assertions.
 * @since 0.2.0
 */
import TestRenderer from 'react-test-renderer';
import type { ReactNode } from 'react';

/** @brief Render a component tree to string via react-test-renderer. */
export function renderToString(el: ReactNode): string {
  const renderer = TestRenderer.create(el as any);
  const json = renderer.toJSON();
  return extractText(json);
}

/** @brief Recursively extract text from test renderer JSON. */
function extractText(node: any): string {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object') {
    if (node.children) return extractText(node.children);
    return '';
  }
  return '';
}
