import { describe, it, expect } from 'bun:test';
import { render } from 'ink';
import type { ReactNode } from 'react';
import { Log } from '../bottom/log';
import type { LogEntry } from '../../core/state';

/** @brief Render ink element to string by overriding stdout. */
function renderToString(el: ReactNode): string {
  const chunks: string[] = [];
  const stdout = {
    write: (chunk: string) => {
      chunks.push(chunk);
      return true;
    },
  };
  const inst = render(el as any, { stdout: stdout as any });
  inst.unmount();
  return chunks.join('');
}

describe('Log', () => {
  it('shows no-events message when empty', () => {
    const out = renderToString(Log({ log: [], expanded: false, maxLines: 8 }) as any);
    expect(out).toContain('no events yet');
  });

  it('shows entry count', () => {
    const entries: LogEntry[] = [{ ts: Date.now(), runId: 'r1', kind: 'info', msg: 'test' }];
    const out = renderToString(Log({ log: entries, expanded: false, maxLines: 8 }) as any);
    expect(out).toContain('1 entries');
  });

  it('shows log message', () => {
    const entries: LogEntry[] = [{ ts: Date.now(), runId: 'r1', kind: 'info', msg: 'hello world' }];
    const out = renderToString(Log({ log: entries, expanded: false, maxLines: 8 }) as any);
    expect(out).toContain('hello world');
  });

  it('shows log kind', () => {
    const entries: LogEntry[] = [{ ts: Date.now(), runId: 'r1', kind: 'error', msg: 'test' }];
    const out = renderToString(Log({ log: entries, expanded: false, maxLines: 8 }) as any);
    expect(out).toContain('error');
  });

  it('shows hidden count when more entries than maxLines', () => {
    const entries: LogEntry[] = Array.from({ length: 20 }, (_, i) => ({
      ts: Date.now() + i,
      runId: 'r1',
      kind: 'info' as const,
      msg: `entry ${i}`,
    }));
    const out = renderToString(Log({ log: entries, expanded: false, maxLines: 3 }) as any);
    expect(out).toContain('hidden');
  });

  it('shows all entries when expanded', () => {
    const entries: LogEntry[] = Array.from({ length: 5 }, (_, i) => ({
      ts: Date.now() + i,
      runId: 'r1',
      kind: 'info' as const,
      msg: `msg-${i}`,
    }));
    const out = renderToString(Log({ log: entries, expanded: true, maxLines: 100 }) as any);
    expect(out).toContain('msg-0');
    expect(out).toContain('msg-4');
  });
});
