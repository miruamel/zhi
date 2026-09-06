/** @brief Critic: deteksi anti-pattern aksesibilitas dasar di kode UI generated. @since 0.1.1 */
import type { Critique } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

const IMG_NO_ALT_RE = /<img\b(?:(?!alt=)[^>])*>/i;
const KEYBOARD_RE = /\b(?:onKeyDown|onKeyPress|onKeyUp)\b/i;
const TEST_RE = /\.test\.(ts|tsx|js|jsx)$/;

// ponytail: improved to check for onClick on div/span without keyboard handler and without role="button" or "link".
// Next: per-role/ARIA-expanded checks if UI components become more prevalent in generated code.
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
    // Improved onClick check: only flag on div/span without keyboard handler and without role="button" or "link"
    const ONCLICK_DIV_SPAN_RE = /<(div|span)(\s+[^>]*)?onClick\s*=\s*[^>]*>/gi;
    const matches = f.content.matchAll(ONCLICK_DIV_SPAN_RE);
    for (const match of matches) {
      const attrs = match[2] || '';
      const roleRe = /role\s*=\s*"(button|link)"/i;
      if (!KEYBOARD_RE.test(f.content) && !roleRe.test(attrs)) {
        findings.push(`${f.path} onClick-without-keyboard-handler`);
        count++;
      }
    }
  }
  const score = Math.max(0, 1 - 0.1 * count);
  return { name: 'accessibility', score, weight: 1.0, findings };
}
