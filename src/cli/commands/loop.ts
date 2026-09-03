/**
 * @brief Subcommand default: jalarkan satu siklus loop dari goal CLI.
 * TTY default → TUI (ink). Non-TTY → stdout ringkasan.
 * @param {string[]} argv - argumen baris perintah (goal + --threshold=N).
 * @return {Promise<LoopContext>} konteks akhir loop (sampai DONE).
 * @throw {Error} bila goal kosong.
 * @since 0.1.0
 */
import type { LoopContext } from '../../../engine/loop/wiring/context';
import type { Critique } from '../../../engine/critic/aggregate';
import { buildHandlers } from '../../../engine/loop/wiring/handlers';
import { LoopDriver } from '../../../engine/loop/driver';
import { LoopState } from '../../../engine/loop/states';
import { LoopLogger } from '../../../engine/loop/observability/logger';
import { LoopMetrics } from '../../../engine/loop/observability/metrics';
import { autonomousDeps } from '../autonomous-deps';
import { offlineDeps } from '../offline-deps';
import { parseArgs } from '../parse-args';
import { mountTui } from '../../tui/render';
import type { AppState, LogEntry, TimelineEntry } from '../../tui/core/state';
import { KnowledgeStore } from '../../../engine/knowledge/store';
/** @brief Ubah ctx+metrics → partial AppState patch (tanpa TUI dependency). @since 0.1.1
 * @param {number} [errors=0] - hitung error terakumulasi.
 */
export function toPatch(
  ctx: LoopContext,
  metrics: LoopMetrics,
  loop: LoopState,
  aborted: boolean,
  logEntries: LogEntry[] = [],
  totalMs = 0,
  errors = 0,
  timeline: TimelineEntry[] = [],
  stageRecords: { stage: string; ms: number; ok: boolean; error?: string }[] = [],
  facts: { key: string; value: string; tags: string[] }[] = [],
  code?: string,
  config?: { threshold: number; tokensBudget: number; offline: boolean },
): Partial<AppState> {
  return {
    loop,
    metrics: {
      stages: metrics.stages.length,
      errors,
      totalMs,
      recoverAttempts: metrics.recoverAttempts,
    },
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
    log: logEntries,
    code,
    config,
    timeline,
    stageRecords,
    facts,
    finished: loop === LoopState.DONE,
    aborted,
  };
}

/** @brief Jalarkan satu siklus loop otonom (stdout-only, tanpa TUI). @param {string[]} argv @return {Promise<LoopContext>} */
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
  const store = new KnowledgeStore();
  const logEntries: LogEntry[] = [];
  const timeline: TimelineEntry[] = [];
  const holder = { push: null as ((p: Partial<AppState>) => void) | null };
  const driver = new LoopDriver({
    onTransition: (_from, _ev, to) => {
      logger.transition(_from, _ev, to);
      logEntries.push({
        ts: Date.now(),
        runId: logger.runId,
        from: String(_from),
        to: String(to),
        event: String(_ev),
        kind: 'transition',
        msg: `${String(_from)} --${String(_ev)}--> ${String(to)}`,
      });
      if (to === LoopState.CRITIQUE) {
        for (const c of ctx.critiques ?? []) {
          store.add({ key: `critic:${c.name}`, value: `score=${c.score} findings=${c.findings.length}`, tags: ['critic', c.name] });
        }
      }
      const s = metrics.summary();
      timeline.push({
        ts: Date.now(),
        stage: String(to),
        event: String(_ev),
        ms: s.totalMs,
        msg: `${String(_from)} --${String(_ev)}--> ${String(to)}`,
      });
      holder.push?.(
        toPatch(
          ctx,
          metrics,
          to,
          !!ctx.error,
          logEntries,
          s.totalMs,
          s.errors,
          timeline,
          metrics.stages.map((r) => ({ stage: r.stage, ms: r.ms, ok: r.ok, error: r.error })),
          store.all(),
          ctx.code,
          { threshold, tokensBudget: 100_000, offline: process.env['ZHI_AUTO_PR'] !== '1' },
        ),
      );
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
