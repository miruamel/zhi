/** @brief Critic: cyclomatic complexity — count branches per function. @since 0.2.6 */
import type { CriticResult } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

/** @brief Max complexity before penalty. @since 0.2.6 */
const MAX_COMPLEXITY = 10;
/** @brief Penalty per point over limit. @since 0.2.6 */
const PENALTY_PER_POINT = 0.02;

/** @brief Count cyclomatic complexity of a function body. @since 0.2.6 */
function complexity(body: string): number {
  let c = 1;
  for (const line of body.split('\n')) {
    const t = line.trim();
    if (t.startsWith('//')) continue;
    c += (t.match(/\b(if|for|while|case|catch|\|\||&&)\b/g) ?? []).length;
  }
  return c;
}

/** @brief Extract function bodies from source. @since 0.2.6 */
function extractFunctions(src: string): Array<{ name: string; body: string }> {
  const out: Array<{ name: string; body: string }> = [];
  const re = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    out.push({ name: m[1], body: m[2] });
  }
  return out;
}

/** @brief Complexity critic: penalize functions exceeding MAX_COMPLEXITY.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.2.6 */
export function complexityCritic(files: FileRecord[]): CriticResult {
  const findings: string[] = [];
  let worst = 0;
  for (const f of files) {
    for (const fn of extractFunctions(f.content)) {
      const c = complexity(fn.body);
      if (c > MAX_COMPLEXITY) {
        findings.push(`${f.path}:${fn.name} complexity=${c} (max ${MAX_COMPLEXITY})`);
        if (c > worst) worst = c;
      }
    }
  }
  const score = Math.max(0, Math.min(1, 1 - PENALTY_PER_POINT * (worst - MAX_COMPLEXITY)));
  return { name: 'complexity', score, weight: 0.6, findings };
}
