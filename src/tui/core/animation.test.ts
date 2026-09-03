import { describe, expect, test } from 'bun:test';
import {
  EASING,
  createAnimation,
  easeIn,
  easeInOut,
  easeOut,
  isDone,
  linear,
  spring,
  stepAnimation,
  tween,
  type Animation,
} from './animation';

describe('EASING bundle', () => {
  test('contains every built-in easing', () => {
    expect(EASING.linear).toBe(linear);
    expect(EASING.easeIn).toBe(easeIn);
    expect(EASING.easeOut).toBe(easeOut);
    expect(EASING.easeInOut).toBe(easeInOut);
    expect(EASING.spring).toBe(spring);
  });

  test('endpoints: every easing maps 0→0 and 1→1 (within tolerance for spring)', () => {
    expect(linear(0)).toBe(0);
    expect(linear(1)).toBe(1);
    expect(easeIn(0)).toBe(0);
    expect(easeIn(1)).toBe(1);
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(1)).toBeCloseTo(1, 5);
    expect(spring(0)).toBeCloseTo(0, 5);
    expect(spring(1)).toBeCloseTo(1, 1);
  });
});

describe('tween', () => {
  test('returns from at t=0', () => {
    expect(tween(10, 20, 1000, linear, 0, 0)).toBe(10);
  });

  test('returns to at t=1', () => {
    expect(tween(10, 20, 1000, linear, 1000, 0)).toBe(20);
  });

  test('returns clamped midpoint when now exceeds duration', () => {
    expect(tween(0, 100, 1000, linear, 1500, 0)).toBe(100);
  });

  test('returns clamped start when now is before startTime', () => {
    expect(tween(0, 100, 1000, linear, -500, 0)).toBe(0);
  });

  test('returns to immediately when duration is zero', () => {
    expect(tween(5, 15, 0, linear, 999, 0)).toBe(15);
  });

  test('linear interpolates halfway exactly', () => {
    expect(tween(0, 100, 1000, linear, 500, 0)).toBe(50);
  });

  test('easeIn stays below linear at midpoint', () => {
    expect(tween(0, 100, 1000, easeIn, 500, 0)).toBeLessThan(50);
  });

  test('easeOut stays above linear at midpoint', () => {
    expect(tween(0, 100, 1000, easeOut, 500, 0)).toBeGreaterThan(50);
  });

  test('easeInOut matches linear at midpoint', () => {
    expect(tween(0, 100, 1000, easeInOut, 500, 0)).toBeCloseTo(50, 5);
  });

  test('handles negative ranges', () => {
    expect(tween(100, 0, 1000, linear, 250, 0)).toBe(75);
  });

  test('handles fractional values', () => {
    expect(tween(1.5, 2.5, 1000, linear, 500, 0)).toBeCloseTo(2.0, 10);
  });
});

describe('createAnimation', () => {
  test('starts at `from` with done=false and startTime uninitialized', () => {
    const a = createAnimation(0, 100, 1000);
    expect(a.from).toBe(0);
    expect(a.to).toBe(100);
    expect(a.duration).toBe(1000);
    expect(Number.isNaN(a.startTime)).toBe(true);
    expect(a.current).toBe(0);
    expect(a.done).toBe(false);
    expect(a.easing).toBe(linear);
  });

  test('accepts custom easing', () => {
    const a = createAnimation(0, 100, 1000, easeIn);
    expect(a.easing).toBe(easeIn);
  });
});

describe('stepAnimation', () => {
  test('first call sets startTime to `now`', () => {
    const a = createAnimation(0, 100, 1000);
    const next = stepAnimation(a, 500);
    expect(next.startTime).toBe(500);
    expect(next.current).toBe(0);
    expect(next.done).toBe(false);
  });

  test('does not mutate the input animation', () => {
    const a: Animation = createAnimation(0, 100, 1000);
    const before = JSON.stringify(a);
    stepAnimation(a, 500);
    expect(JSON.stringify(a)).toBe(before);
  });

  test('returns a new object reference', () => {
    const a = createAnimation(0, 100, 1000);
    const next = stepAnimation(a, 500);
    expect(next).not.toBe(a);
  });

  test('reuses startTime on subsequent calls', () => {
    const a = createAnimation(0, 100, 1000);
    const s1 = stepAnimation(a, 100);
    const s2 = stepAnimation(s1, 600);
    expect(s2.startTime).toBe(100);
    expect(s2.current).toBe(50);
  });

  test('marks done when elapsed exceeds duration', () => {
    const a = createAnimation(0, 100, 1000);
    const s1 = stepAnimation(a, 0);
    const s2 = stepAnimation(s1, 1500);
    expect(s2.done).toBe(true);
    expect(s2.current).toBe(100);
  });

  test('does not flag done when still within duration', () => {
    const a = createAnimation(0, 100, 1000);
    const s1 = stepAnimation(a, 0);
    const s2 = stepAnimation(s1, 999);
    expect(s2.done).toBe(false);
  });

  test('zero-duration animation completes immediately', () => {
    const a = createAnimation(0, 100, 0);
    const s = stepAnimation(a, 100);
    expect(s.done).toBe(true);
    expect(s.current).toBe(100);
  });

  test('applies easing to current value', () => {
    const a = createAnimation(0, 100, 1000, easeIn);
    const s1 = stepAnimation(a, 0);
    const s2 = stepAnimation(s1, 500);
    expect(s2.current).toBeLessThan(50);
  });
});

describe('isDone', () => {
  test('returns false for fresh animation', () => {
    expect(isDone(createAnimation(0, 100, 1000))).toBe(false);
  });

  test('returns true after stepping past duration', () => {
    const a = createAnimation(0, 100, 1000);
    const s1 = stepAnimation(a, 0);
    const s2 = stepAnimation(s1, 2000);
    expect(isDone(s2)).toBe(true);
  });
});