import { describe, it, expect } from 'bun:test';
import { LoopDriver } from '../../../driver';
import { buildHandlers, type LoopDeps } from '../index';
import type { LoopContext } from '../../context';
import { LoopState } from '../../../states';

function stubDeps(over: Partial<LoopDeps> = {}): LoopDeps {
  return {
    ingest: (g: string) => g.trim(),
    plan: (g: string) => `plan:${g}`,
    generate: async (p: string) => `code:${p}`,
    critique: () => [{ name: 'security', score: 0.9, weight: 1, findings: [] }],
    ciWatch: () => 'green',
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

  it('aborts gracefully after recover budget (no infinite spin)', async () => {
    const ctx: LoopContext = { goal: 'x' };
    const driver = new LoopDriver();
    await driver.run(
      buildHandlers(
        ctx,
        stubDeps({
          critique: () => [{ name: 'security', score: 0.5, weight: 1, findings: [] }],
        }),
      ),
    );
    expect(driver.finished).toBe(true);
    expect(ctx.attempts).toBe(3);
    expect(ctx.error).toMatch(/recover exhausted/);
  });

  it('EXECUTE failure (generate throws) retries then aborts gracefully', async () => {
    const ctx: LoopContext = { goal: 'x' };
    const driver = new LoopDriver();
    await driver.run(
      buildHandlers(
        ctx,
        stubDeps({
          generate: () => {
            throw new Error('model timeout');
          },
        }),
      ),
    );
    expect(driver.finished).toBe(true);
    expect(ctx.attempts).toBe(3);
    expect(ctx.error).toMatch(/recover exhausted/);
  });

  it('ISOLATE sets ctx.worktree+branch and COMMIT/PR_OPEN run inside worktree', async () => {
    const ctx: LoopContext = { goal: 'build auth' };
    const driver = new LoopDriver();
    let isolated = false;
    let committed = '';
    let opened = '';
    await driver.run(
      buildHandlers(
        ctx,
        stubDeps({
          isolate: () => {
            isolated = true;
            return '/tmp/wt-auth';
          },
          commit: (wt: string) => {
            committed = wt;
          },
          prOpen: (wt: string, _t: string, _b: string) => {
            opened = wt;
            return 'https://github.com/miruamel/zhi/pull/9';
          },
          ciWatch: () => 'green',
        }),
      ),
    );
    expect(driver.current).toBe(LoopState.DONE);
    expect(isolated).toBe(true);
    expect(ctx.worktree).toBe('/tmp/wt-auth');
    expect(ctx.branch).toBe('feat/build-auth');
    expect(committed).toBe('/tmp/wt-auth');
    expect(opened).toBe('/tmp/wt-auth');
    expect(ctx.prUrl).toBe('https://github.com/miruamel/zhi/pull/9');
  });

  it('CI_WATCH routes to DONE on green, recovers then aborts on persistent red', async () => {
    const green: LoopContext = { goal: 'g' };
    const d1 = new LoopDriver();
    await d1.run(buildHandlers(green, stubDeps({ ciWatch: () => 'green' })));
    expect(d1.current).toBe(LoopState.DONE);

    const red: LoopContext = { goal: 'g' };
    const d2 = new LoopDriver();
    await d2.run(buildHandlers(red, stubDeps({ ciWatch: () => 'red' })));
    expect(d2.finished).toBe(true);
    expect(red.attempts).toBe(3);
  });
});
