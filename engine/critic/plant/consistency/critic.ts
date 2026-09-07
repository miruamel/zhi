/** @brief Critic: consistency — detect naming/style inconsistencies. @since 0.2.6 */
import type { CriticResult } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

/** @brief Penalty per inconsistency. @since 0.2.6 */
const PENALTY = 0.02;

/** @brief Consistency critic: penalize mixed naming conventions.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.2.6 */
export function consistencyCritic(files: FileRecord[]): CriticResult {
  const findings: string[] = [];
  let score = 1;
  const snakeCount = new Map<string, number>();
  const camelCount = new Map<string, number>();
  for (const f of files) {
    const snake = (f.content.match(/\b[a-z]+_[a-z0-9_]+\b/g) ?? []).length;
    const camel = (f.content.match(/\b[a-z]+[A-Z][a-zA-Z0-9]*\b/g) ?? []).length;
    if (snake > 0) snakeCount.set(f.path, snake);
    if (camel > 0) camelCount.set(f.path, camel);
  }
  for (const [path, count] of snakeCount) {
    if (camelCount.has(path) && count > 0) {
      findings.push(`${path}: mixed snake_case (${count}) and camelCase`);
      score -= PENALTY;
    }
  }
  return { name: 'consistency', score: Math.max(0, score), weight: 0.3, findings };
}
