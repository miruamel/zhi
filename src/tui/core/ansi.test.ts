import { describe, expect, test } from 'bun:test';
import {
  ANSI_PATTERN,
  stripAnsi,
  parseAnsi,
  measureWidth,
  padVisible,
  truncateVisible,
} from './ansi/index.ts';

describe('ANSI_PATTERN', () => {
  test('matches CSI SGR sequences', () => {
    expect('\x1b[31m'.match(ANSI_PATTERN)).not.toBeNull();
  });

  test('matches OSC sequences terminated by BEL', () => {
    expect('\x1b]0;title\x07'.match(ANSI_PATTERN)).not.toBeNull();
  });

  test('does not match plain text', () => {
    expect('hello'.match(ANSI_PATTERN)).toBeNull();
  });

  test('matches multiple-parameter SGR', () => {
    expect('\x1b[1;31;42m'.match(ANSI_PATTERN)).not.toBeNull();
  });
});

describe('stripAnsi', () => {
  test('removes color codes', () => {
    expect(stripAnsi('\x1b[31mred\x1b[0m')).toBe('red');
  });

  test('removes OSC sequences entirely', () => {
    expect(stripAnsi('before\x1b]0;title\x07after')).toBe('beforeafter');
  });

  test('leaves plain text untouched', () => {
    expect(stripAnsi('plain')).toBe('plain');
  });

  test('removes multiple escapes', () => {
    expect(stripAnsi('\x1b[1m\x1b[31mbold red\x1b[0m normal')).toBe('bold red normal');
  });

  test('handles empty string', () => {
    expect(stripAnsi('')).toBe('');
  });
});

