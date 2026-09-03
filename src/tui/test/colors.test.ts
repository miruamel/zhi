import { describe, it, expect } from 'bun:test';
import { colors, type ColorToken } from '../core/colors';

describe('tui colors', () => {
  it('has all expected tokens', () => {
    const keys = Object.keys(colors) as ColorToken[];
    expect(keys).toContain('bg');
    expect(keys).toContain('fg');
    expect(keys).toContain('accent');
    expect(keys).toContain('error');
    expect(keys).toContain('done');
    expect(keys).toContain('failed');
  });

  it('uses valid ANSI color names', () => {
    expect(colors.bg).toBe('black');
    expect(colors.fg).toBe('white');
    expect(colors.accent).toBe('green');
    expect(colors.error).toBe('red');
    expect(colors.complete).toBe('greenBright');
  });

  it('state colors are consistent', () => {
    expect(colors.running).toBe('yellow');
    expect(colors.done).toBe('green');
    expect(colors.pending).toBe('gray');
    expect(colors.failed).toBe('red');
    expect(colors.scoring).toBe('magenta');
  });

  it('has 15 color tokens', () => {
    expect(Object.keys(colors)).toHaveLength(15);
  });
});
