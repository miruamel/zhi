/**
 * @brief Integration: cli boot main() — full loop run dari argv. @since 0.1.1
 */
import { describe, expect, it } from 'bun:test';
import { main } from './index';
import type { CriticResult } from '../../engine/critic/aggregate';
import { parseArgs } from './parse-args/parse-args';
import { offlineDeps } from './offline-deps/offline-deps';
import { autonomousDeps } from './autonomous-deps/autonomous-deps';
import { buildHandlers } from '../../engine/loop/wiring/handlers/builder';
import { LoopDriver } from '../../engine/loop/driver';
import { LoopLogger } from '../../engine/loop/observability/logger';
import { LoopMetrics } from '../../engine/loop/observability/metrics';
import type { LoopContext } from '../../engine/loop/wiring/context';

describe('cli boot', () => {
  it('runs loop from argv to DONE with populated context', async () => {
    // Mock loop: bypasses LocalStubInvoker by providing non-stub generate output.
    const loop = async (argv: string[]): Promise<LoopContext> => {
      const { goal, threshold } = parseArgs(argv);
      const ctx: LoopContext = { goal };
      const metrics = new LoopMetrics();
      const logger = new LoopLogger();
      const deps = offlineDeps(threshold);
      // Return valid TypeScript barrel — no [local-stub] marker, passes critics.
      deps.generate = async () =>
        `// auth/handlers/index.ts\n/** @brief Auth handlers barrel. @since 0.1.10 */\nexport { authenticate } from './authenticate';\nexport { authorize } from './authorize';\n// verify: ok`;
      const driver = new LoopDriver({
        onTransition: (f, e, t) => logger.transition(f, e, t),
      });
      metrics.reset();
      await driver.run(buildHandlers(ctx, autonomousDeps(deps, goal), metrics));
      const s = metrics.summary();
      console.log(
        `[metrics] stages=${s.stages} errors=${s.errors} totalMs=${s.totalMs.toFixed(1)}`,
      );
      return ctx;
    };

    const ctx = await main(['  build auth  '], { loop });
    expect(ctx.aggregate?.score).toBeGreaterThanOrEqual(0.8);
    expect(ctx.aggregate?.passed).toBe(true);
    expect(ctx.critiques).toHaveLength(11);
    expect(ctx.critiques?.map((c: CriticResult) => c.name)).toContain('maintainability');
  });

  it('dispatches gen subcommand', async () => {
    // gen butuh domain; expect throw bila kosong
    await expect(main(['gen'])).rejects.toThrow('cli: gen butuh <domain>');
  });

  it('dispatches critique:repo subcommand', async () => {
    // Use fake handler — routing-only test; real command is tested in critique-repo-traversal.test.ts.
    const ctx = await main(['critique:repo'], {
      critique: () => Promise.resolve({ goal: 'critique:repo' }),
    });
    expect(ctx.goal).toBe('critique:repo');
  });
});
