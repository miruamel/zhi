import { describe, it, expect } from 'bun:test';
import { aggregate, type CriticResult } from '../aggregate';

describe('critic aggregate', () => {
  const samples: CriticResult[] = [
    { name: 'security', score: 0.9, weight: 2, findings: ['ok'] },
    { name: 'perf', score: 0.5, weight: 1, findings: ['slow path'] },
    { name: 'style', score: 0.8, weight: 1, findings: [] },
  ];

  it('computes weighted score', () => {
    const r = aggregate(samples);
    // (0.9*2 + 0.5*1 + 0.8*1) / 4 = 3.1/4 = 0.775
    expect(r.score).toBeCloseTo(0.775, 5);
    expect(r.byCritic.security).toBe(0.9);
  });
  it('passes above threshold, fails below', () => {
    expect(aggregate(samples).passed).toBe(true);
    expect(aggregate(samples, 0.8).passed).toBe(false);
  });
  it('collects all findings', () => {
    expect(aggregate(samples).findings).toEqual(['ok', 'slow path']);
  });
  it('empty critiques fail closed', () => {
    const r = aggregate([]);
    expect(r.passed).toBe(false);
    expect(r.score).toBe(0);
  });
});
