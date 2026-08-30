import { describe, expect, test } from 'bun:test';
import { gate } from './gate';

describe('gate', () => {
  test('passes when no blockers and score >= default threshold', () => {
    const r = gate({ score: 0.8, criteria: ['a', 'b'], blockers: [] });
    expect(r.passed).toBe(true);
    expect(r.score).toBe(0.8);
    expect(r.reasons).toContain('score 0.8 >= 0.7');
    expect(r.reasons).toContain('criteria met: 2');
  });

  test('fails when score below default threshold', () => {
    const r = gate({ score: 0.6, criteria: ['a'], blockers: [] });
    expect(r.passed).toBe(false);
    expect(r.reasons).toContain('score 0.6 < 0.7');
  });

  test('fails and short-circuits on any blocker', () => {
    const r = gate({ score: 1, criteria: ['a'], blockers: ['secret leak'] });
    expect(r.passed).toBe(false);
    expect(r.score).toBe(1);
    expect(r.reasons).toContain('blocked: secret leak');
    // criteria not counted when blocked
    expect(r.reasons.some((x) => x.startsWith('criteria met'))).toBe(false);
  });

  test('respects custom threshold', () => {
    const r = gate({ score: 0.75, criteria: [], blockers: [] }, 0.9);
    expect(r.passed).toBe(false);
    expect(r.reasons).toContain('score 0.75 < 0.9');
  });

  test('omits criteria line when none met', () => {
    const r = gate({ score: 0.9, criteria: [], blockers: [] });
    expect(r.reasons.some((x) => x.startsWith('criteria met'))).toBe(false);
  });
});
