/**
 * @fileoverview Evaluation coordinator tests. @since 0.2.6
 */
import { describe, it, expect } from 'bun:test';
import { createEvalEngine } from '../index';

describe('EvalEngine', () => {
  it('runs full pipeline', async () => {
    const engine = createEvalEngine();
    const r = await engine.evaluate({
      critiques: [],
      score: 1,
      criteria: ['lint', 'typecheck', 'test'],
      blockers: [],
      securityReport: { findings: [], score: 100, durationMs: 0, leaked: false },
    });
    expect(r.passed).toBe(true);
    expect(r.score).toBeGreaterThan(0);
  });

  it('fails when security leaked', async () => {
    const engine = createEvalEngine();
    const r = await engine.evaluate({
      critiques: [],
      score: 1,
      criteria: ['lint'],
      blockers: [],
      securityReport: {
        findings: [
          { file: 'a.ts', line: 1, rule: 'api-key', message: 'leaked', severity: 'critical' },
        ],
        score: 0,
        durationMs: 0,
        leaked: true,
      },
    });
    expect(r.passed).toBe(false);
  });
});
