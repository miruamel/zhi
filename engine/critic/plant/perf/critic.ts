/** @brief Critic: deteksi debug noise (debugger, console.*) di generated code. @since 0.2.0 */
import type { Critique } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

const PERF_RES: RegExp[] = [/\bdebugger\s*;/, /\bconsole\.(log|debug|warn|error|info)\s*\(/];

/** @brief Perf critic: debugger/console.* kurangi 0.15 (floor 0), bobot 1.0.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.2.0 */
export function perfCritic(files: FileRecord[]): Critique {
  const findings: string[] = [];
  let count = 0;
  for (const f of files) {
    const lines = f.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const re of PERF_RES) {
        if (re.test(lines[i])) {
          findings.push(`${f.path}:${i + 1} debug-noise`);
          count++;
          break;
        }
      }
    }
  }
  const score = Math.max(0, 1 - 0.15 * count);
  return { name: 'perf', score, weight: 1.0, findings };
}
