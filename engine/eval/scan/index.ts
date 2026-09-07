/**
 * @fileoverview Security scanning wrapper for eval. @since 0.1.9
 * @package zhi
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { SecurityEngine, type SecurityFinding } from '../../security/security';

export interface ScanResult {
  ok: boolean;
  findings: SecurityFinding[];
  score: number;
}

/** @brief Scan files for secrets. @since 0.1.9 */
export async function scanSecurity(
  files: Array<{ path: string; content: string }>,
): Promise<ScanResult> {
  const id = randomUUID();
  const tmp = join(tmpdir(), `zhi-scan-${id}`);
  mkdirSync(tmp, { recursive: true });
  try {
    for (const f of files) {
      const dest = join(tmp, f.path.replace(/^[a-z]:[/\\]/i, '').replace(/\//g, '_'));
      writeFileSync(dest, f.content, 'utf-8');
    }
    const engine = new SecurityEngine();
    const report = await engine.report([tmp]);
    return { ok: !report.leaked, findings: report.findings, score: report.score };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

/** @brief Alias for scanSecurity. @since 0.1.9 */
export { scanSecurity as scanSecrets };
