/** @brief Jalankan test suite di worktree (regresi gate). @since 0.1.1 */
import { spawnSync } from 'node:child_process';

/** @brief Hasil eksekusi test. @since 0.1.1 */
export interface TestResult {
  /** @brief true bila `bun test` exit 0. */
  passed: boolean;
  /** @brief Gabungan stdout+stderr (dipotong 2000 char). */
  output: string;
}

/** @brief Jalankan `bun test` di dalam worktree terisolasi.
 * @param {string} worktree - path worktree absolut.
 * @return {TestResult} status + output (dipotong).
 * @since 0.1.1 */
export function runTests(worktree: string): TestResult {
  const r = spawnSync('bun', ['test'], { cwd: worktree, encoding: 'utf8' });
  const output = `${r.stdout ?? ''}${r.stderr ?? ''}`.slice(0, 2000);
  return { passed: r.status === 0, output };
}
