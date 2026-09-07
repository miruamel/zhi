/** @brief Critic: concurrency — detect unsafe async patterns. @since 0.2.6 */
import type { CriticResult } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

/** @brief Penalty per unsafe pattern. @since 0.2.6 */
const PENALTY = 0.03;

/** @brief Unsafe patterns that can cause race conditions. @since 0.2.6 */
const UNSAFE_PATTERNS: RegExp[] = [
  /\basync\s+function\s+\w+\s*\([^)]*\)\s*\{[^}]*\bawait\s+\w+\s*=[^;]*\n[^}]*\b\w+\s*=/,
  /\bnew\s+Promise\s*\([^)]*\)/,
  /\bsetTimeout\s*\(/,
  /\bsetInterval\s*\(/,
  /\bPromise\.all\s*\(/,
  /\bPromise\.race\s*\(/,
  /\bthen\s*\(/,
];

/** @brief Concurrency critic: penalize files with many async hazards.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.2.6 */
export function concurrencyCritic(files: FileRecord[]): CriticResult {
  const findings: string[] = [];
  let score = 1;
  for (const f of files) {
    let count = 0;
    for (const p of UNSAFE_PATTERNS) {
      const matches = f.content.match(p);
      if (matches) count += matches.length;
    }
    if (count > 0) {
      findings.push(`${f.path}: ${count} concurrency pattern(s)`);
      score -= PENALTY * count;
    }
  }
  return { name: 'concurrency', score: Math.max(0, score), weight: 0.4, findings };
}
