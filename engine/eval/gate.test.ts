import { describe, it, expect } from 'bun:test';
import { gate } from './gate';

describe('eval gate', () => {
  it('passes when no blockers and score >= default threshold', () => {
    const r = gate({ score: 0.8, criteria: ['a'], blockers: [] });
    expect(r.passed).toBe(true);
    expect(r.score).toBe(0.8);
    expect(r.reasons).toContain('score 0.8 >= 0.7');
    expect(r.reasons).toContain('criteria met: 1');
  });

  it('fails when score below default threshold', () => {
    const r = gate({ score: 0.5, criteria: [], blockers: [] });
    expect(r.passed).toBe(false);
    expect(r.reasons).toContain('score 0.5 < 0.7');
  });

  it('passes at the exact threshold boundary', () => {
    const r = gate({ score: 0.7, criteria: [], blockers: [] });
    expect(r.passed).toBe(true);
  });

  it('fails when any blocker present, regardless of score', () => {
    const r = gate({ score: 1, criteria: [], blockers: ['secret leak'] });
    expect(r.passed).toBe(false);
    expect(r.score).toBe(1);
    expect(r.reasons).toContain('blocked: secret leak');
  });

  it('respects a custom threshold', () => {
    expect(gate({ score: 0.6, criteria: [], blockers: [] }, 0.5).passed).toBe(true);
    expect(gate({ score: 0.4, criteria: [], blockers: [] }, 0.5).passed).toBe(false);
  });

  it('omits criteria line when none met', () => {
    const r = gate({ score: 0.9, criteria: [], blockers: [] });
    expect(r.reasons.some((x) => x.startsWith('criteria met'))).toBe(false);
  });

  it('reports criteria count, not criteria text', () => {
    const r = gate({ score: 0.9, criteria: ['foo', 'bar'], blockers: [] });
    expect(r.reasons).toContain('criteria met: 2');
    expect(r.reasons.join(' ')).not.toContain('foo');
    expect(r.reasons.join(' ')).not.toContain('bar');
  });
});
