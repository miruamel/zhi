/**
 * @fileoverview Code Viewer pane tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { CodeViewer } from './code-viewer';
import { renderToString } from '../../../core/test/render';

describe('CodeViewer', () => {
  it('shows empty state when no content', () => {
    const out = renderToString(CodeViewer({}));
    expect(out).toContain('CODE');
    expect(out).toContain('no file loaded');
  });

  it('renders code with line numbers', () => {
    const out = renderToString(
      CodeViewer({
        content: 'const x = 1\nconst y = 2',
        path: 'test.ts',
      }),
    );
    expect(out).toContain('const');
    expect(out).toContain('test.ts');
  });
});
