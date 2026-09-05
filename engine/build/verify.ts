/** @brief Verifikasi statis scaffold modul domain. @since 0.1.1 */
import type { ScaffoldFile } from './generate';

/** @brief Hasil verifikasi scaffold. @since 0.1.1 */
export interface VerifyResult {
  ok: boolean;
  violations: string[];
}

const MAX_FILES_PER_DIR = 5;
// ponytail: hitung level naik persis (>=2 level naik dianggap pelanggaran).
// Scaffold saat ini belum punya import nyata; aturan ini siap saat generate mulai
// menulis import antar-modul.
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
      const match = line.match(/^\s*import\s+.*from\s+['"]([^'"]+)['"]/);
      if (match) {
        const spec = match[1];
        if (spec.startsWith('.')) {
          const ups = (spec.match(/\.\.\//g) ?? []).length;
          if (ups >= 2) { // 2 or more levels up is considered a violation
            violations.push(`deep relative import (${ups} levels up): ${f.path}`);
            break;
          }
        }
      }
    }
  }
  for (const [dir, n] of byDir) {
    if (n > MAX_FILES_PER_DIR)
      violations.push(`dir exceeds ${MAX_FILES_PER_DIR} files: ${dir} (${n})`);
  }
  return { ok: violations.length === 0, violations };
}
