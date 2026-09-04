/** @brief Tests for ANSI_PATTERN (CSI SGR + OSC regex). @since 0.1.1 */
import { describe, expect, test } from 'bun:test';
import { ANSI_PATTERN } from '../index.ts';

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
