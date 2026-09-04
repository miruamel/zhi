/** @brief Test resolveKey: maps key press to action. @since 0.1.0 */
import { describe, test, expect } from 'bun:test';
import { resolveKey, type KeyAction } from '../keymap';

describe('resolveKey', () => {
  test('maps single-char keys to actions', () => {
    expect(resolveKey('q', {})).toBe('quit');
    expect(resolveKey('l', {})).toBe('toggleLog');
    expect(resolveKey('c', {})).toBe('toggleCritics');
    expect(resolveKey('p', {})).toBe('togglePr');
    expect(resolveKey('r', {})).toBe('redraw');
    expect(resolveKey('j', {})).toBe('nextLog');
    expect(resolveKey('k', {})).toBe('prevLog');
    expect(resolveKey('g', {})).toBe('logTop');
    expect(resolveKey('G', {})).toBe('logBottom');
    expect(resolveKey(' ', {})).toBe('pauseResume');
    expect(resolveKey('tab', {})).toBe('cycle');
  });

  test('maps help keys to toggleHelp', () => {
    expect(resolveKey('h', {})).toBe('toggleHelp');
    expect(resolveKey('?', {})).toBe('toggleHelp');
  });

  test('maps escape to quit', () => {
    expect(resolveKey('escape', {})).toBe('quit');
  });

  test('maps enter to unknown', () => {
    expect(resolveKey('enter', {})).toBe('unknown');
  });

  test('maps unknown key to unknown', () => {
    expect(resolveKey('x', {})).toBe('unknown');
    expect(resolveKey('z', {})).toBe('unknown');
  });

  test('ctrl+c maps to abort', () => {
    expect(resolveKey('c', { ctrl: true })).toBe('abort');
  });

  test('ctrl+c does not abort when ctrl is false', () => {
    expect(resolveKey('c', { ctrl: false })).toBe('toggleCritics');
  });

  test('returns KeyAction type', () => {
    const action: KeyAction = resolveKey('q', {});
    expect(typeof action).toBe('string');
  });
});
