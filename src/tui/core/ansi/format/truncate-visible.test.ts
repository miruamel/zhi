/** @brief Tests for truncateVisible (visible-width truncate, preserves ANSI). @since 0.1.1 */
import { describe, expect, test } from 'bun:test';
import { stripAnsi, truncateVisible, measureWidth } from '../index.ts';

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
