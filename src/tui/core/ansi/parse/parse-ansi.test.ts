/** @brief Tests for parseAnsi (SGR → styled segments). @since 0.1.1 */
import { describe, expect, test } from 'bun:test';
import { parseAnsi } from '../index.ts';

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
