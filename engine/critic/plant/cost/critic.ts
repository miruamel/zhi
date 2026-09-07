/** @brief Critic: cost — detect expensive operations, wasteful patterns. @since 0.2.6 */
import type { CriticResult } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

/** @brief Penalty per expensive pattern. @since 0.2.6 */
const PENALTY = 0.02;

/** @brief Expensive operation patterns. @since 0.2.6 */
const EXPENSIVE: RegExp[] = [
  /\bJSON\.parse\s*\([^)]*\)/,
  /\bJSON\.stringify\s*\([^)]*\)/,
  /\bnew\s+Date\s*\(\)/,
  /\bDate\.now\s*\(\)/,
  /\bsetTimeout\s*\([^)]*\)/,
  /\bsetInterval\s*\([^)]*\)/,
  /\bconsole\.log\s*\(/,
  /\bconsole\.debug\s*\(/,
  /\bconsole\.info\s*\(/,
  /\bconsole\.warn\s*\(/,
  /\bconsole\.error\s*\(/,
  /\bfs\.readFileSync\s*\(/,
  /\bfs\.writeFileSync\s*\(/,
  /\brequire\s*\(/,
  /\bimport\s*\(/,
  /\bArray\.prototype\.sort\s*\(/,
  /\bArray\.prototype\.filter\s*\(/,
  /\bArray\.prototype\.map\s*\(/,
  /\bArray\.prototype\.reduce\s*\(/,
];

/** @brief Cost critic: penalize files with expensive operations in hot paths.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.2.6 */
export function costCritic(files: FileRecord[]): CriticResult {
  const findings: string[] = [];
  let score = 1;
  for (const f of files) {
    let count = 0;
    for (const p of EXPENSIVE) {
      const matches = f.content.match(p);
      if (matches) count += matches.length;
    }
    if (count > 0) {
      findings.push(`${f.path}: ${count} potentially expensive operation(s)`);
      score -= PENALTY * count;
    }
  }
  return { name: 'cost', score: Math.max(0, score), weight: 0.3, findings };
}
