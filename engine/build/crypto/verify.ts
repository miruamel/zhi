/**
 * @fileoverview Build verify. @since 0.1.10
 * @package zhi
 */
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import type { ScaffoldFile } from '../core/scaffold';

/** @brief Verify result. @since 0.1.10 */
export interface VerifyResult {
  ok: boolean;
  files: number;
  violations: string[];
  errors: string[];
}

/** @brief Verify scaffold files. @since 0.1.10 */
export function verify(files: ScaffoldFile[]): VerifyResult {
  const errors: string[] = [];
  const dirCounts = new Map<string, number>();
  for (const f of files) {
    if (!f.path) errors.push('missing path');
    if (f.content === undefined) errors.push(`${f.path}: missing content`);
    if (f.content && !/@brief/.test(f.content)) errors.push(`${f.path}: missing @brief`);
    if (f.content && /(\.\.\/){3,}/.test(f.content)) {
      errors.push(`${f.path}: deep relative import`);
    }
    const dir = f.path.includes('/') ? f.path.split('/').slice(0, -1).join('/') : '.';
    dirCounts.set(dir, (dirCounts.get(dir) ?? 0) + 1);
  }
  for (const [dir, count] of dirCounts) {
    if (count > 5) errors.push(`${dir}: exceeds 5 files (${count})`);
  }
  return { ok: errors.length === 0, files: files.length, violations: errors, errors };
}

/** @brief Artifact verify result. @since 0.1.10 */
export interface ArtifactVerifyResult {
  ok: boolean;
  mismatches: string[];
}

/** @brief Verify options. @since 0.1.10 */
export interface VerifyOptions {
  algorithm?: 'sha256' | 'sha512';
}

/** @brief Verify engine. @since 0.1.10 */
export class VerifyEngine {
  private algorithm: 'sha256' | 'sha512';

  constructor(options: VerifyOptions = {}) {
    this.algorithm = options.algorithm ?? 'sha256';
  }

  async verify(path: string, expectedHash: string): Promise<ArtifactVerifyResult> {
    const data = await readFile(path);
    const hash = createHash(this.algorithm).update(data).digest('hex');
    return { ok: hash === expectedHash, mismatches: hash === expectedHash ? [] : [path] };
  }
}

/** @brief Create verify engine. @since 0.1.10 */
export function createVerifyEngine(options?: VerifyOptions): VerifyEngine {
  return new VerifyEngine(options);
}
