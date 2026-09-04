/** @brief Verifikasi statis scaffold modul domain. @since 0.1.1 */
import type { ScaffoldFile } from './generate';

/** @brief Hasil verifikasi scaffold. @since 0.1.1 */
export interface VerifyResult {
  ok: boolean;
  violations: string[];
}

const MAX_FILES_PER_DIR = 5;
// ponytail: cukup deteksi ../.. (3+ level naik) sebagai pelanggaran deep-relative.
// Scaffold saat ini belum punya import nyata; aturan ini siap saat generate mulai
// menulis import antar-modul. Upgrade: hitung level naik persis, bukan regex.
const DEEP_RELATIVE = /\.\.\/\.\./;

/** @brief Verifikasi scaffold: jumlah file per dir, header Doxygen, import relatif dalam.
 * @param {ScaffoldFile[]} files - hasil generate().
 * @return {VerifyResult} ok + daftar pelanggaran (kosong bila lolos).
 * @since 0.1.1 */
export function verify(files: ScaffoldFile[]): VerifyResult {
  const violations: string[] = [];
  const byDir = new Map<string, number>();
  for (const f of files) {
    const dir = f.path.includes('/') ? f.path.slice(0, f.path.lastIndexOf('/')) : '.';
    byDir.set(dir, (byDir.get(dir) ?? 0) + 1);
    if (!/@brief/.test(f.content)) violations.push(`missing @brief: ${f.path}`);
    for (const line of f.content.split('\n')) {
      if (/^\s*import\s/.test(line) && DEEP_RELATIVE.test(line)) {
        violations.push(`deep relative import: ${f.path}`);
        break;
      }
    }
  }
  for (const [dir, n] of byDir) {
    if (n > MAX_FILES_PER_DIR)
      violations.push(`dir exceeds ${MAX_FILES_PER_DIR} files: ${dir} (${n})`);
  }
  return { ok: violations.length === 0, violations };
}
