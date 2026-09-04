/** @brief Pemindaian secret di worktree (SAST ringan). @since 0.1.1 */
import { spawnSync } from 'node:child_process';

/** @brief Pola secret umum (ERE). @since 0.1.1 */
const SECRET_PATTERNS = [
  /(?:api[_-]?key|secret|token|password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}/i,
  /sk-[A-Za-z0-9]{20,}/,
  /ghp_[A-Za-z0-9]{20,}/,
  /AKIA[0-9A-Z]{16}/,
];

/** @brief Hasil pemindaian secret. @since 0.1.1 */
export interface SecretScan {
  /** @brief true bila ada kecocokan (atau scan error). */
  leaked: boolean;
  /** @brief Baris kecocokan (maks 10). */
  findings: string[];
}

/** @brief Scan worktree untuk secret via `grep -rE` (exclude .git/node_modules).
 * @param {string} worktree - path worktree absolut.
 * @return {SecretScan} status + temuan. Fail-closed bila grep error (status 2).
 * @since 0.1.1 */
export function scanSecrets(worktree: string): SecretScan {
  const args = ['-rIE', '--exclude-dir=.git', '--exclude-dir=node_modules'];
  for (const p of SECRET_PATTERNS) args.push('-e', p.source);
  args.push(worktree);
  const r = spawnSync('grep', args, { encoding: 'utf8' });
  // ponytail: grep exit 2 = error (dir hilang/permission). Fail-closed -> block.
  if (r.status === 2)
    return { leaked: true, findings: [`scan error: ${r.stderr?.trim() || 'grep failed'}`] };
  const findings = (r.stdout ?? '').split('\n').filter(Boolean).slice(0, 10);
  return { leaked: findings.length > 0, findings };
}
