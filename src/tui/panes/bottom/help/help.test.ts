import { describe, it, expect } from 'bun:test';
import { renderToString } from "../../../core/test/render";
import { Help } from './help';

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
