/**
 * @fileoverview Diff tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { Diff, parseDiff } from './diff';
import { renderToString } from '../../core/test/render';

describe('Diff', () => {
  it('renders added lines with +', () => {
    const out = renderToString(Diff({ lines: [{ type: 'added', content: 'new line' }] }));
    expect(out).toContain('+');
    expect(out).toContain('new line');
  });

  it('renders removed lines with -', () => {
    const out = renderToString(Diff({ lines: [{ type: 'removed', content: 'old line' }] }));
    expect(out).toContain('-');
    expect(out).toContain('old line');
  });
});

describe('parseDiff', () => {
  it('parses added lines', () => {
    const lines = parseDiff('+added\n-old\n context');
    expect(lines).toHaveLength(3);
    expect(lines[0].type).toBe('added');
    expect(lines[1].type).toBe('removed');
    expect(lines[2].type).toBe('context');
  });

  it('handles empty diff', () => {
    const lines = parseDiff('');
    expect(lines).toHaveLength(0);
  });
});