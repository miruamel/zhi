/** @brief Critic: deteksi duplikasi baris kode (mandate §6, DRY). @since 0.1.1 */
import type { CriticResult } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

/** @brief Panjang minimum baris agar layak diaudit duplikasi. @since 0.1.1 */
const MIN_LEN = 12;
const IMPORT_RE = /^\s*import\s|^\s*export\s+\*?\s*\w*\s*from\s|require\(/;

/** @brief Ekstrak baris kode auditable: non-blank, non-komentar, non-import, >= MIN_LEN.
 * @param {string} src - isi file.
 * @return {string[]} baris ter-normalisasi (trim).
 * @since 0.1.1 */
export function codeLines(src: string): string[] {
  const out: string[] = [];
  for (const line of src.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*')) continue;
    if (t.length < MIN_LEN) continue;
    if (IMPORT_RE.test(t)) continue;
    out.push(t);
  }
  return out;
}

/** @brief Maintainability critic: skor 1 bila 0 duplikasi; penalty = rasio salinan redundan.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.1.1 */
export function maintainabilityCritic(files: FileRecord[]): CriticResult {
  const counts = new Map<string, number>();
  let total = 0;
  for (const f of files) {
    for (const ln of codeLines(f.content)) {
      total++;
      counts.set(ln, (counts.get(ln) ?? 0) + 1);
    }
  }
  const findings: string[] = [];
  let redundant = 0;
  for (const [ln, n] of counts) {
    if (n > 1) {
      redundant += n - 1;
      const snippet = ln.length > 60 ? ln.slice(0, 57) + '...' : ln;
      findings.push(`dup (${n}x): ${snippet}`);
    }
  }
  const ratio = total > 0 ? redundant / total : 0;
  const score = Math.max(0, 1 - ratio);
  return { name: 'maintainability', score, weight: 1, findings };
}
