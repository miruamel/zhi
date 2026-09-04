/** @brief Critic: Testing hygiene repo-wide (setiap source dir punya test). @since 0.1.1 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import type { Critique } from '../../../aggregate';

const CODE_EXT: Record<string, true> = { '.ts': true, '.tsx': true, '.js': true, '.jsx': true };

/** @brief File butuh test sibling bila punya export runtime (function/class/const/enum/default)
 * atau cukup panjang (>20 SLOC). Shell murni (type/interface/re-export) dikecualikan agar
 * critic tidak memaksa scaffold untuk file tanpa logika.
 * @param {string} full @return {boolean} */
function needsTest(full: string): boolean {
  const src = readFileSync(full, 'utf8');
  if (src.split('\n').length > 20) return true;
  return /export\s+(default\s+)?(async\s+)?(function|class|const|let|var|enum)\b/.test(src);
}

/** @brief Kumpulkan file source non-trivial (bukan test, bukan shell) di src/ + engine/.
 * @param {string} root @return {string[]} */
function sources(root: string): string[] {
  const out: string[] = [];
  for (const top of ['src', 'engine']) {
    const base = join(root, top);
    if (!existsSync(base)) continue;
    const walk = (dir: string): void => {
      for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (
          CODE_EXT[full.slice(full.lastIndexOf('.'))] &&
          !/\.test\.(ts|tsx|js|jsx)$/.test(name) &&
          !/^test\.(ts|tsx|js|jsx)$/.test(name) &&
          needsTest(full)
        )
          out.push(full);
      }
    };
    walk(base);
  }
  return out;
}

/** @brief Directory sumber punya setidaknya satu test file — co-located ATAU di subdir test/.
 * Mengakomodasi konvensi repo: test terkonsolidasi (resil.test.ts) maupun per-source di test/.
 * @param {string} src @return {boolean} */
function dirHasTests(src: string): boolean {
  const dir = dirname(src);
  if (readdirSync(dir).some((f) => /\.test\.(ts|tsx|js|jsx)$/.test(f))) return true;
  const testDir = join(dir, 'test');
  if (existsSync(testDir) && readdirSync(testDir).some((f) => /\.test\.(ts|tsx|js|jsx)$/.test(f)))
    return true;
  // Consolidated sibling test/ dir (e.g. src/cli/commands/*.ts covered by src/cli/test/*.test.ts)
  const siblingTestDir = join(dirname(dir), 'test');
  if (
    existsSync(siblingTestDir) &&
    readdirSync(siblingTestDir).some((f) => /\.test\.(ts|tsx|js|jsx)$/.test(f))
  )
    return true;
  return false;
}

/** @brief Testing critic: tiap source non-trivial di dir tanpa test = finding. Penalti 0.2, floor 0, bobot 1.0.
 * @param {string} root - path repo (bukan per-file).
 * @return {Critique} hasil critic.
 * @since 0.1.1 */
export function testingCritic(root: string): Critique {
  const findings: string[] = [];
  for (const src of sources(root)) {
    if (!dirHasTests(src)) findings.push(`${relative(root, src)} has no test coverage`);
  }
  const score = Math.max(0, 1 - 0.2 * findings.length);
  return { name: 'testing', score, weight: 1.0, findings };
}
