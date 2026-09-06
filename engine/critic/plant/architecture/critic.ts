/** @brief Critic: arsitektural drift via dependency-cruiser (repo-wide holistic). @since 0.1.1 */
import { spawnSync } from 'child_process';
import type { Critique } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

/** @brief Hasil parse JSON dependency-cruiser. @since 0.1.1 */
export interface CruiserReport {
  modules: Array<{
    source: string;
    dependencies: Array<{
      module: string;
      resolved: string;
      circular: boolean;
      valid: boolean;
      dependencyTypes: string[];
    }>;
    orphan: boolean;
    valid: boolean;
  }>;
}

/** @brief Runner function type — injectable for tests. @since 0.1.8 */
export type CruiserRunner = () => CruiserReport | null;

/** @brief Exclude test files and artifacts so they don't pollute the graph.
 * Matches patterns used in architecture-guard.sh. */
const EXCLUDE_RE = '\\.test\\.(ts|js|tsx|jsx)$|__tests__|\\.spec\\.(ts|js)$|dist|node_modules';

/** @brief Jalankan dependency-cruiser dan parse JSON output.
 * @return {CruiserReport | null} null only on parse failure; status != 0 (violations) still yields valid JSON.
 * @since 0.1.8 */
function runCruiserDefault(): CruiserReport | null {
  // __dirname is reliably set by Bun for ESM modules; avoids import.meta.url context issues in tests.
  const scriptPath = `${__dirname}/../../../../node_modules/dependency-cruiser/bin/dependency-cruise.mjs`;
  const res = spawnSync(
    process.execPath,
    [
      scriptPath,
      '-T',
      'json',
      '--validate',
      '--exclude',
      EXCLUDE_RE,
      'src/',
      'engine/',
      'scripts/',
      'native/',
    ],
    { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, cwd: '/root/zhi' },
  );
  if (!res || res.error) return null;
  try {
    return JSON.parse(res.stdout ?? '{}') as CruiserReport;
  } catch {
    return null;
  }
}

/** @brief Hitung pelanggaran dari laporan cruiser. orphan tidak dihitung — check-circular.ts
 * tidak pernah mempenalisasi orphan modules.
 * @param {CruiserReport} report @return {{circular: number, illegal: number}} @since 0.1.1 */
function countViolations(report: CruiserReport): { circular: number; illegal: number } {
  let circular = 0;
  let illegal = 0;
  for (const mod of report.modules) {
    for (const dep of mod.dependencies) {
      if (dep.circular) circular++;
      if (!dep.valid) illegal++;
    }
  }
  return { circular, illegal };
}

/** @brief Critic arsitektur: jalankan dependency-cruiser, skor berdasarkan pelanggaran.
 * @param {FileRecord[]} _files - diabaikan (holistic check butuh graf repo penuh).
 * @param {CruiserRunner} [runner] - injectable for testing (defaults to real dependency-cruiser).
 * @return {Critique} graduated: 0 violations → 1; penalti 0.5 per circular, 0.5 per illegal.
 * @since 0.1.1 */
export function architectureCritic(_files: FileRecord[], runner?: CruiserRunner): Critique {
  const runCruiser = runner ?? runCruiserDefault;
  const report = runCruiser();
  if (!report) {
    return {
      name: 'architecture',
      score: 0,
      weight: 1.5,
      findings: ['infra error: dependency-cruiser failed or invalid JSON'],
    };
  }
  const { circular, illegal } = countViolations(report);
  if (circular === 0 && illegal === 0) {
    return { name: 'architecture', score: 1, weight: 1.5, findings: [] };
  }
  const penalty = 0.5 * circular + 0.5 * illegal;
  const score = Math.max(0, 1 - penalty);
  const findings: string[] = [];
  if (circular) findings.push(`circular dependency: ${circular} cycle(s)`);
  if (illegal) findings.push(`illegal layer edge: ${illegal} violation(s)`);
  return { name: 'architecture', score, weight: 1.5, findings };
}
