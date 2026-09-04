/** @brief Integration: jalankan loop utuh via driver+wiring+states. @since 0.1.1 */
import { describe, it, expect } from 'bun:test';
import { LoopDriver } from '../../driver';
import { LoopState } from '../../states';
import { buildHandlers, type LoopDeps } from '../handlers';
import type { LoopContext } from '../context';
import type { Critique } from '../../../critic/aggregate';
import { LoopMetrics } from '../../observability/metrics';

const high: Critique[] = [{ name: 'security', score: 1, weight: 1, findings: [] }];
const low: Critique[] = [{ name: 'security', score: 0, weight: 1, findings: ['fail'] }];

function deps(opts: {
  critique: () => Critique[];
  ciWatch?: () => 'green' | 'red' | 'pending';
}): LoopDeps {
  return {
    ingest: (g) => g,
    plan: (g) => `plan:${g}`,
    generate: async (p) => `code:${p}`,
    critique: opts.critique,
    ciWatch: opts.ciWatch ?? (() => 'green'),
    paretoThreshold: 0.5,
  };
}

describe('loop integration', () => {
  it('runs INTAKE->DONE on green gate', async () => {
    const ctx: LoopContext = { goal: 'build auth' };
    const seen: LoopState[] = [];
    const driver = new LoopDriver({ onTransition: (from) => seen.push(from) });
    await driver.run(buildHandlers(ctx, deps({ critique: () => high })));
    expect(driver.finished).toBe(true);
    expect(driver.current).toBe(LoopState.DONE);
    expect(ctx.plan).toBe('plan:build auth');
    expect(ctx.code).toBe('code:plan:build auth');
    expect(ctx.aggregate?.score).toBe(1);
    expect(ctx.eval?.passed).toBe(true);
    expect(seen[0]).toBe(LoopState.INTAKE);
    expect(seen.includes(LoopState.COMMIT)).toBe(true);
    expect(seen.includes(LoopState.CI_WATCH)).toBe(true);
  });

  it('recovers once then reaches DONE on second critique', async () => {
    let calls = 0;
    const ctx: LoopContext = { goal: 'fix bug' };
    const seen: LoopState[] = [];
    const driver = new LoopDriver({ onTransition: (from) => seen.push(from) });
    await driver.run(buildHandlers(ctx, deps({ critique: () => (++calls === 1 ? low : high) })));
    expect(driver.finished).toBe(true);
    expect(seen.includes(LoopState.RECOVER)).toBe(true);
    expect(ctx.aggregate?.score).toBe(1);
  });

  it('throws when a state has no handler', async () => {
    const ctx: LoopContext = { goal: 'x' };
    const handlers = buildHandlers(ctx, deps({ critique: () => high }));
    delete handlers[LoopState.EXECUTE];
    const driver = new LoopDriver();
    await expect(driver.run(handlers)).rejects.toThrow(/no handler for state EXECUTE/);
  });

  it('aborts gracefully after recover budget (no infinite spin)', async () => {
    const ctx: LoopContext = { goal: 'x' };
    const driver = new LoopDriver();
    await driver.run(buildHandlers(ctx, deps({ critique: () => low })));
    expect(driver.finished).toBe(true);
    expect(ctx.attempts).toBe(3);
    expect(ctx.error).toMatch(/recover exhausted/);
  });
  it('records per-stage metrics when metrics passed', async () => {
    const ctx: LoopContext = { goal: 'g' };
    const metrics = new LoopMetrics();
    const driver = new LoopDriver();
    await driver.run(buildHandlers(ctx, deps({ critique: () => high }), metrics));
    expect(metrics.stages.length).toBeGreaterThan(0);
    expect(metrics.summary().errors).toBe(0);
    expect(metrics.stages.every((r) => r.ok)).toBe(true);
  });
});
