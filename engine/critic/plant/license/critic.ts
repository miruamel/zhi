/** @brief Critic: license — detect license compatibility issues. @since 0.2.6 */
import type { CriticResult } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

/** @brief Penalty per license issue. @since 0.2.6 */
const PENALTY = 0.03;

/** @brief Compatible licenses. @since 0.2.6 */
const COMPATIBLE = new Set([
  'MIT',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  '0BSD',
  'Unlicense',
  'CC0-1.0',
]);

/** @brief License critic: penalize files with incompatible licenses.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.2.6 */
export function licenseCritic(files: FileRecord[]): CriticResult {
  const findings: string[] = [];
  let score = 1;
  for (const f of files) {
    const match = f.content.match(/SPDX-License-Identifier:\s*(\S+)/);
    if (match) {
      const lic = match[1];
      if (!COMPATIBLE.has(lic)) {
        findings.push(`${f.path}: license ${lic} may be incompatible`);
        score -= PENALTY;
      }
    }
  }
  return { name: 'license', score: Math.max(0, score), weight: 0.5, findings };
}
