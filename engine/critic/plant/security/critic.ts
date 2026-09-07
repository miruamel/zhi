/** @brief Critic: deteksi sink injeksi berbahaya (mandate §7, §12). @since 0.1.1 */
import type { CriticResult } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

interface SinkPattern {
  re: RegExp;
  label: string;
}

// ponytail: improved to catch Function and new Function. Next: contextual SQL injection via taint analysis if generated artifacts show evidence.
const SINK_RES: SinkPattern[] = [
  { re: /(?<!\.)\beval\s*\(/, label: 'eval-call' },
  { re: /\b(?:new\s+)?Function\s*\(/, label: 'function-call' },
  { re: /innerHTML\s*=/, label: 'innerHTML-assign' },
  { re: /dangerouslySetInnerHTML/, label: 'dangerously-set-inner-html' },
  { re: /\bchild_process\.(exec|execSync)\s*\(/, label: 'child-process-exec' },
  { re: /\bexecSync\s*\(/, label: 'exec-sync' },
];

/** @brief Security critic: tiap sink injeksi kurangi 0.3 (floor 0), bobot 1.5.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.1.1 */
export function securityCritic(files: FileRecord[]): CriticResult {
  const findings: string[] = [];
  let count = 0;
  for (const f of files) {
    const lines = f.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const p of SINK_RES) {
        if (p.re.test(lines[i])) {
          findings.push(`${f.path}:${i + 1} ${p.label}`);
          count++;
        }
      }
    }
  }
  const score = Math.max(0, 1 - 0.3 * count);
  return { name: 'security', score, weight: 1.5, findings };
}
