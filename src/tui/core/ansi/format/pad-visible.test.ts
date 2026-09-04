/** @brief Tests for padVisible (visible-width padding with ANSI + CJK). @since 0.1.1 */
import { describe, expect, test } from 'bun:test';
import { padVisible } from '../index.ts';

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
