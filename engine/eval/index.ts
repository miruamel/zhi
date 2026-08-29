/** @brief Orkestrasi evaluasi: test + secret-scan -> gate. @since 0.1.0 */
import { gate, type EvalOutput } from './gate';
import { runTests } from './test';
import { scanSecrets } from './security';

/** @brief Evaluasi worktree: jalankan test + secret-scan, bangun criteria/blockers, gate.
 * @param {string} worktree - path worktree absolut.
 * @return {EvalOutput} keputusan gate (passed bila tanpa blocker).
 * @see docs/design/eval.md
 * @since 0.1.0 */
export function evaluate(worktree: string): EvalOutput {
  const t = runTests(worktree);
  const s = scanSecrets(worktree);
  const criteria: string[] = [];
  const blockers: string[] = [];
  if (t.passed) criteria.push('bun test hijau');
  else blockers.push(`test gagal: ${t.output.slice(0, 200)}`);
  if (!s.leaked) criteria.push('tanpa secret bocor');
  else blockers.push(...s.findings.map((f) => `secret bocor: ${f}`));
  return gate({ score: 1, criteria, blockers });
}
