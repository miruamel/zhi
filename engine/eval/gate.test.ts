import { describe, expect, test } from 'bun:test';
import { gate, type EvalInput } from './gate';

/** @brief Build minimal EvalInput. */
function inp(over: Partial<EvalInput> = {}): EvalInput {
  return { score: 1, criteria: [], blockers: [], ...over };
}

describe('gate', () => {
  test('passes when no blockers and score >= default threshold', () => {
    const out = gate(inp({ score: 0.8, criteria: ['bun test hijau'] }));
    expect(out.passed).toBe(true);
    expect(out.score).toBe(0.8);
  });

  test('fails when blockers present regardless of score', () => {
    const out = gate(inp({ score: 1, blockers: ['test gagal'] }));
    expect(out.passed).toBe(false);
    expect(out.reasons.some((r) => r.startsWith('blocked:'))).toBe(true);
  });

  test('fails when score below threshold and no blockers', () => {
    const out = gate(inp({ score: 0.5 }));
    expect(out.passed).toBe(false);
    expect(out.reasons.some((r) => r.includes('< 0.7'))).toBe(true);
  });

  test('respects custom threshold', () => {
    const out = gate(inp({ score: 0.6 }), 0.5);
    expect(out.passed).toBe(true);
    expect(out.reasons.some((r) => r.includes('>= 0.5'))).toBe(true);
  });

  test('reports criteria count when met', () => {
    const out = gate(inp({ score: 0.9, criteria: ['a', 'b'] }));
    expect(out.reasons.some((r) => r.includes('criteria met: 2'))).toBe(true);
  });

  test('blocker short-circuits before score check', () => {
    const out = gate(inp({ score: 0, blockers: ['x'] }));
    expect(out.passed).toBe(false);
    expect(out.reasons.some((r) => r.startsWith('blocked:'))).toBe(true);
  });
});
