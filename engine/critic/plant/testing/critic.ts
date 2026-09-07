/** @brief Critic: testing — detect missing tests for exported functions. @since 0.2.6 */
import type { CriticResult } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

/** @brief Penalty per untested export. @since 0.2.6 */
const PENALTY = 0.05;

/** @brief Extract exported function names from source. @since 0.2.6 */
function extractExports(src: string): string[] {
  const names: string[] = [];
  const re = /export\s+(?:async\s+)?function\s+(\w+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) names.push(m[1]);
  const re2 = /export\s+const\s+(\w+)\s*=/g;
  while ((m = re2.exec(src)) !== null) names.push(m[1]);
  return names;
}

/** @brief Testing critic: penalize exported functions without corresponding tests.
 * @param {FileRecord[]} srcFiles - source files.
 * @param {FileRecord[]} testFiles - test files.
 * @return {Critique} hasil critic.
 * @since 0.2.6 */
export function testingCritic(srcFiles: FileRecord[], testFiles: FileRecord[]): CriticResult {
  const findings: string[] = [];
  let untested = 0;
  const testNames = new Set<string>();
  for (const f of testFiles) {
    const re = /(?:test|it)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(f.content)) !== null) testNames.add(m[1].toLowerCase());
  }
  for (const f of srcFiles) {
    for (const name of extractExports(f.content)) {
      if (!testNames.has(name.toLowerCase()) && !f.path.endsWith('.test.')) {
        untested++;
        findings.push(`${f.path}: no test for export "${name}"`);
      }
    }
  }
  const score = Math.max(0, 1 - PENALTY * untested);
  return { name: 'testing', score, weight: 0.8, findings };
}
