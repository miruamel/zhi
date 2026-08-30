/** @brief Critic: arsitektural drift via CI guard (repo-wide holistic check). @since 0.1.0 */
import { spawnSync } from 'child_process';
import type { Critique } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

/** @brief Path script CI architecture guard (sumber tunggal aturan layer). @since 0.1.0 */
const GUARD = new URL('../../../../scripts/ci/architecture/check-circular.ts', import.meta.url);

/** @brief Jalankan guard terhadap repo (cwd default = repo root via Bun).
 * Exit 0 = clean; non-zero = arsitektur drift (circular / deep-relative / illegal layer edge).
 * Param `files` diterima untuk keseragaman antarmuka dengan critic lain, tapi diabaikan:
 * critic ini menilai repo secara holistic (bukan per-file slice).
 * @param {FileRecord[]} _files - diabaikan.
 * @return {Critique} clean bila exit 0; skor 0 + finding berisi stdout guard bila drift.
 * @since 0.1.0 */
export function architectureCritic(_files: FileRecord[]): Critique {
  const res = spawnSync('bun', ['run', GUARD.pathname], { encoding: 'utf8' });
  if (res.status === 0) {
    return { name: 'architecture', score: 1, weight: 1.5, findings: [] };
  }
  const detail = (res.stdout + res.stderr).trim();
  return {
    name: 'architecture',
    score: 0,
    weight: 1.5,
    findings: [`CI guard failed:\n${detail}`],
  };
}
