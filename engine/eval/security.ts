/** @brief Pemindaian secret di worktree (SAST ringan). @since 0.1.1 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** @brief Pola secret umum (ERE). @since 0.1.1 */
const SECRET_PATTERNS = [
  /(?:api[_-]?key|secret|token|password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}/i,
  /sk-[A-Za-z0-9]{20,}/,
  /ghp_[A-Za-z0-9]{20,}/,
  /AKIA[0-9A-Z]{16}/,
];

/** @brief Hasil pemindaian secret. @since 0.1.1 */
export interface SecretScan {
  /** @brief true bila ada kecocokan (atau scan error). */
  leaked: boolean;
  /** @brief Baris kecocokan (maks 10). */
  findings: string[];
}

/** @brief Entry dari `readdirSync({ withFileTypes: true })`. @since 0.1.1 */
export interface DirentLike {
  name: string;
  isDirectory(): boolean;
  isFile(): boolean;
}

/**
 * @brief Callback per-file selama `walkDir`. Return `true` untuk berhenti dini.
 * @since 0.1.1
 */
type FileVisitor = (file: string, content: string) => boolean;

/** @brief Walk directory tree, skip .git + node_modules. @since 0.1.1 */
function walkDir(dir: string, onFile: FileVisitor): void {
  let entries: DirentLike[];
  try {
    entries = readdirSync(dir, { withFileTypes: true }) as unknown as DirentLike[];
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      walkDir(p, onFile);
    } else if (e.isFile()) {
      try {
        const content = readFileSync(p, 'utf8');
        if (onFile(p, content)) return;
      } catch {
        /* skip unreadable */
      }
    }
  }
}

/** @brief Scan worktree untuk secret via Node fs (cross-platform, tanpa grep dependency).
 * @param {string} worktree - path worktree absolut.
 * @return {SecretScan} status + temuan. Fail-closed bila directory tidak ditemukan.
 * @since 0.1.1 */
export function scanSecrets(worktree: string): SecretScan {
  const findings: string[] = [];
  try {
    if (!statSync(worktree).isDirectory())
      return { leaked: true, findings: [`scan error: not a directory: ${worktree}`] };
    walkDir(worktree, (file, content) => {
      for (const pat of SECRET_PATTERNS) {
        const m = content.match(pat);
        if (m) {
          const line = content.slice(0, m.index).split('\n').length;
          findings.push(`${file}:${line}: ${m[0].slice(0, 80)}`);
          if (findings.length >= 10) return true;
        }
      }
      return false;
    });
  } catch (e) {
    return { leaked: true, findings: [`scan error: ${(e as Error).message}`] };
  }
  return { leaked: findings.length > 0, findings };
}
