/** @brief Adapter git/gh deterministik untuk state ISOLATE/PR_OPEN/CI_WATCH. @since 0.1.1 */
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { resolve } from 'node:path';
import { rmSync } from 'node:fs';

/** @brief Batas waktu default per command (ms). @since 0.1.2 */
const DEFAULT_TIMEOUT_MS = 30000;

/** @brief Jalankan perintah; return stdout atau throw bila exit != 0.
 * @param {string[]} cmd - perintah + argumen.
 * @param {string} cwd - working directory.
 * @param {number} timeoutMs - batas waktu dalam ms (default 30000). 0 = dinonaktifkan.
 * @param {function} spawn - injectable spawnSync (default: node:child_process.spawnSync).
 * @return {string} stdout.
 * @since 0.1.1
 * @since 0.1.4 made injectable to avoid mock.module pollution across test files
 */
export function run(
  cmd: string[],
  cwd = process.cwd(),
  timeoutMs = DEFAULT_TIMEOUT_MS,
  spawn: Parameters<typeof spawnSync>[0] extends string
    ? typeof spawnSync
    : typeof spawnSync = spawnSync,
): string {
  const r = spawn(cmd[0], cmd.slice(1), {
    cwd,
    encoding: 'utf8',
    timeout: timeoutMs || undefined,
    input: '',
  }) as SpawnSyncReturns<string>;
  if (r.error) throw new Error(`git/gh spawn error: ${cmd.join(' ')} -> ${r.error.message}`);
  if (r.status !== 0) {
    throw new Error(`git/gh failed: ${cmd.join(' ')} -> ${r.stderr?.trim() ?? r.status}`);
  }
  return r.stdout ?? '';
}

/** @brief Derivasi nama branch dari goal. @since 0.1.1 */
export function branchSlug(goal: string): string {
  const slug = goal
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `feat/${slug || 'task'}`;
}

/** @brief Path worktree terisolasi untuk branch. @since 0.1.1 */
export function worktreePath(branch: string): string {
  return resolve(process.cwd(), '..', `zhi-wt-${branch.replace(/\//g, '-')}`);
}

/** @brief Buat git worktree terisolasi dari HEAD (ISOLATE). @return {string} path worktree absolut. @since 0.1.1 */
export function gitIsolate(goal: string): string {
  const branch = branchSlug(goal);
  const wt = worktreePath(branch);
  // Idempotent cleanup: rmSync handles dirs that aren't valid git worktrees
  // (git worktree remove exits 128 for those), then git cleanup handles the rest.
  try { rmSync(wt, { recursive: true, force: true }); } catch { /* ignore */ }
  try { run(['git', 'worktree', 'remove', '--force', wt]); } catch { /* ignore */ }
  try { run(['git', 'branch', '-D', branch]); } catch { /* ignore */ }
  run(['git', 'worktree', 'add', wt, '-b', branch]);
  return wt;
}

/** @brief Commit hasil EXECUTE di dalam worktree (COMMIT). @since 0.1.1 */
export function gitCommit(worktree: string, message: string): void {
  run(['git', 'add', '-A'], worktree);
  run(['git', 'commit', '-m', message], worktree);
}

/** @brief Buka PR via gh dari dalam worktree (PR_OPEN). @return {string} URL PR. @since 0.1.1 */
export function ghPrOpen(
  worktree: string,
  title: string,
  body: string,
  spawn: typeof spawnSync = spawnSync,
): string {
  const out = run(
    ['gh', 'pr', 'create', '--title', title, '--body', body],
    worktree,
    DEFAULT_TIMEOUT_MS,
    spawn,
  );
  const url = out.match(/https?:\/\/\S+/)?.[0];
  if (!url) throw new Error(`gh pr create: no URL in output: ${out.trim()}`);
  return url;
}

/** @brief Pantau status CI PR aktif (CI_WATCH). @return {'green'|'red'|'pending'}. @since 0.1.1 */
export function ghCiWatch(spawn: typeof spawnSync = spawnSync): 'green' | 'red' | 'pending' {
  const out = run(['gh', 'pr', 'checks'], process.cwd(), DEFAULT_TIMEOUT_MS, spawn).toLowerCase();
  if (out.includes('fail')) return 'red';
  if (out.includes('pending') || out.includes('in progress') || out.trim() === '') return 'pending';
  if (out.includes('pass') || out.includes('success')) return 'green';
  return 'pending';
}
