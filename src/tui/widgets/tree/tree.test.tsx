/**
 * @fileoverview Tree tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { Tree } from './tree';
import { renderToString } from '../../core/test/render';

describe('Tree', () => {
  it('renders nodes with labels', () => {
    const out = renderToString(Tree({
      nodes: [{ id: '1', label: 'root', children: [{ id: '2', label: 'child' }] }],
    }));
    expect(out).toContain('root');
    expect(out).toContain('child');
  });

  it('renders file icon for leaf nodes', () => {
    const out = renderToString(Tree({
      nodes: [{ id: '1', label: 'file.txt' }],
    }));
    expect(out).toContain('file.txt');
  });
});