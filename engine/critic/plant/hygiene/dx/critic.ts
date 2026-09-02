/** @brief Critic: DX hygiene repo-wide (README quickstart, AGENTS.md, test script). @since 0.2.0 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Critique } from '../../../aggregate';

/** @brief DX critic: README quickstart + AGENTS.md + package.json test script. Penalti 0.2/finding, floor 0, bobot 0.8.
 * @param {string} root - path repo (bukan per-file).
 * @return {Critique} hasil critic.
 * @since 0.2.0 */
export function dxCritic(root: string): Critique {
  const findings: string[] = [];
  const readme = join(root, 'README.md');
  if (
    !existsSync(readme) ||
    !/quickstart|getting started|usage/i.test(readFileSync(readme, 'utf8'))
  ) {
    findings.push(`${root} README missing quickstart/usage section`);
  }
  if (!existsSync(join(root, 'AGENTS.md'))) findings.push(`${root} missing AGENTS.md`);
  const pkg = join(root, 'package.json');
  if (existsSync(pkg)) {
    try {
      const j = JSON.parse(readFileSync(pkg, 'utf8')) as { scripts?: Record<string, string> };
      if (!j.scripts?.test) findings.push(`${root} package.json missing test script`);
    } catch {
      findings.push(`${root} package.json invalid JSON`);
    }
  } else {
    findings.push(`${root} missing package.json`);
  }
  const score = Math.max(0, 1 - 0.2 * findings.length);
  return { name: 'dx', score, weight: 0.8, findings };
}
