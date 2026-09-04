/** @brief Critic: Legal hygiene repo-wide (LICENSE, README). @since 0.1.1 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Critique } from '../../../aggregate';

/** @brief Legal critic: LICENSE + README wajib ada. Penalti 0.3/finding, floor 0, bobot 1.0.
 * @param {string} root - path repo (bukan per-file).
 * @return {Critique} hasil critic.
 * @since 0.1.1 */
export function legalCritic(root: string): Critique {
  const findings: string[] = [];
  if (!existsSync(join(root, 'LICENSE'))) findings.push(`${root} missing LICENSE`);
  if (!existsSync(join(root, 'README.md'))) findings.push(`${root} missing README.md`);
  const score = Math.max(0, 1 - 0.3 * findings.length);
  return { name: 'legal', score, weight: 1.0, findings };
}
