/**
 * @fileoverview Security engine. @since 0.1.9
 * @package zhi
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { DEFAULT_SECRET_PATTERNS, type SecretPattern, type SecuritySeverity } from './patterns';

/** @brief Security finding. @since 0.1.9 */
export interface SecurityFinding {
  file: string;
  line: number;
  rule: string;
  message: string;
  severity: SecuritySeverity;
}

/** @brief Security report. @since 0.1.9 */
export interface SecurityReport {
  findings: SecurityFinding[];
  score: number;
  durationMs: number;
  leaked: boolean;
}

/** @brief Scan options. @since 0.1.9 */
export interface SecurityScanOptions {
  paths?: string[];
  patterns?: SecretPattern[];
  ignore?: string[];
  maxDepth?: number;
}

/** @brief Security engine. @since 0.1.9 */
export class SecurityEngine {
  constructor(private options: SecurityScanOptions = {}) {}

  async scanFile(path: string): Promise<SecurityFinding[]> {
    const findings: SecurityFinding[] = [];
    try {
      const content = await readFile(path, 'utf-8');
      const lines = content.split('\n');
      const patterns = this.options.patterns ?? DEFAULT_SECRET_PATTERNS;
      for (const p of patterns) {
        const regex = new RegExp(p.pattern.source, p.pattern.flags);
        for (let i = 0; i < lines.length; i++) {
          if (regex.test(lines[i])) {
            findings.push({
              file: path,
              line: i + 1,
              rule: p.name,
              message: `Potential ${p.name} detected`,
              severity: p.severity,
            });
          }
        }
      }
    } catch {
      /* skip unreadable */
    }
    return findings;
  }

  async scanDir(dir: string, maxDepth = 5): Promise<SecurityFinding[]> {
    const findings: SecurityFinding[] = [];
    const scan = async (current: string, depth: number): Promise<void> => {
      if (depth > maxDepth) return;
      try {
        for (const entry of await readdir(current)) {
          const full = join(current, entry);
          const s = await stat(full);
          if (s.isDirectory()) {
            await scan(full, depth + 1);
          } else if (s.isFile()) {
            findings.push(...(await this.scanFile(full)));
          }
        }
      } catch {
        /* skip */
      }
    };
    await scan(dir, 0);
    return findings;
  }

  async report(paths: string[]): Promise<SecurityReport> {
    const startedAt = Date.now();
    const findings: SecurityFinding[] = [];
    for (const path of paths) {
      const s = await stat(path);
      if (s.isDirectory()) {
        findings.push(...(await this.scanDir(path)));
      } else {
        findings.push(...(await this.scanFile(path)));
      }
    }
    const leaked = findings.some((f) => f.severity === 'critical' || f.severity === 'high');
    return { findings, score: leaked ? 0 : 100, durationMs: Date.now() - startedAt, leaked };
  }

  filterBySeverity(findings: SecurityFinding[], min: SecuritySeverity): SecurityFinding[] {
    const weights: Record<SecuritySeverity, number> = {
      critical: 10,
      high: 7,
      medium: 4,
      low: 2,
      info: 1,
    };
    const minWeight = weights[min];
    return findings.filter((f) => weights[f.severity] >= minWeight);
  }
}

/** @brief Create security engine. @since 0.1.9 */
export function createSecurityEngine(options?: SecurityScanOptions): SecurityEngine {
  return new SecurityEngine(options);
}
