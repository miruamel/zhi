/** @brief Critic: deteksi anti-pattern aksesibilitas dasar di kode UI generated. @since 0.1.1 */
import type { Critique } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

const IMG_NO_ALT_RE = /<img\b(?:(?!alt=)[^>])*>/i;
const ONCLICK_RE = /\bonClick\b/i;
const KEYBOARD_RE = /\b(?:onKeyDown|onKeyPress|onKeyUp)\b/i;
const TEST_RE = /\.test\.(ts|tsx|js|jsx)$/;

// ponytail: 2 anti-pattern high-confidence (img tanpa alt, onClick tanpa keyboard
// handler). Per-role/ARIA-expanded check adalah upgrade bila repo punya komponen UI
// nyata; Zhi adalah CLI/engine (TS), jadi critic ini rendah sinyal di scaffold non-UI
// tapi tetap valid sebagai gate generik (WCAG 2.1 AA, mandate §9.3).
/** @brief Accessibility critic: tiap temuan kurangi 0.1 (floor 0), bobot 1.0.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.1.1 */
export function accessibilityCritic(files: FileRecord[]): Critique {
  const findings: string[] = [];
  let count = 0;
  for (const f of files) {
    if (TEST_RE.test(f.path)) continue;
    if (IMG_NO_ALT_RE.test(f.content)) {
      findings.push(`${f.path} img-without-alt`);
      count++;
    }
    if (ONCLICK_RE.test(f.content) && !KEYBOARD_RE.test(f.content)) {
      findings.push(`${f.path} onClick-without-keyboard-handler`);
      count++;
    }
  }
  const score = Math.max(0, 1 - 0.1 * count);
  return { name: 'accessibility', score, weight: 1.0, findings };
}
