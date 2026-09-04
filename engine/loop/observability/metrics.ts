import type { StateHandler } from '../driver';
import { LoopState } from '../states';

/** @brief Satu catatan eksekusi stage loop. @since 0.1.1 */
export interface StageRecord {
  /** @brief Nama state (INTAKE, PLAN, ...). */
  readonly stage: string;
  /** @brief Durasi eksekusi dalam ms. */
  readonly ms: number;
  /** @brief True bila handler kembalikan event tanpa melempar. */
  readonly ok: boolean;
  /** @brief Pesan error bila !ok. */
  readonly error?: string;
}

/** @brief Kumpulkan metrik siklus loop: latency per stage, error, attempts. @since 0.1.1 */
export class LoopMetrics {
  private readonly records: StageRecord[] = [];
  /** @brief Jumlah attempt recovery (dari ctx.attempts). */
  recoverAttempts = 0;

  /** @brief Catat satu stage. @param {StageRecord} r */
  record(r: StageRecord): void {
    this.records.push(r);
  }

  /** @brief Semua record (urutan eksekusi). */
  get stages(): readonly StageRecord[] {
    return this.records;
  }

  /** @brief Ringkasan agregat. @return {{totalMs:number;errors:number;stages:number}} */
  summary(): { totalMs: number; errors: number; stages: number } {
    let totalMs = 0;
    let errors = 0;
    for (const r of this.records) {
      totalMs += r.ms;
      if (!r.ok) errors++;
    }
    return { totalMs, errors, stages: this.records.length };
  }
}

/** @brief Bungkus handler dengan pengukuran latency + error. @since 0.1.1 */
export function timedStage(stage: string, fn: StateHandler, metrics: LoopMetrics): StateHandler {
  return async (state: LoopState) => {
    const t0 = performance.now();
    try {
      const ev = await fn(state);
      metrics.record({ stage, ms: performance.now() - t0, ok: true });
      return ev;
    } catch (e) {
      metrics.record({ stage, ms: performance.now() - t0, ok: false, error: String(e) });
      throw e;
    }
  };
}
