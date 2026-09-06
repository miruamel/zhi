/**
 * @fileoverview Terminal tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { Terminal } from './terminal';
import { renderToString } from '../../core/test/render';

describe('Terminal', () => {
  it('renders lines', () => {
    const out = renderToString(Terminal({ lines: ['echo hello', 'hello'] }));
    expect(out).toContain('echo');
    expect(out).toContain('hello');
  });

  it('limits to maxLines', () => {
    const lines = Array.from({ length: 30 }, (_, i) => `line ${i}`);
    const out = renderToString(Terminal({ lines, maxLines: 5 }));
    // Should only show last 5
    expect(out).toContain('line 29');
  });
});
