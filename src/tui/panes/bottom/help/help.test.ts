import { describe, it, expect } from 'bun:test';
import { render } from 'ink';
import type { ReactNode } from 'react';
import { Help } from './help';

/** @brief Render ink element to string by overriding stdout. */
function renderToString(el: ReactNode): string {
  const chunks: string[] = [];
  const stdout = {
    write: (chunk: string) => {
      chunks.push(chunk);
      return true;
    },
    on: () => {},
    off: () => {},
  } as any;
  const inst = render(el as any, { stdout });
  inst.unmount();
  return chunks.join('');
}

describe('Help', () => {
  it('shows compact help by default', () => {
    const out = renderToString(Help({}) as any);
    expect(out).toContain('keys');
    expect(out).toContain('uit');
  });

  it('shows keybindings in expanded mode', () => {
    const out = renderToString(Help({ showHelp: true }) as any);
    expect(out).toContain('KEYBINDINGS');
  });

  it('shows PAUSED when paused', () => {
    const out = renderToString(Help({ paused: true }) as any);
    expect(out).toContain('PAUSED');
  });

  it('shows PAUSED in expanded mode', () => {
    const out = renderToString(Help({ showHelp: true, paused: true }) as any);
    expect(out).toContain('PAUSED');
  });

  it('shows toggle keys in compact mode', () => {
    const out = renderToString(Help({}) as any);
    expect(out).toContain('l/c/p/h');
    expect(out).toContain('panels');
  });

  it('shows keybinding descriptions in expanded mode', () => {
    const out = renderToString(Help({ showHelp: true }) as any);
    expect(out).toContain('pause');
    expect(out).toContain('abort');
  });
});
