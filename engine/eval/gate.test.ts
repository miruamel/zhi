import { describe, it, expect } from 'bun:test';
import { gate } from './gate';

describe('eval gate', () => {
  it('passes when score >= threshold and no blockers', () => {
    const r = gate({ score: 0.8, criteria: ['a', 'b'], blockers: [] });
    expect(r.passed).toBe(true);
    expect(r.score).toBe(0.8);
  });
  it('fails below threshold', () => {
    const r = gate({ score: 0.5, criteria: [], blockers: [] }, 0.7);
    expect(r.passed).toBe(false);
  });
  it('fails closed on any blocker regardless of score', () => {
    const r = gate({ score: 1.0, criteria: [], blockers: ['security'] });
    expect(r.passed).toBe(false);
    expect(r.reasons[0]).toContain('security');
  });
  it('uses custom threshold', () => {
    expect(gate({ score: 0.6, criteria: [], blockers: [] }, 0.5).passed).toBe(true);
  });
});
