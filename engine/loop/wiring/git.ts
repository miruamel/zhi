/** @brief Adapter git/gh deterministik untuk state ISOLATE/PR_OPEN/CI_WATCH. @since 0.1.1 */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

/** @brief Jalankan perintah; return stdout atau throw bila exit != 0. @since 0.1.1 */
function run(cmd: string[], cwd = process.cwd()): string {
  const r = spawnSync(cmd[0], cmd.slice(1), { cwd, encoding: 'utf8' });
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
  run(['git', 'worktree', 'add', wt, '-b', branch]);
  return wt;
}
/** @brief Commit hasil EXECUTE di dalam worktree (COMMIT). @since 0.1.1 */
export function gitCommit(worktree: string, message: string): void {
  run(['git', 'add', '-A'], worktree);
  run(['git', 'commit', '-m', message], worktree);
}

/** @brief Buka PR via gh dari dalam worktree (PR_OPEN). @return {string} URL PR. @since 0.1.1 */
export function ghPrOpen(worktree: string, title: string, body: string): string {
  const out = run(['gh', 'pr', 'create', '--title', title, '--body', body], worktree);
  const url = out.match(/https?:\/\/\S+/)?.[0];
  if (!url) throw new Error(`gh pr create: no URL in output: ${out.trim()}`);
  return url;
}

/** @brief Pantau status CI PR aktif (CI_WATCH). @return {'green'|'red'|'pending'}. @since 0.1.1 */
export function ghCiWatch(): 'green' | 'red' | 'pending' {
  const out = run(['gh', 'pr', 'checks'], process.cwd()).toLowerCase();
  if (out.includes('fail')) return 'red';
  if (out.includes('pending') || out.includes('in progress') || out.trim() === '') return 'pending';
  if (out.includes('pass') || out.includes('success')) return 'green';
  return 'pending';
}
