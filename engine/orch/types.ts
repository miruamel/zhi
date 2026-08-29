/** @brief Tipe data planner Zhi (murni, 0 dependensi eksternal). @since 0.1.0 */

/** @brief Constraint hasil parse goal. @since 0.1.0 */
export interface Constraint {
  /** @brief Jenis constraint (language|budget|file|other). */
  kind: string;
  /** @brief Nilai constraint. */
  value: string;
}

/** @brief Intent terstruktur dari goal berbahasa alami. @since 0.1.0 */
export interface Intent {
  /** @brief Teks goal asli. */
  raw: string;
  /** @brief Token kata kunci (stopword dibuang). */
  tokens: string[];
  /** @brief Constraint terdeteksi. */
  constraints: Constraint[];
}

/** @brief Satu step dalam DAG rencana. @since 0.1.0 */
export interface Step {
  /** @brief ID unik step (s0, s1, ...). */
  id: string;
  /** @brief Label human-readable. */
  label: string;
  /** @brief ID step pra-syarat. */
  deps: string[];
  /** @brief Estimasi kompleksitas (basis alokasi token). */
  estimate: number;
  /** @brief Prioritas 0..1 (1 = tertinggi). */
  priority: number;
}

/** @brief Edge dependensi terarah. @since 0.1.0 */
export interface Edge {
  /** @brief Step sumber (harus selesai dulu). */
  from: string;
  /** @brief Step tujuan. */
  to: string;
}

/** @brief DAG rencana bebas-siklus, terurut topologis. @since 0.1.0 */
export interface Dag {
  /** @brief Semua step. */
  nodes: Step[];
  /** @brief Edge dependensi. */
  edges: Edge[];
  /** @brief Urutan topologis ID step. */
  order: string[];
}

/** @brief Error bila DAG mengandung siklus. @since 0.1.0 */
export class CycleError extends Error {
  /** @brief ID step yang membentuk siklus. */
  readonly cycle: string[];
  constructor(cycle: string[]) {
    super(`orch: cycle detected: ${cycle.join(' -> ')}`);
    this.name = 'CycleError';
    this.cycle = cycle;
  }
}
