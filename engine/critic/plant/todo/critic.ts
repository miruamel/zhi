/** @brief Critic: deteksi TODO/FIXME/XXX (mandate §6 cleanliness). @since 0.1.0 */
import type { Critique } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

const RE = /\b(TODO|FIXME|XXX)\b/;

/** @brief Todo critic: setiap marker kurangi skor 0.1 (floor 0).
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.1.0 */
export function todoCritic(files: FileRecord[]): Critique {
  const findings: string[] = [];
  let count = 0;
  for (const f of files) {
    const lines = f.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(RE);
      if (m) {
        findings.push(`${f.path}:${i + 1} ${m[1]}`);
        count++;
      }
    }
  }
  const score = Math.max(0, 1 - 0.1 * count);
  return { name: 'todo', score, weight: 1, findings };
}
