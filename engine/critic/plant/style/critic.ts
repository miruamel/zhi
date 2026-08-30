/** @brief Critic: deteksi pelanggaran style (any type, ts-ignore). @since 0.2.0 */
import type { Critique } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

const STYLE_RES: RegExp[] = [
  /:\s*any\b/,
  /\bas\s+any\b/,
  /@ts-ignore/,
  /@ts-nocheck/,
];

/** @brief Style critic: any/ts-ignore kurangi 0.15 (floor 0), bobot 1.0.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.2.0 */
export function styleCritic(files: FileRecord[]): Critique {
  const findings: string[] = [];
  let count = 0;
  for (const f of files) {
    const lines = f.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const re of STYLE_RES) {
        if (re.test(lines[i])) {
          findings.push(`${f.path}:${i + 1} weak-type`);
          count++;
          break;
        }
      }
    }
  }
  const score = Math.max(0, 1 - 0.15 * count);
  return { name: 'style', score, weight: 1.0, findings };
}
