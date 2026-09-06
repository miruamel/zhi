/**
 * @fileoverview Code tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { Code } from './code';
import { renderToString } from '../../core/test/render';

describe('Code', () => {
  it('renders line numbers', () => {
    const out = renderToString(Code({
      lines: [{ number: 1, content: 'const x = 1' }],
    }));
    expect(out).toContain('1');
    expect(out).toContain('const');
  });

  it('renders multiple lines', () => {
    const out = renderToString(Code({
      lines: [
        { number: 1, content: 'const a = 1' },
        { number: 2, content: 'const b = 2' },
      ],
    }));
    expect(out).toContain('a = 1');
    expect(out).toContain('b = 2');
  });
});