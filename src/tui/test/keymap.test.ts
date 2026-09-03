import { describe, it, expect } from 'bun:test';
import { resolveKey, type KeyAction } from '../core/keymap';

describe('tui keymap', () => {
  it('maps single-char keys', () => {
    expect(resolveKey('q', {})).toBe('quit');
    expect(resolveKey('l', {})).toBe('toggleLog');
    expect(resolveKey('c', {})).toBe('toggleCritics');
    expect(resolveKey('p', {})).toBe('togglePr');
    expect(resolveKey('h', {})).toBe('toggleHelp');
    expect(resolveKey('r', {})).toBe('redraw');
    expect(resolveKey('j', {})).toBe('nextLog');
    expect(resolveKey('k', {})).toBe('prevLog');
    expect(resolveKey('g', {})).toBe('logTop');
    expect(resolveKey('G', {})).toBe('logBottom');
  });

  it('maps special keys', () => {
    expect(resolveKey('?', {})).toBe('toggleHelp');
    expect(resolveKey(' ', {})).toBe('pauseResume');
    expect(resolveKey('tab', {})).toBe('cycle');
  });

  it('maps escape to quit', () => {
    expect(resolveKey('escape', {})).toBe('quit');
  });

  it('maps ctrl+c to abort', () => {
    expect(resolveKey('c', { ctrl: true })).toBe('abort');
  });

  it('returns unknown for unmapped keys', () => {
    expect(resolveKey('x', {})).toBe('unknown');
    expect(resolveKey('a', {})).toBe('unknown');
    expect(resolveKey('', {})).toBe('unknown');
  });

  it('ctrl+c takes precedence over regular mapping', () => {
    expect(resolveKey('c', { ctrl: true })).toBe('abort');
    expect(resolveKey('c', {})).toBe('toggleCritics');
  });

  it('returns KeyAction type for all valid inputs', () => {
    const actions: KeyAction[] = [];
    for (const key of [
      'q',
      'l',
      'c',
      'p',
      'h',
      '?',
      ' ',
      'r',
      'j',
      'k',
      'g',
      'G',
      'tab',
      'escape',
      'x',
    ]) {
      actions.push(resolveKey(key, {}));
    }
    expect(actions).toHaveLength(15);
    expect(actions.every((a) => typeof a === 'string')).toBe(true);
  });
});
