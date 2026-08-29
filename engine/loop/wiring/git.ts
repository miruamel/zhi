/** @brief Adapter git/gh deterministik untuk state ISOLATE/PR_OPEN/CI_WATCH. @since 0.1.0 */
import { spawnSync } from 'node:child_process';

/** @brief Jalankan perintah; return stdout atau throw bila exit != 0. @since 0.1.0 */
function run(cmd: string[], cwd = process.cwd()): string {
  const r = spawnSync(cmd[0], cmd.slice(1), { cwd, encoding: 'utf8' });
  if (r.status !== 0) {
    throw new Error(`git/gh failed: ${cmd.join(' ')} -> ${r.stderr?.trim() ?? r.status}`);
  }
  return r.stdout ?? '';
}

/** @brief Derivasi nama branch dari goal. @since 0.1.0 */
export function branchSlug(goal: string): string {
  const slug = goal
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `feat/${slug || 'task'}`;
}

/** @brief Buat branch baru dari HEAD (ISOLATE). @return {string} nama branch. @since 0.1.0 */
export function gitIsolate(goal: string): string {
  const branch = branchSlug(goal);
  run(['git', 'checkout', '-b', branch]);
  return branch;
}

/** @brief Buka PR via gh (PR_OPEN). @return {string} URL PR. @since 0.1.0 */
export function ghPrOpen(title: string, body: string): string {
  const out = run(['gh', 'pr', 'create', '--title', title, '--body', body]);
  const url = out.match(/https?:\/\/\S+/)?.[0];
  if (!url) throw new Error(`gh pr create: no URL in output: ${out.trim()}`);
  return url;
}

/** @brief Pantau status CI PR aktif (CI_WATCH). @return {'green'|'red'|'pending'}. @since 0.1.0 */
export function ghCiWatch(): 'green' | 'red' | 'pending' {
  const out = run(['gh', 'pr', 'checks'], process.cwd()).toLowerCase();
  if (out.includes('fail')) return 'red';
  if (out.includes('pending') || out.includes('in progress') || out.trim() === '') return 'pending';
  if (out.includes('pass') || out.includes('success')) return 'green';
  return 'pending';
}
