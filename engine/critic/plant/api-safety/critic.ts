/** @brief Critic: API safety — detect unvalidated input, missing error handling. @since 0.2.6 */
import type { CriticResult } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

/** @brief Penalty per unsafe pattern. @since 0.2.6 */
const PENALTY = 0.04;

/** @brief Patterns that indicate missing input validation. @since 0.2.6 */
const UNSAFE: RegExp[] = [
  /\breq\.body\b(?![^;]*\.validate)/,
  /\breq\.query\b(?![^;]*\.validate)/,
  /\breq\.params\b(?![^;]*\.validate)/,
  /\bJSON\.parse\s*\([^)]*\)/,
  /\bres\.json\s*\(/,
  /\bres\.send\s*\(/,
  /\bres\.status\s*\(/,
  /\bexec\s*\(/,
  /\beval\s*\(/,
  /\bchild_process\b/,
  /\bfs\.readFile\s*\([^)]*\)/,
  /\bfs\.writeFile\s*\([^)]*\)/,
];

/** @brief API safety critic: penalize files with unsafe API patterns.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.2.6 */
export function apiSafetyCritic(files: FileRecord[]): CriticResult {
  const findings: string[] = [];
  let score = 1;
  for (const f of files) {
    let count = 0;
    for (const p of UNSAFE) {
      const matches = f.content.match(p);
      if (matches) count += matches.length;
    }
    if (count > 0) {
      findings.push(`${f.path}: ${count} unsafe API pattern(s)`);
      score -= PENALTY * count;
    }
  }
  return { name: 'api-safety', score: Math.max(0, score), weight: 0.7, findings };
}
