/**
 * @brief Parse argv CLI Zhi: argumen non-flag pertama = goal, --threshold=N default 0.8.
 * @param {string[]} argv - argumen baris perintah (biasanya `process.argv.slice(2)`).
 * @return {{goal: string; threshold: number}} goal + ambang Pareto.
 * @since 0.1.0
 */
export function parseArgs(argv: string[]): { goal: string; threshold: number } {
  const goal = argv.find((a) => !a.startsWith('--')) ?? '';
  const thr = argv.find((a) => a.startsWith('--threshold='));
  const parsed = thr ? Number(thr.split('=')[1]) : 0.8;
  return { goal, threshold: Number.isFinite(parsed) ? parsed : 0.8 };
}
