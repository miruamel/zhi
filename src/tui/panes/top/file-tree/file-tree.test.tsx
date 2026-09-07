/**
 * @fileoverview File Tree pane tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { FileTree, buildTree } from './file-tree';
import { renderToString } from '../../../core/test/render';

describe('FileTree', () => {
  it('renders file list', () => {
    const out = renderToString(
      FileTree({
        files: [{ path: 'src/index.ts', type: 'file' }],
      }),
    );
    expect(out).toContain('FILES');
    expect(out).toContain('index.ts');
  });

  it('builds tree from flat list', () => {
    const nodes = buildTree([
      { path: 'src/a.ts', type: 'file' },
      { path: 'src/b.ts', type: 'file' },
    ]);
    expect(nodes.length).toBeGreaterThan(0);
  });
});
