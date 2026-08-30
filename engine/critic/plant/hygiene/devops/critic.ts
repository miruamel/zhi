/** @brief Critic: DevOps hygiene repo-wide (CI config, .gitignore). @since 0.2.0 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Critique } from '../../../aggregate';

/** @brief DevOps critic: CI + .gitignore wajib ada. Penalti 0.25/finding, floor 0, bobot 1.0.
 * @param {string} root - path repo (bukan per-file).
 * @return {Critique} hasil critic.
 * @since 0.2.0 */
export function devopsCritic(root: string): Critique {
  const findings: string[] = [];
  if (!existsSync(join(root, '.github', 'workflows')) && !existsSync(join(root, 'scripts', 'ci'))) {
    findings.push(`${root} missing CI (.github/workflows or scripts/ci)`);
  }
  if (!existsSync(join(root, '.gitignore'))) findings.push(`${root} missing .gitignore`);
  const score = Math.max(0, 1 - 0.25 * findings.length);
  return { name: 'devops', score, weight: 1.0, findings };
}
