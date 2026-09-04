/**
 * @brief Unit: pure formatters (formatMs, formatScore, formatTokens, formatPct, bar, formatTime, truncate, pad). @since 0.1.2
 */
import { describe, expect, it } from 'bun:test';
import {
  bar,
  formatMs,
  formatPct,
  formatScore,
  formatTime,
  formatTokens,
  pad,
  truncate,
} from '../format';

describe('formatMs', () => {
  it('returns 0ms for negative', () => {
    expect(formatMs(-1)).toBe('0ms');
  });
  it('returns 0ms for NaN', () => {
    expect(formatMs(NaN)).toBe('0ms');
  });
  it('formats sub-second as ms', () => {
    expect(formatMs(456)).toBe('456ms');
    expect(formatMs(999)).toBe('999ms');
  });
  it('formats seconds', () => {
    expect(formatMs(1500)).toBe('1.5s');
    expect(formatMs(59999)).toBe('60.0s');
  });
  it('formats minutes+seconds', () => {
    expect(formatMs(61000)).toBe('1m 1s');
    expect(formatMs(125000)).toBe('2m 5s');
  });
});

describe('formatScore', () => {
  it('formats with 2 decimals', () => {
    expect(formatScore(0.84321)).toBe('0.84');
    expect(formatScore(1)).toBe('1.00');
    expect(formatScore(0)).toBe('0.00');
  });
  it('returns em-dash for NaN', () => {
    expect(formatScore(NaN)).toBe('—');
  });
  it('returns em-dash for Infinity', () => {
    expect(formatScore(Infinity)).toBe('—');
  });
});

describe('formatTokens', () => {
  it('returns plain number under 1000', () => {
    expect(formatTokens(42)).toBe('42');
    expect(formatTokens(999)).toBe('999');
  });
  it('returns k suffix for 1k–999k', () => {
    expect(formatTokens(1500)).toBe('1.5k');
    expect(formatTokens(12345)).toBe('12.3k');
  });
  it('returns M suffix for 1M+', () => {
    expect(formatTokens(1_500_000)).toBe('1.5M');
  });
  it('returns 0 for negative/NaN', () => {
    expect(formatTokens(-5)).toBe('0');
    expect(formatTokens(NaN)).toBe('0');
  });
});

describe('formatPct', () => {
  it('formats as percentage', () => {
    expect(formatPct(0.84)).toBe('84%');
    expect(formatPct(0.5)).toBe('50%');
    expect(formatPct(1)).toBe('100%');
    expect(formatPct(0)).toBe('0%');
  });
  it('returns em-dash for NaN', () => {
    expect(formatPct(NaN)).toBe('—');
  });
});

describe('bar', () => {
  it('renders full bar for 1.0', () => {
    expect(bar(1, 4)).toBe('████');
  });
  it('renders empty bar for 0', () => {
    expect(bar(0, 4)).toBe('░░░░');
  });
  it('renders half bar', () => {
    expect(bar(0.5, 4)).toBe('██░░');
  });
  it('returns all empty for NaN', () => {
    expect(bar(NaN, 4)).toBe('░░░░');
  });
  it('uses default width 12', () => {
    expect(bar(1)).toBe('████████████');
    expect(bar(0)).toBe('░░░░░░░░░░░░');
  });
  it('clamps out-of-range values', () => {
    expect(bar(2, 4)).toBe('████');
    expect(bar(-1, 4)).toBe('░░░░');
  });
});

describe('formatTime', () => {
  it('formats epoch seconds as HH:MM:SS', () => {
    // 2026-09-04 00:00:00 UTC = 1788547200000
    const ts = new Date('2026-09-04T00:00:00Z').getTime();
    expect(formatTime(ts)).toBe('00:00:00');
  });
  it('formats with padding', () => {
    const ts = new Date('2026-09-04T09:05:03Z').getTime();
    expect(formatTime(ts)).toBe('09:05:03');
  });
});

describe('truncate', () => {
  it('returns original if within max', () => {
    expect(truncate('hello', 10)).toBe('hello');
    expect(truncate('hello', 5)).toBe('hello');
  });
  it('truncates with ellipsis', () => {
    expect(truncate('hello world', 8)).toBe('hello w…');
  });
  it('handles max=0', () => {
    expect(truncate('abc', 0)).toBe('…');
  });
  it('handles max=1', () => {
    expect(truncate('abc', 1)).toBe('…');
  });
});

describe('pad', () => {
  it('pads with spaces to width', () => {
    expect(pad('a', 4)).toBe('a   ');
    expect(pad('abc', 5)).toBe('abc  ');
  });
  it('returns original if already at width', () => {
    expect(pad('abc', 3)).toBe('abc');
  });
  it('returns original if longer than width', () => {
    expect(pad('abcdef', 3)).toBe('abcdef');
  });
});
