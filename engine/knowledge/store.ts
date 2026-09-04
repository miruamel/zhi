/** @brief Store knowledge in-memory (atomic). @since 0.1.1 */

/** @brief Entri knowledge. @since 0.1.1 */
export interface Fact {
  /** @brief Kunci unik. */
  key: string;
  /** @brief Nilai/teks. */
  value: string;
  /** @brief Tag kategorisasi. */
  tags: string[];
}

/** @brief Penyimpanan fakta sederhana (Map-backed). @since 0.1.1 */
export class KnowledgeStore {
  private map = new Map<string, Fact>();

  /** @brief Tambah/overwrite fakta. @param {Fact} fact */
  add(fact: Fact): void {
    this.map.set(fact.key, fact);
  }

  /** @brief Ambil fakta by key. @param {string} key @return {Fact | undefined} */
  get(key: string): Fact | undefined {
    return this.map.get(key);
  }

  /** @brief Cari fakta by tag. @param {string} tag @return {Fact[]} */
  byTag(tag: string): Fact[] {
    const out: Fact[] = [];
    for (const f of this.map.values()) {
      if (f.tags.includes(tag)) out.push(f);
    }
    return out;
  }
}