describe('parseAnsi', () => {
  test('plain text yields single segment', () => {
    const segs = parseAnsi('hello');
    expect(segs).toHaveLength(1);
    expect(segs[0]?.text).toBe('hello');
    expect(segs[0]?.style).toEqual({});
  });

  test('SGR color sets style.color', () => {
    const segs = parseAnsi('\x1b[31mred\x1b[0m');
    expect(segs).toHaveLength(1);
    expect(segs[0]?.style.color).toBe('red');
    expect(segs[0]?.text).toBe('red');
  });

  test('bold + italic combines', () => {
    const segs = parseAnsi('\x1b[1;3mboth\x1b[0m');
    expect(segs[0]?.style.bold).toBe(true);
    expect(segs[0]?.style.italic).toBe(true);
  });

  test('reset clears all style', () => {
    const segs = parseAnsi('\x1b[1mbold\x1b[0mnormal');
    expect(segs).toHaveLength(2);
    expect(segs[1]?.text).toBe('normal');
    expect(segs[1]?.style).toEqual({});
  });

  test('dim sets style.dim', () => {
    const segs = parseAnsi('\x1b[2mdim\x1b[0m');
    expect(segs[0]?.style.dim).toBe(true);
  });

  test('bright color uses brightX palette', () => {
    const segs = parseAnsi('\x1b[91mbright\x1b[0m');
    expect(segs[0]?.style.color).toBe('brightRed');
  });

  test('256-color SGR (mode 5) sets hex', () => {
    const segs = parseAnsi('\x1b[38;5;196mtext\x1b[0m');
    expect(segs[0]?.style.color).toMatch(/^#[0-9a-f]{6}$/);
  });

  test('truecolor SGR (mode 2) sets hex', () => {
    const segs = parseAnsi('\x1b[38;2;255;128;64morange\x1b[0m');
    expect(segs[0]?.style.color).toBe('#ff8040');
  });

  test('22 clears bold and dim', () => {
    const segs = parseAnsi('\x1b[1;2mboth\x1b[22mclean');
    expect(segs[1]?.style.bold).toBeUndefined();
    expect(segs[1]?.style.dim).toBeUndefined();
  });

  test('39 resets color only', () => {
    const segs = parseAnsi('\x1b[1;31mbold-red\x1b[39mnocolor');
    expect(segs[1]?.style.bold).toBe(true);
    expect(segs[1]?.style.color).toBeUndefined();
  });

  test('adjacent same-style segments merge', () => {
    const segs = parseAnsi('\x1b[31mfoo\x1b[31mbar\x1b[0m');
    expect(segs).toHaveLength(1);
    expect(segs[0]?.text).toBe('foobar');
    expect(segs[0]?.style.color).toBe('red');
  });

  test('OSC sequences are dropped, not styled', () => {
    const segs = parseAnsi('a\x1b]0;title\x07b');
    expect(segs[0]?.text).toBe('ab');
  });

  test('non-m CSI (cursor moves) consume bytes but produce no style change', () => {
    const segs = parseAnsi('\x1b[2Jclear\x1b[0m');
    expect(segs).toHaveLength(1);
    expect(segs[0]?.text).toBe('clear');
  });

  test('empty SGR is treated as reset', () => {
    const segs = parseAnsi('\x1b[31mred\x1b[mplain');
    expect(segs[1]?.style).toEqual({});
  });
});

describe('measureWidth', () => {
  test('plain ASCII counts one per char', () => {
    expect(measureWidth('hello')).toBe(5);
  });

  test('strips ANSI before measuring', () => {
    expect(measureWidth('\x1b[31mhello\x1b[0m')).toBe(5);
  });

  test('CJK chars count as 2', () => {
    expect(measureWidth('中文')).toBe(4);
  });

  test('mixed ASCII + CJK', () => {
    expect(measureWidth('a中b')).toBe(4);
  });

  test('empty string is zero', () => {
    expect(measureWidth('')).toBe(0);
  });

  test('strips OSC sequences', () => {
    expect(measureWidth('a\x1b]0;t\x07b')).toBe(2);
  });

  test('box drawing char counts as 2', () => {
    expect(measureWidth('─')).toBe(2);
  });
});

describe('padVisible', () => {
  test('left-pads by default', () => {
    expect(padVisible('ab', '5')).toBe('ab   ');
  });

  test('right-pads with align=right', () => {
    expect(padVisible('ab', '5', 'right')).toBe('   ab');
  });

  test('center-pads', () => {
    expect(padVisible('ab', '6', 'center')).toBe('  ab  ');
  });

  test('center-pads odd fill (extra space right)', () => {
    expect(padVisible('a', '4', 'center')).toBe(' a  ');
  });

  test('no padding when already wider', () => {
    expect(padVisible('hello', '3')).toBe('hello');
  });

  test('exact width returns unchanged', () => {
    expect(padVisible('abc', '3')).toBe('abc');
  });

  test('accounts for ANSI when measuring', () => {
    expect(padVisible('\x1b[31mab\x1b[0m', '5')).toBe('\x1b[31mab\x1b[0m   ');
  });

  test('accounts for wide chars', () => {
    expect(padVisible('中', '4')).toBe('中  ');
  });

  test('invalid width defaults to 0', () => {
    expect(padVisible('abc', '')).toBe('abc');
  });
});

describe('truncateVisible', () => {
  test('returns input when shorter than width', () => {
    expect(truncateVisible('hi', 10)).toBe('hi');
  });

  test('truncates ASCII at width', () => {
    expect(truncateVisible('hello world', 5)).toBe('hell…');
  });

  test('preserves ANSI escape sequences', () => {
    const out = truncateVisible('\x1b[31mhello world\x1b[0m', 5);
    expect(stripAnsi(out)).toBe('hell…');
    expect(out).toContain('\x1b[');
  });

  test('closes style after ellipsis', () => {
    const out = truncateVisible('\x1b[31mhello world\x1b[0m', 5);
    expect(out.endsWith('\x1b[0m')).toBe(true);
  });
  test('custom ellipsis', () => {
    expect(truncateVisible('abcdef', 4, '...')).toBe('a...');
  });

  test('respects wide-char width (CJK counted as 2)', () => {
    const out = truncateVisible('中文测试', 5);
    expect(measureWidth(stripAnsi(out))).toBeLessThanOrEqual(5);
  });

  test('exact width returns unchanged', () => {
    expect(truncateVisible('abcde', 5)).toBe('abcde');
  });

  test('handles empty string', () => {
    expect(truncateVisible('', 5)).toBe('');
  });

  test('drops OSC sequences', () => {
    expect(truncateVisible('a\x1b]0;title\x07bcdef', 4)).toBe('abc…');
  });
});