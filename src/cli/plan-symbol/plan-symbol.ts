/**
 * @brief Derivasi identifier simbol dari plan (token pertama, alphanumeric+underscore).
 * Fallback ke 'main' bila token kosong atau tidak dimulai huruf/underscore.
 * @param {string} plan - string plan/goal.
 * @return {string} identifier aman untuk nama file/branch.
 * @since 0.1.0
 */
export function planSymbol(plan: string): string {
  const head = plan.split(/[\s>]+/)[0] ?? '';
  const cleaned = head.replace(/[^a-zA-Z0-9_]/g, '');
  return /^[a-zA-Z_]/.test(cleaned) ? cleaned : 'main';
}
