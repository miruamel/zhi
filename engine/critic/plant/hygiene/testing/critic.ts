/** @brief Critic: Testing hygiene repo-wide (setiap source file punya test sibling). @since 0.2.0 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Critique } from '../../../aggregate';

const CODE_EXT: Record<string, true> = { '.ts': true, '.tsx': true, '.js': true, '.jsx': true };

/** @brief Kumpulkan file source (bukan test) di src/ + engine/. @param {string} root @return {string[]} */
function sources(root: string): string[] {
  const out: string[] = [];
  for (const top of ['src', 'engine']) {
    const base = join(root, top);
    if (!existsSync(base)) continue;
    const walk = (dir: string): void => {
      for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (CODE_EXT[full.slice(full.lastIndexOf('.'))] && !/\.test\.(ts|tsx|js|jsx)$/.test(name)) out.push(full);
      }
    };
    walk(base);
  }
  return out;
}

/** @brief Testing critic: tiap source tanpa test sibling = finding. Penalti 0.2, floor 0, bobot 1.0.
 * @param {string} root - path repo (bukan per-file).
 * @return {Critique} hasil critic.
 * @since 0.2.0 */
export function testingCritic(root: string): Critique {
  const findings: string[] = [];
  for (const src of sources(root)) {
    const testPath = src.replace(/(\.(ts|tsx|js|jsx))$/, '.test$1');
    if (!existsSync(testPath)) findings.push(`${relative(root, src)} missing test sibling`);
  }
  const score = Math.max(0, 1 - 0.2 * findings.length);
  return { name: 'testing', score, weight: 1.0, findings };
}
