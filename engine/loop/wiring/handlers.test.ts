import { describe, it, expect } from 'bun:test';
import { LoopDriver } from '../driver';
import { buildHandlers, type LoopDeps } from './handlers';
import type { LoopContext } from './context';
import { LoopState } from '../states';

function stubDeps(over: Partial<LoopDeps> = {}): LoopDeps {
  return {
    ingest: (g) => g.trim(),
    plan: (g) => `plan:${g}`,
    generate: (p) => `code:${p}`,
    critique: () => [{ name: 'security', score: 0.9, weight: 1, findings: [] }],
    ciGreen: () => true,
    paretoThreshold: 0.8,
    ...over,
  };
}

describe('loop wiring', () => {
  it('runs full green loop to DONE', async () => {
    const ctx: LoopContext = { goal: '  build auth  ' };
    const driver = new LoopDriver();
    await driver.run(buildHandlers(ctx, stubDeps()));
    expect(driver.current).toBe(LoopState.DONE);
    expect(ctx.goal).toBe('build auth');
    expect(ctx.plan).toBe('plan:build auth');
    expect(ctx.code).toBe('code:plan:build auth');
    expect(ctx.aggregate?.score).toBe(0.9);
    expect(ctx.eval?.passed).toBe(true);
  });

  it('throws on non-terminating gate-fail cycle (budget guard)', async () => {
    const ctx: LoopContext = { goal: 'x' };
    const driver = new LoopDriver();
    await expect(
      driver.run(
        buildHandlers(ctx, stubDeps({
          critique: () => [{ name: 'security', score: 0.5, weight: 1, findings: [] }],
        })),
        8,
      ),
    ).rejects.toThrow('loop: budget exceeded');
    expect(ctx.aggregate?.passed).toBe(false);
  });
});
