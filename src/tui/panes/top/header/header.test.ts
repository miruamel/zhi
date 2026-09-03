import { describe, it, expect } from 'bun:test';
import { render } from 'ink';
import type { ReactNode } from 'react';
import { Header } from './header';

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

describe('Header', () => {
  const baseProps = {
    loop: 'INTAKE',
    goal: 'test goal',
    startedAt: 1700000000000,
    finished: false,
    aborted: false,
  };

  it('shows RUNNING state', () => {
    const out = renderToString(Header(baseProps) as any);
    expect(out).toContain('RUNNING');
  });

  it('shows DONE state when finished', () => {
    const out = renderToString(Header({ ...baseProps, finished: true }) as any);
    expect(out).toContain('DONE');
  });

  it('shows ABORTED state when aborted', () => {
    const out = renderToString(Header({ ...baseProps, aborted: true }) as any);
    expect(out).toContain('ABORTED');
  });

  it('shows loop name', () => {
    const out = renderToString(Header({ ...baseProps, loop: 'GENERATE' }) as any);
    expect(out).toContain('GENERATE');
  });

  it('shows goal text', () => {
    const out = renderToString(Header(baseProps) as any);
    expect(out).toContain('test goal');
  });

  it('shows elapsed time', () => {
    const out = renderToString(Header(baseProps) as any);
    expect(out).toContain('elapsed');
  });
});
