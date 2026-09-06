/**
 * @fileoverview Diff Viewer pane tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { DiffViewer, parseDiff } from './diff';
import { renderToString } from '../../../core/test/render';

describe('DiffViewer', () => {
  it('shows empty state when no diff', () => {
    const out = renderToString(DiffViewer({}));
    expect(out).toContain('DIFF');
    expect(out).toContain('no diff');
  });

  it('renders diff lines', () => {
    const out = renderToString(
      DiffViewer({
        diff: '+added\n-old',
      }),
    );
    expect(out).toContain('+');
    expect(out).toContain('-');
  });

  it('parses diff with context', () => {
    const lines = parseDiff('@@ -1,3 +1,3 @@\n context\n+added\n-old');
    expect(lines.length).toBeGreaterThan(0);
  });
});
