/** @brief Critic: deteksi file dengan export publik tapi tanpa @brief (AGENTS.Style.md). @since 0.2.0 */
import type { Critique } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

const EXPORT_RE = /^\s*export\s+(?:async\s+)?(?:function|const|class|interface|type|let|var|enum)\b/m;
const BRIEF_RE = /@brief\b/;
const TEST_RE = /\.test\.(ts|js)$/;

// ponytail: cek file-level (ada export tapi nol @brief). Per-symbol check adalah upgrade
// bila diperlukan; repo saat ini 0 pelanggaran, jadi gate tetap hijau & cegah regresi.
/** @brief Doc critic: tiap file dengan export tanpa @brief kurangi 0.2 (floor 0), bobot 1.0.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.2.0 */
export function docCritic(files: FileRecord[]): Critique {
  const findings: string[] = [];
  let count = 0;
  for (const f of files) {
    if (TEST_RE.test(f.path)) continue;
    if (!EXPORT_RE.test(f.content)) continue;
    if (!BRIEF_RE.test(f.content)) {
      findings.push(`${f.path} missing-@brief`);
      count++;
    }
  }
  const score = Math.max(0, 1 - 0.2 * count);
  return { name: 'doc', score, weight: 1.0, findings };
}
