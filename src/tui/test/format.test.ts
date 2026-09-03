import { describe, it, expect } from 'bun:test';
import {
  formatMs,
  formatScore,
  formatTokens,
  formatPct,
  bar,
  formatTime,
  truncate,
  pad,
} from '../core/format';

describe('tui format', () => {
  describe('formatMs', () => {
    it('returns 0ms for negative', () => {
      expect(formatMs(-1)).toBe('0ms');
    });
    it('returns 0ms for NaN', () => {
      expect(formatMs(NaN)).toBe('0ms');
    });
    it('formats sub-second as ms', () => {
      expect(formatMs(0)).toBe('0ms');
      expect(formatMs(500)).toBe('500ms');
      expect(formatMs(999)).toBe('999ms');
    });
    it('formats seconds with one decimal', () => {
      expect(formatMs(1000)).toBe('1.0s');
      expect(formatMs(1500)).toBe('1.5s');
      expect(formatMs(59999)).toBe('60.0s');
    });
    it('formats minutes and seconds', () => {
      expect(formatMs(60000)).toBe('1m 0s');
      expect(formatMs(61000)).toBe('1m 1s');
      expect(formatMs(125000)).toBe('2m 5s');
    });
  });

  describe('formatScore', () => {
    it('formats valid scores', () => {
      expect(formatScore(0)).toBe('0.00');
      expect(formatScore(0.5)).toBe('0.50');
      expect(formatScore(0.84)).toBe('0.84');
      expect(formatScore(1)).toBe('1.00');
    });
    it('returns em-dash for NaN', () => {
      expect(formatScore(NaN)).toBe('—');
    });
    it('returns em-dash for Infinity', () => {
      expect(formatScore(Infinity)).toBe('—');
    });
  });

  describe('formatTokens', () => {
    it('returns plain number for small values', () => {
      expect(formatTokens(0)).toBe('0');
      expect(formatTokens(999)).toBe('999');
    });
    it('formats thousands with k suffix', () => {
      expect(formatTokens(1000)).toBe('1.0k');
      expect(formatTokens(1500)).toBe('1.5k');
      expect(formatTokens(999999)).toBe('1000.0k');
    });
    it('formats millions with M suffix', () => {
      expect(formatTokens(1000000)).toBe('1.0M');
      expect(formatTokens(2500000)).toBe('2.5M');
    });
    it('returns 0 for negative or NaN', () => {
      expect(formatTokens(-1)).toBe('0');
      expect(formatTokens(NaN)).toBe('0');
    });
  });

  describe('formatPct', () => {
    it('formats as percentage', () => {
      expect(formatPct(0)).toBe('0%');
      expect(formatPct(0.5)).toBe('50%');
      expect(formatPct(0.84)).toBe('84%');
      expect(formatPct(1)).toBe('100%');
    });
    it('returns em-dash for NaN', () => {
      expect(formatPct(NaN)).toBe('—');
    });
  });

  describe('bar', () => {
    it('returns all empty for NaN', () => {
      expect(bar(NaN, 4)).toBe('░░░░');
    });
    it('returns all filled for 1.0', () => {
      expect(bar(1, 4)).toBe('████');
    });
    it('returns all empty for 0', () => {
      expect(bar(0, 4)).toBe('░░░░');
    });
    it('returns half filled for 0.5', () => {
      expect(bar(0.5, 4)).toBe('██░░');
    });
    it('uses default width of 12', () => {
      expect(bar(1)).toBe('████████████');
      expect(bar(0)).toBe('░░░░░░░░░░░░');
    });
    it('clamps values outside 0..1', () => {
      expect(bar(-0.5, 4)).toBe('░░░░');
      expect(bar(1.5, 4)).toBe('████');
    });
  });

  describe('formatTime', () => {
    it('formats timestamp as HH:MM:SS', () => {
      const ts = new Date('2024-01-01T12:30:45Z').getTime();
      const result = formatTime(ts);
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('truncate', () => {
    it('returns short strings unchanged', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });
    it('returns exact-length strings unchanged', () => {
      expect(truncate('hello', 5)).toBe('hello');
    });
    it('truncates long strings with ellipsis', () => {
      expect(truncate('hello world', 5)).toBe('hell…');
    });
    it('handles max of 0 or 1', () => {
      expect(truncate('hello', 0)).toBe('…');
      expect(truncate('hello', 1)).toBe('…');
    });
  });

  describe('pad', () => {
    it('pads short strings to width', () => {
      expect(pad('hi', 5)).toBe('hi   ');
    });
    it('returns exact-width strings unchanged', () => {
      expect(pad('hello', 5)).toBe('hello');
    });
    it('returns long strings unchanged', () => {
      expect(pad('hello world', 5)).toBe('hello world');
    });
  });
});
