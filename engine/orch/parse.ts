/** @brief Task parser: tokenisasi goal -> Intent + constraints. @since 0.1.0 */
import type { Constraint, Intent } from './types';

const STOPWORDS = new Set([
  'a', 'an', 'the', 'to', 'for', 'of', 'on', 'in', 'with', 'using', 'make', 'build', 'create',
  'and', 'then', 'lalu', 'kemudian', 'dan', 'untuk', 'dengan', 'pakai', 'buat',
]);
export { STOPWORDS };

/** @brief Parse goal jadi intent terstruktur + constraints.
 * @param {string} goal - teks goal berbahasa alami.
 * @return {Intent} intent (tokens + constraints).
 * @throw {Error} bila goal kosong/whitespace-only.
 * @see docs/design/orch.md
 * @since 0.1.0 */
export function parseGoal(goal: string): Intent {
  const raw = goal.trim();
  if (!raw) throw new Error('orch: goal kosong');
  const tokens = raw
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/i)
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
  return { raw, tokens, constraints: extractConstraints(raw) };
}

/** @brief Ekstrak constraint sederhana dari teks goal.
 * @param {string} raw - teks goal asli.
 * @return {Constraint[]} constraint terdeteksi.
 * @since 0.1.0 */
export function extractConstraints(raw: string): Constraint[] {
  const out: Constraint[] = [];
  const lang = raw.match(/\b(?:in|dengan|using|pakai)\s+([a-z+#]+)/i);
  if (lang) out.push({ kind: 'language', value: lang[1] });
  const budget = raw.match(/budget[=:\s]+(\d+)/i);
  if (budget) out.push({ kind: 'budget', value: budget[1] });
  return out;
}
