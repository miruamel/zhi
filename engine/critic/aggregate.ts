/** @brief Agregator multi-critic untuk gate kualitas. @since 0.1.1 */

/** @brief Hasil satu critic. @since 0.1.1 */
export interface Critique {
  /** @brief Nama critic (security/perf/style/...). */
  name: string;
  /** @brief Skor 0..1. */
  score: number;
  /** @brief Bobot relatif. */
  weight: number;
  /** @brief Temuan human-readable. */
  findings: string[];
}

/** @brief Hasil agregasi. @since 0.1.1 */
export interface AggregateResult {
  /** @brief Skor tertimbang 0..1. */
  score: number;
  /** @brief Lulus threshold. */
  passed: boolean;
  /** @brief Skor per critic. */
  byCritic: Record<string, number>;
  /** @brief Gabungan semua findings. */
  findings: string[];
}

/** @brief Agregasi multi-critic → skor tertimbang + gate.
 * @param {Critique[]} critiques - hasil tiap critic.
 * @param {number} threshold - ambang lulus (default 0.7).
 * @return {AggregateResult} hasil agregasi.
 * @see docs/design/critic.md
 * @since 0.1.1 */
export function aggregate(critiques: Critique[], threshold = 0.7): AggregateResult {
  if (critiques.length === 0) {
    return { score: 0, passed: false, byCritic: {}, findings: [] };
  }
  let wsum = 0;
  let swsum = 0;
  const byCritic: Record<string, number> = {};
  const findings: string[] = [];
  for (const c of critiques) {
    byCritic[c.name] = c.score;
    wsum += c.weight;
    swsum += c.weight * c.score;
    findings.push(...c.findings);
  }
  const score = wsum > 0 ? swsum / wsum : 0;
  return { score, passed: score >= threshold, byCritic, findings };
}
