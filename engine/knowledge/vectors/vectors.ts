/** @brief Store vektor in-memory + cosine search (atomic). @since 0.1.1 */

/** @brief Entri vektor. @since 0.1.1 */
export interface VectorEntry {
  /** @brief ID unik (overwrite bila sama). */
  id: string;
  /** @brief Vektor nilai float. */
  vector: number[];
  /** @brief Metadata bebas (opsional). */
  meta?: Record<string, unknown>;
}

/** @brief Hasil pencarian ter-score. @since 0.1.1 */
export interface ScoredEntry {
  /** @brief ID entri. */
  id: string;
  /** @brief Cosine similarity [−1, 1]. */
  score: number;
  /** @brief Metadata entri. */
  meta?: Record<string, unknown>;
}

/** @brief Penyimpanan vektor in-memory dengan pencarian cosine top-k. @since 0.1.1 */
export class VectorStore {
  private entries = new Map<string, VectorEntry>();
  private dim = 0;

  /** @brief Tambah/overwrite entri. @param {VectorEntry} entry
   *  @throw {Error} bila dimensi tak konsisten dengan store. */
  add(entry: VectorEntry): void {
    const d = entry.vector.length;
    if (this.dim === 0) this.dim = d;
    else if (d !== this.dim) throw new Error(`vector dim ${d} != store dim ${this.dim}`);
    this.entries.set(entry.id, entry);
  }

  /** @brief Jumlah entri. @return {number} */
  size(): number {
    return this.entries.size;
  }

  /** @brief Cari top-k by cosine similarity (descending).
   *  @param {number[]} q - query vector.
   *  @param {number} k - batas hasil (di-clamp ke size).
   *  @return {ScoredEntry[]} urut skor turun.
   *  @throw {Error} bila dim query tak cocok store. */
  search(q: number[], k: number): ScoredEntry[] {
    if (this.dim !== 0 && q.length !== this.dim) {
      throw new Error(`query dim ${q.length} != store dim ${this.dim}`);
    }
    const out: ScoredEntry[] = [];
    for (const e of this.entries.values()) {
      out.push({ id: e.id, score: cosine(q, e.vector), meta: e.meta });
    }
    out.sort((a, b) => b.score - a.score);
    return out.slice(0, Math.max(0, Math.min(k, out.length)));
  }
}

/** @brief Cosine similarity; 0 bila salah satu norm nol. @param {number[]} a @param {number[]} b
 *  @return {number} similarity [−1, 1]. */
function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
