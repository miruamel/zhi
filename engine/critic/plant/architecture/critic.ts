/** @brief Critic: architecture — layering rules, fractal depth, barrel checks. @since 0.2.6 */
import type { CriticResult } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

/** @brief Cruiser runner — produces an architecture dependency report. @since 0.2.6 */
export type CruiserRunner = () => {
  modules: Array<{ source: string; dependencies: string[]; orphan: boolean; valid: boolean }>;
  errors?: string[];
};

/** @brief Max nesting depth before penalty. @since 0.2.6 */
const MAX_DEPTH = 10;
/** @brief Max files per folder. @since 0.2.6 */
const MAX_FILES_PER_FOLDER = 4;

interface PathInfo {
  dir: string;
  file: string;
}

function parsePath(p: string): PathInfo {
  const idx = p.lastIndexOf('/');
  if (idx < 0) return { dir: '', file: p };
  return { dir: p.slice(0, idx), file: p.slice(idx + 1) };
}

function depth(dir: string): number {
  if (!dir) return 0;
  return dir.split('/').filter((s) => s.length > 0).length;
}

/** @brief Architecture critic: penalize deep nesting, folder bloat, missing barrels.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.2.6 */
export function architectureCritic(files: FileRecord[]): CriticResult {
  const findings: string[] = [];
  const dirCounts = new Map<string, number>();
  let maxDepth = 0;
  for (const f of files) {
    const info = parsePath(f.path);
    const d = depth(info.dir);
    if (d > maxDepth) maxDepth = d;
    dirCounts.set(info.dir, (dirCounts.get(info.dir) ?? 0) + 1);
  }
  if (maxDepth > MAX_DEPTH) {
    findings.push(`max nesting depth ${maxDepth} exceeds ${MAX_DEPTH}`);
  }
  for (const [dir, count] of dirCounts) {
    if (count > MAX_FILES_PER_FOLDER) {
      findings.push(`folder "${dir}" has ${count} files (max ${MAX_FILES_PER_FOLDER})`);
    }
  }
  const score = Math.max(0, 1 - 0.05 * findings.length);
  return { name: 'architecture', score, weight: 1.0, findings };
}
