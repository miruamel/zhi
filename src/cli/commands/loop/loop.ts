/**
 * @brief Subcommand default: jalarkan satu siklus loop dari goal CLI.
 * TTY default → TUI (ink). Non-TTY → stdout ringkasan.
 * @param {string[]} argv - argumen baris perintah (goal + --threshold=N).
 * @return {Promise<LoopContext>} konteks akhir loop (sampai DONE).
 * @throw {Error} bila goal kosong.
 * @since 0.1.2
 */
import type { LoopContext } from '@engine/loop/wiring/context';
import type { Critique } from '@engine/critic/aggregate';
import { buildHandlers } from '@engine/loop/wiring/handlers';
import { LoopDriver } from '@engine/loop/driver';
import { LoopState } from '@engine/loop/states';
import { LoopLogger } from '@engine/loop/observability/logger';
import { LoopMetrics } from '@engine/loop/observability/metrics';
import { autonomousDeps } from '../../autonomous-deps/autonomous-deps';
import { offlineDeps } from '../../offline-deps/offline-deps';
import { parseArgs } from '../../parse-args/parse-args';
import { mountTui } from '../../../tui/render';
import type { AppState } from '../../../tui/core/state';

/** @brief Ubah ctx+metrics → partial AppState patch (tanpa TUI dependency). @since 0.1.4 */
export function toPatch(
  ctx: LoopContext,
  metrics: LoopMetrics,
  loop: LoopState,
  aborted: boolean,
): Partial<AppState> {
  return {
    loop,
    metrics: { stages: 0, errors: 0, totalMs: 0, recoverAttempts: metrics.recoverAttempts },
    critics: (ctx.critiques ?? []).map((c: Critique) => ({
      name: c.name,
      score: c.score,
      abstain: false,
      reason: c.findings[0],
    })),
    eval: {
      build: { name: 'build', ok: false, detail: '', durationMs: 0 },
      test: { name: 'test', ok: false, detail: '', durationMs: 0 },
      security: { name: 'security', ok: false, detail: '', durationMs: 0 },
      gate: {
        name: 'gate',
        ok: !!ctx.eval?.passed,
        detail: ctx.eval?.reasons?.join(' ') ?? '',
        durationMs: 0,
      },
      gatePass: !!ctx.eval?.passed,
      weightedAvg: ctx.aggregate?.score ?? 0,
    },
    prCi: {
      prUrl: ctx.prUrl,
      ciStatus:
        loop === LoopState.CI_WATCH ? 'pending' : loop === LoopState.DONE ? 'green' : undefined,
    },
    log: [],
    finished: loop === LoopState.DONE,
    aborted,
    partial: aborted && loop !== LoopState.DONE,
  };
}

/** @brief Jalankan satu siklus loop otonom (stdout-only, tanpa TUI). @param {string[]} argv @return {Promise<LoopContext>} */
export async function loopCommand(argv: string[]): Promise<LoopContext> {
  const { goal, threshold } = parseArgs(argv);
  if (!goal) throw new Error('cli: goal kosong');
  const ctx: LoopContext = { goal };
  const metrics = new LoopMetrics();
  const logger = new LoopLogger();
  const driver = new LoopDriver({
    onTransition: (from, ev, to) => logger.transition(from, ev, to),
  });
  await driver.run(buildHandlers(ctx, autonomousDeps(offlineDeps(threshold), ctx.goal), metrics));
  const s = metrics.summary();
  console.log(`[metrics] stages=${s.stages} errors=${s.errors} totalMs=${s.totalMs.toFixed(1)}`);
  return ctx;
}

/** @brief Jalankan loop dengan TUI (default bila stdout TTY). @param {string[]} argv @return {Promise<LoopContext>} */
export async function loopCommandTui(argv: string[]): Promise<LoopContext> {
  const { goal, threshold } = parseArgs(argv);
  if (!goal) throw new Error('cli: goal kosong');
  const ctx: LoopContext = { goal };
  const metrics = new LoopMetrics();
  const logger = new LoopLogger();
  const holder = { push: null as ((p: Partial<AppState>) => void) | null };
  const driver = new LoopDriver({
    onTransition: (_from, _ev, to) => {
      logger.transition(_from, _ev, to);
      holder.push?.(toPatch(ctx, metrics, to, !!ctx.error));
    },
  });
  const handlers = buildHandlers(ctx, autonomousDeps(offlineDeps(threshold), ctx.goal), metrics);
  const { unmount } = mountTui({
    goal,
    threshold,
    tokensBudget: 100_000,
    onAbort: () => driver.abort(),
    onQuit: () => {
      unmount();
      process.exit(0);
    },
    onRegister: (p) => {
      holder.push = p;
    },
  });
  await driver.run(handlers);
  unmount();
  const s = metrics.summary();
  console.log(`[metrics] stages=${s.stages} errors=${s.errors} totalMs=${s.totalMs.toFixed(1)}`);
  return ctx;
}
