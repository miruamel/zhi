/** @brief Critic: arsitektural drift via CI guard (repo-wide holistic). @since 0.1.0 */
import { spawnSync } from 'child_process';
import type { Critique } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

/** @brief Path script CI architecture guard (sumber tunggal aturan layer). @since 0.1.0 */
const GUARD = new URL('../../../../scripts/ci/architecture/check-circular.ts', import.meta.url);

/** @brief Hasil parse stdout guard. @since 0.1.0 */
export interface GuardReport {
  infraError: string | null;
  circular: number;
  deep: number;
  illegal: number;
  detail: string;
}

function countSection(stdout: string, header: string): number {
  // Match `header:` then violation lines (indented 2 spaces) until next section header or EOF.
  const re = new RegExp(`^${header}:\\n((?:  .+\\n?)*)`, 'm');
  const m = stdout.match(re);
  if (!m || !m[1]) return 0;
  return m[1].split('\n').filter(l => l.startsWith('  ') && l.length > 2).length;
}

/** @brief Parse stdout guard: hitung pelanggaran per kategori. @param {string} stdout @param {string} stderr @return {GuardReport} @since 0.1.0 */
export function parseGuard(stdout: string, stderr: string): GuardReport {
  return {
    infraError: stderr.trim() || null,
    circular: countSection(stdout, 'CIRCULAR DEPENDENCY'),
    deep: countSection(stdout, 'DEEP RELATIVE IMPORT \\(>3 naik\\)'),
    illegal: countSection(stdout, 'SKIPPED/ILLEGAL LAYER EDGE'),
    detail: stdout.trim(),
  };
}

/** @brief Jalankan guard terhadap repo. Holistic: menilai repo (bukan per-file slice)
 * karena beberapa aturan (circular dep, layer edge) butuh graf repo penuh. Param
 * `files` diterima untuk keseragaman antarmuka, diabaikan dengan sengaja.
 * @param {FileRecord[]} _files - diabaikan (holistic check, lihat JSDoc).
 * @return {Critique} graduated: 0 violations → 1; penalti 0.5 per circular, 0.25 per deep, 0.5 per illegal.
 * @since 0.1.0 */
export function architectureCritic(_files: FileRecord[]): Critique {
  const res = spawnSync('bun', ['run', GUARD.pathname], { encoding: 'utf8' });
  if (res.error) {
    return {
      name: 'architecture',
      score: 0,
      weight: 1.5,
      findings: [`infra error (skip CI guard): ${res.error.message}`],
    };
  }
  if (res.signal) {
    return {
      name: 'architecture',
      score: 0,
      weight: 1.5,
      findings: [`infra error (signal ${res.signal}): guard killed`],
    };
  }
  if (res.status === 0) {
    return { name: 'architecture', score: 1, weight: 1.5, findings: [] };
  }
  const report = parseGuard(res.stdout ?? '', res.stderr ?? '');
  if (report.infraError) {
    return {
      name: 'architecture',
      score: 0,
      weight: 1.5,
      findings: [`infra error (guard stderr): ${report.infraError}`],
    };
  }
  const penalty = 0.5 * report.circular + 0.25 * report.deep + 0.5 * report.illegal;
  const score = Math.max(0, 1 - penalty);
  const findings: string[] = [];
  if (report.circular) findings.push(`circular dependency: ${report.circular} cycle(s)`);
  if (report.deep) findings.push(`deep relative import: ${report.deep} violation(s)`);
  if (report.illegal) findings.push(`illegal layer edge: ${report.illegal} violation(s)`);
  if (findings.length === 0) findings.push('guard exited non-zero but no violations parsed (unknown drift)');
  return { name: 'architecture', score, weight: 1.5, findings };
}
