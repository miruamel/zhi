/** @brief Tests for measureWidth (visible width, ANSI + CJK aware). @since 0.1.1 */
import { describe, expect, test } from 'bun:test';
import { measureWidth } from '../index';

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
