/**
 * @brief Unit: color tokens — type-level smoke test. @since 0.1.2
 */
import { describe, expect, it } from 'bun:test';
import { colors, type ColorToken } from '../colors';

describe('colors', () => {
  it('exports all expected tokens', () => {
    expect(colors.bg).toBe('black');
    expect(colors.fg).toBe('white');
    expect(colors.error).toBe('red');
    expect(colors.done).toBe('green');
    expect(colors.complete).toBe('greenBright');
  });

  it('ColorToken type covers all keys', () => {
    const keys: ColorToken[] = [
      'bg',
      'fg',
      'fgDim',
      'accent',
      'accentBlue',
      'warn',
      'error',
      'running',
      'done',
      'pending',
      'failed',
      'scoring',
      'forward',
      'commit',
      'complete',
    ];
    expect(keys).toHaveLength(Object.keys(colors).length);
  });
});
