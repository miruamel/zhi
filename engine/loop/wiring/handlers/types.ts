/**
 * @brief Kontrak LoopDeps + konstanta retry handler.
 * @since 0.1.2 */
import type { EvalOutput } from '../../../eval/gate';
import type { Critique } from '../../../critic/aggregate';

/** @brief Batas retry recovery sebelum abort (selaras resil maxAttempts=3, ADR-003). @since 0.1.2 */
export const MAX_RECOVER = 3;

/** @brief Batas retry generate per EXECUTE (selaras resil default). @since 0.1.2 */
export const GENERATE_RETRY = 3;

/** @brief Dependensi injeksi untuk state LLM-dependent + ambang. @since 0.1.2 */
export interface LoopDeps {
  /** @brief Normalisasi goal (INTAKE). */
  ingest: (goal: string) => string;
  /** @brief Buat rencana dari goal (PLAN). */
  plan: (goal: string) => string;
  /** @brief Generate kode dari rencana (EXECUTE). Bila worktree diberi, tulis file ke sana. */
  generate: (plan: string, worktree?: string) => Promise<string>;
  /** @brief Jalankan critique plant ke kode (CRITIQUE). */
  critique: (code: string) => Critique[];
  /** @brief Kompres kode hasil EXECUTE agar muat context window (opsional). */
  compress?: (code: string) => string;
  /** @brief Isolasi kerja ke git worktree terpisah (ISOLATE, opsional). @return {string} path worktree absolut. */
  isolate?: () => string;
  /** @brief Commit hasil EXECUTE di dalam worktree (COMMIT, opsional). */
  commit?: (worktree: string) => void;
  /** @brief Buka PR via gh dari dalam worktree (PR_OPEN, opsional). @return {string} URL PR. */
  prOpen?: (worktree: string, title: string, body: string) => string;
  /** @brief Watch CI status (CI_WATCH, opsional). @return {'green'|'red'|'pending'} */
  ciWatch?: () => 'green' | 'red' | 'pending';
  /** @brief Evaluasi worktree (test + secret-scan) di EVALUATE (opsional). @return {EvalOutput} hasil gate. */
  eval?: (worktree: string) => EvalOutput;
  /** @brief Ambang Pareto layak-commit (EVALUATE). */
  paretoThreshold: number;
}
