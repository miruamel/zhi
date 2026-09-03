/** @brief Status glyphs (Plan/Build/Critique/Eval/Commit/Done). @since 0.1.0 */
export const glyphs = {
  running: '●',
  done: '✓',
  pending: '○',
  failed: '✗',
  scoring: '◉',
  forward: '⟶',
  loop: '⟴',
  up: '⇡',
  complete: '⊕',
  plan: 'PLAN',
  build: 'BUILD',
  critique: 'CRITIQUE',
  eval: 'EVAL',
  commit: 'COMMIT',
  done2: 'DONE',
  warn: '⚠',
  info: 'ℹ',
  bulb: '💡',
} as const;

export type GlyphKey = keyof typeof glyphs;
