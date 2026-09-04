/** @brief Tests for stripAnsi (removes CSI + OSC sequences). @since 0.1.1 */
import { describe, expect, test } from 'bun:test';
import { stripAnsi } from '../index';

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
