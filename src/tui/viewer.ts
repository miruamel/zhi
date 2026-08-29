/** @brief Viewer status loop (render core, tanpa dep). @since 0.1.0 */

/** @brief State yang ditampilkan viewer. @since 0.1.0 */
export interface ViewerState {
  /** @brief State loop saat ini. */
  loop: string;
  /** @brief Skor per critic. */
  critics: { name: string; score: number }[];
  /** @brief Skor evaluasi akhir. */
  evalScore: number;
  /** @brief Lulus gate evaluasi. */
  evalPassed: boolean;
  /** @brief Jumlah fakta di knowledge store. */
  knowledgeCount: number;
}

/** @brief Render state loop ke teks TUI flat.
 * @param {ViewerState} s - state terkini.
 * @return {string} blok teks multi-baris.
 * @see docs/design/tui.md (layer interaktif ink = fase berikutnya)
 * @since 0.1.0 */
export function render(s: ViewerState): string {
  const lines: string[] = [];
  lines.push(`loop: ${s.loop}`);
  lines.push('critics:');
  if (s.critics.length === 0) {
    lines.push('  (none)');
  } else {
    for (const c of s.critics) lines.push(`  - ${c.name}: ${c.score.toFixed(2)}`);
  }
  lines.push(`eval: ${s.evalScore.toFixed(2)} (${s.evalPassed ? 'PASS' : 'FAIL'})`);
  lines.push(`knowledge: ${s.knowledgeCount} facts`);
  return lines.join('\n');
}
