/** @brief Critic: deteksi sink injeksi berbahaya (mandate §7, §12). @since 0.2.0 */
import type { Critique } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

interface SinkPattern {
  re: RegExp;
  label: string;
}

// ponytail: hanya sink eksplisit high-confidence. Sink kontekstual (SQL tanpa
// parameter) butuh analisis alur; di luar scope static single-file. Tambah di sini
// bila ada bukti injeksi nyata di artefak generated.
const SINK_RES: SinkPattern[] = [
  { re: /\beval\s*\(/, label: 'eval-call' },
  { re: /\bnew\s+Function\s*\(/, label: 'new-function' },
  { re: /innerHTML\s*=/, label: 'innerHTML-assign' },
  { re: /dangerouslySetInnerHTML/, label: 'dangerously-set-inner-html' },
  { re: /\bchild_process\.(exec|execSync)\s*\(/, label: 'child-process-exec' },
  { re: /\bexecSync\s*\(/, label: 'exec-sync' },
];

/** @brief Security critic: tiap sink injeksi kurangi 0.3 (floor 0), bobot 1.5.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.2.0 */
export function securityCritic(files: FileRecord[]): Critique {
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
