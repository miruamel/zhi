/** @brief Akumulator data lintas-state loop Zhi. @since 0.1.0 */
import type { Critique, AggregateResult } from '../../critic/aggregate';
import type { EvalOutput } from '../../eval/gate';

/** @brief Data yang dibawa antar transisi state loop. @since 0.1.0 */
export interface LoopContext {
  /** @brief Tujuan awal (dari INTAKE). */
  goal: string;
  /** @brief Rencana hasil PLAN. */
  plan?: string;
  /** @brief Kode hasil EXECUTE. */
  code?: string;
  /** @brief Hasil tiap critic (CRITIQUE). */
  critiques?: Critique[];
  /** @brief Agregat critic (CRITIQUE). */
  aggregate?: AggregateResult;
  /** @brief Hasil eval-gate (EVALUATE). */
  eval?: EvalOutput;
  /** @brief Branch hasil ISOLATE (bila deps.isolate ada). */
  branch?: string;
  /** @brief Path worktree terisolasi hasil ISOLATE (bila deps.isolate ada). */
  worktree?: string;
  /** @brief URL PR hasil PR_OPEN (bila deps.prOpen ada). */
  prUrl?: string;
  /** @brief Pesan error terakhir. */
  error?: string;
  /** @brief Budget komputasi terpakai. */
  budgetUsed?: number;
}
