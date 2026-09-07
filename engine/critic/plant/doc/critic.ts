/** @brief Critic: deteksi file dengan export publik tapi tanpa @brief (AGENTS.Style.md). @since 0.1.1 */
import type { CriticResult } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

const TEST_RE = /\.test\.(ts|js)$/;

// ponytail: upgraded to per-symbol @brief check (exported function/const/class/interface/type/let/var/enum).
// Next: check @param/@return tags for functions if needed.
/** @brief Doc critic: tiap simbol diekspor tanpa @brief kurangi 0.2 (floor 0), bobot 1.0.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.1.1 */
export function docCritic(files: FileRecord[]): CriticResult {
  const findings: string[] = [];
  let count = 0;
  for (const f of files) {
    if (TEST_RE.test(f.path)) continue;

    // Split content into lines for processing
    const lines = f.content.split('\n');

    // Find all export declarations and check if they have @brief in preceding comment
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match export declarations: export (async)? function|const|class|interface|type|let|var|enum
      if (
        /^\s*export\s+(?:async\s+)?(?:function|const|class|interface|type|let|var|enum)\b/.test(
          line,
        )
      ) {
        // Look backwards for JSDoc comment with @brief
        let hasBrief = false;
        let j = i - 1;
        // Skip empty lines and look for comment block
        while (j >= 0 && lines[j].trim() === '') {
          j--;
        }
        // Check for JSDoc comment
        if (j >= 0 && lines[j].trim().startsWith('/**')) {
          // Scan backwards through the comment block
          let k = j;
          while (k >= 0 && lines[k].trim() !== '') {
            if (lines[k].includes('@brief')) {
              hasBrief = true;
              break;
            }
            k--;
          }
        }

        if (!hasBrief) {
          // Extract symbol name for better reporting
          const symbolMatch = line.match(
            /(?:function|const|class|interface|type|let|var|enum)\s+([^\s\(]+)/,
          );
          const symbolName = symbolMatch ? symbolMatch[1] : 'unknown';
          findings.push(`${f.path}:${i + 1} missing-@brief for exported ${symbolName}`);
          count++;
        }
      }
    }
  }
  const score = findings.length === 0 ? 1 : Math.max(0, 1 - 0.2 * count);
  return { name: 'doc', score, weight: 1.0, findings };
}
