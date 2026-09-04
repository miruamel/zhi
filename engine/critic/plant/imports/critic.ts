/** @brief Critic: deteksi deep relative import >3 (mandate §6.7, §6.11). @since 0.1.1 */
import type { Critique } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

const IMPORT_RE = /^\s*import\s+.*from\s+['"]([^'"]+)['"]/;

/** @brief Imports critic: skor 1 bila 0 deep-relative violation.
 * Path alias (engine/foo) dan relative ≤3 level dianggap sehat.
 * @param {FileRecord[]} files - kumpulan file.
 * @param {number} [maxUp=3] - batas naik level relatif.
 * @return {Critique} hasil critic.
 * @since 0.1.1 */
export function importsCritic(files: FileRecord[], maxUp = 3): Critique {
  const findings: string[] = [];
  let count = 0;
  for (const f of files) {
    const lines = f.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(IMPORT_RE);
      if (!m) continue;
      const spec = m[1];
      if (!spec.startsWith('.')) continue;
      const ups = (spec.match(/\.\.\//g) ?? []).length;
      if (ups > maxUp) {
        findings.push(
          f.path + ':' + (i + 1) + ' deep-relative ' + spec + ' (' + ups + '>' + maxUp + ')',
        );
        count++;
      }
    }
  }
  const score = Math.max(0, 1 - 0.25 * count);
  return { name: 'imports', score, weight: 1.5, findings };
}
