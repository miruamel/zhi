/** @brief Critic: code duplication — detect repeated blocks. @since 0.2.6 */
import type { CriticResult } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

/** @brief Min block length to flag. @since 0.2.6 */
const MIN_BLOCK = 5;
/** @brief Max duplicate ratio before penalty. @since 0.2.6 */
const MAX_RATIO = 0.15;

/** @brief Hash a normalized line. @since 0.2.6 */
function norm(line: string): string {
  return line.trim().replace(/\s+/g, ' ');
}

/** @brief Duplication critic: penalize repeated code blocks across files.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.2.6 */
export function duplicationCritic(files: FileRecord[]): CriticResult {
  const findings: string[] = [];
  const blocks = new Map<string, string[]>();
  for (const f of files) {
    const lines = f.content
      .split('\n')
      .map(norm)
      .filter((l) => l.length > 0 && !l.startsWith('//'));
    for (let i = 0; i <= lines.length - MIN_BLOCK; i++) {
      const block = lines.slice(i, i + MIN_BLOCK).join('\n');
      const key = block;
      if (!blocks.has(key)) blocks.set(key, []);
      blocks.get(key)!.push(`${f.path}:${i + 1}`);
    }
  }
  let dupCount = 0;
  for (const [_, locs] of blocks) {
    if (locs.length > 1) {
      dupCount++;
      findings.push(`duplicated block at ${locs.join(', ')}`);
    }
  }
  const totalLines = files.reduce((s, f) => s + f.content.split('\n').length, 0);
  const ratio = totalLines > 0 ? (dupCount * MIN_BLOCK) / totalLines : 0;
  const score = Math.max(0, 1 - ratio / MAX_RATIO);
  return { name: 'duplication', score, weight: 0.5, findings };
}
