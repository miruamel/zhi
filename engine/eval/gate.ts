/** @brief Gate evaluasi output. @since 0.1.1 */

/** @brief Input evaluasi. @since 0.1.1 */
export interface EvalInput {
  /** @brief Skor 0..1. */
  score: number;
  /** @brief Kriteria yang terpenuhi. */
  criteria: string[];
  /** @brief Blocker keras (wajib 0 agar lulus). */
  blockers: string[];
}

/** @brief Output evaluasi. @since 0.1.1 */
export interface EvalOutput {
  /** @brief Lulus gate. */
  passed: boolean;
  /** @brief Skor akhir. */
  score: number;
  /** @brief Alasan keputusan. */
  reasons: string[];
}

/** @brief Gate evaluasi: lulus bila tidak ada blocker DAN score >= threshold.
 * @param {EvalInput} input - hasil evaluasi.
 * @param {number} threshold - ambang lulus (default 0.7).
 * @return {EvalOutput} keputusan gate.
 * @see docs/design/eval.md
 * @since 0.1.1 */
export function gate(input: EvalInput, threshold = 0.7): EvalOutput {
  const reasons: string[] = [];
  if (input.blockers.length > 0) {
    reasons.push(`blocked: ${input.blockers.join(', ')}`);
    return { passed: false, score: input.score, reasons };
  }
  const passed = input.score >= threshold;
  reasons.push(
    passed ? `score ${input.score} >= ${threshold}` : `score ${input.score} < ${threshold}`,
  );
  if (input.criteria.length > 0) reasons.push(`criteria met: ${input.criteria.length}`);
  return { passed, score: input.score, reasons };
}
