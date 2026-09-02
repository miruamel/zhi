/**
 * @brief Subcommand default: jalankan satu siklus loop dari goal CLI.
 * Setup driver + handlers + metrics, run, ringkasan ke stdout.
 * @param {string[]} argv - argumen baris perintah (goal + --threshold=N).
 * @return {Promise<LoopContext>} konteks akhir loop (sampai DONE).
 * @throw {Error} bila goal kosong.
 * @since 0.1.0
 */
import type { LoopContext } from '../../../engine/loop/wiring/context';
import { buildHandlers } from '../../../engine/loop/wiring/handlers';
import { LoopDriver } from '../../../engine/loop/driver';
import { LoopLogger } from '../../../engine/loop/observability/logger';
import { LoopMetrics } from '../../../engine/loop/observability/metrics';
import { autonomousDeps } from '../autonomous-deps';
import { offlineDeps } from '../offline-deps';
import { parseArgs } from '../parse-args';

/** @brief Jalankan satu siklus loop otonom. @param {string[]} argv @return {Promise<LoopContext>} */
export async function loopCommand(argv: string[]): Promise<LoopContext> {
  const { goal, threshold } = parseArgs(argv);
  if (!goal) {
    throw new Error('cli: goal kosong');
  }
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
