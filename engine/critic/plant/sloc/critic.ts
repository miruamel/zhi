/** @brief Critic: batas SLOC per file (mandate §6.3, hard ≤200). @since 0.1.1 */
import type { Critique } from '../../aggregate';

/** @brief Rekor satu file yang diaudit plant. @since 0.1.1 */
export interface FileRecord {
  /** @brief Path relatif file. */
  path: string;
  /** @brief Isi file. */
  content: string;
}

/** @brief Hitung SLOC: baris non-kosong, non-komentar.
 * Skip baris kosong dan baris komentar (garis miring ganda atau blok). Baris blok multi-line dilompati per-baris.
 * @param {string} src - isi file.
 * @return {number} jumlah SLOC.
 * @since 0.1.1 */
export function countSloc(src: string): number {
  let n = 0;
  for (const line of src.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith('//')) continue;
    if (t.startsWith('/*') || t.startsWith('*')) continue;
    n++;
  }
  return n;
}

/** @brief Sloc critic: skor 1 bila semua file ≤ limit; penalty proporsional ke pelanggaran.
 * @param {FileRecord[]} files - kumpulan file.
 * @param {number} [limit=200] - batas SLOC per file.
 * @return {Critique} hasil critic.
 * @since 0.1.1 */
export function slocCritic(files: FileRecord[], limit = 200): Critique {
  const findings: string[] = [];
  let worst = 0;
  for (const f of files) {
    const n = countSloc(f.content);
    if (n > limit) {
      findings.push(f.path + ': ' + n + ' SLOC (>' + limit + ')');
      if (n > worst) worst = n;
    }
  }
  const score = findings.length === 0 ? 1 : Math.max(0, 1 - (worst - limit) / limit);
  return { name: 'sloc', score, weight: 1, findings };
}
