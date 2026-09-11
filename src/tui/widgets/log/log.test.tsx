/**
 * @fileoverview Log viewer tests.
 * @since 0.1.12
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../core/test/render/render';
import { LogViewer } from './log';

const entries = [
  { ts: Date.now(), level: 'info' as const, message: 'hello world' },
  { ts: Date.now(), level: 'error' as const, message: 'something broke' },
  { ts: Date.now(), level: 'warn' as const, message: 'careful' },
];

describe('LogViewer', () => {
  it('renders all entries', () => {
    const out = renderToString(LogViewer({ entries }));
    expect(out).toContain('LOG');
    expect(out).toContain('hello world');
    expect(out).toContain('something broke');
    expect(out).toContain('careful');
  });

  it('shows empty state', () => {
    const out = renderToString(LogViewer({ entries: [] }));
    expect(out).toContain('no entries');
  });

  it('filters by level', () => {
    const out = renderToString(LogViewer({ entries, levels: new Set(['error']) }));
    expect(out).toContain('something broke');
    expect(out).not.toContain('hello world');
    expect(out).not.toContain('careful');
  });

  it('filters by search', () => {
    const out = renderToString(LogViewer({ entries, search: 'broke' }));
    expect(out).toContain('something broke');
    expect(out).not.toContain('hello world');
  });

  it('respects maxLines', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      ts: Date.now() + i,
      level: 'info' as const,
      message: `msg-${i}`,
    }));
    const out = renderToString(LogViewer({ entries: many, maxLines: 5 }));
    expect(out).toContain('hidden');
  });
});
