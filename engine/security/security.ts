/**
 * @fileoverview Security engine — secret detection, vulnerability scanning, and security audit.
 * @since 0.2.6
 * @package zhi
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

/** @brief Security finding. @since 0.2.6 */
export interface SecurityFinding {
  file: string;
  line: number;
  rule: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

/** @brief Security report. @since 0.2.6 */
export interface SecurityReport {
  findings: SecurityFinding[];
  score: number;
  durationMs: number;
  leaked: boolean;
}

/** @brief Security scan options. @since 0.2.6 */
export interface SecurityScanOptions {
  paths?: string[];
  patterns?: Array<{ name: string; pattern: RegExp; severity: SecurityFinding['severity'] }>;
  ignore?: string[];
  maxDepth?: number;
}

/** @brief Default secret patterns. @since 0.2.6 */
export const DEFAULT_SECRET_PATTERNS: Array<{
  name: string;
  pattern: RegExp;
  severity: SecurityFinding['severity'];
}> = [
  {
    name: 'api-key',
    pattern: /(?:api[_-]?key|apikey|API_KEY)\s*[:=]\s*['"]?[\w-]{20,}['"]?/gi,
    severity: 'critical',
  },
  {
    name: 'password',
    pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"]?[\w-]{8,}['"]?/gi,
    severity: 'high',
  },
  {
    name: 'token',
    pattern: /(?:token|secret|auth)\s*[:=]\s*['"]?[\w-]{20,}['"]?/gi,
    severity: 'high',
  },
  {
    name: 'private-key',
    pattern: /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/g,
    severity: 'critical',
  },
  { name: 'aws-key', pattern: /AKIA[0-9A-Z]{16}/g, severity: 'critical' },
  { name: 'github-token', pattern: /gh[pousr]_[0-9A-Za-z]{36}/g, severity: 'critical' },
];

/** @brief Security engine — scans for secrets and vulnerabilities. @since 0.2.6 */
export class SecurityEngine {
  private patterns: Array<{ name: string; pattern: RegExp; severity: SecurityFinding['severity'] }>;

  constructor(options: SecurityScanOptions = {}) {
    this.patterns = options.patterns ?? DEFAULT_SECRET_PATTERNS;
  }

  /** @brief Scan a file for secrets. @since 0.2.6 */
  async scanFile(path: string): Promise<SecurityFinding[]> {
    const findings: SecurityFinding[] = [];
    try {
      const content = await readFile(path, 'utf-8');
      const lines = content.split('\n');
      for (const pattern of this.patterns) {
        const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (regex.test(line)) {
            findings.push({
              file: path,
              line: i + 1,
              rule: pattern.name,
              message: `Potential ${pattern.name} detected`,
              severity: pattern.severity,
            });
          }
        }
      }
    } catch {
      /* skip unreadable */
    }
    return findings;
  }

  /** @brief Scan a directory recursively. @since 0.2.6 */
  async scanDir(dir: string, maxDepth = 5): Promise<SecurityFinding[]> {
    const findings: SecurityFinding[] = [];
    const scan = async (current: string, depth: number): Promise<void> => {
      if (depth > maxDepth) return;
      try {
        const entries = await readdir(current);
        for (const entry of entries) {
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

  /** @brief Generate a security report. @since 0.2.6 */
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
    const score = leaked ? 0 : 100;
    return { findings, score, durationMs: Date.now() - startedAt, leaked };
  }

  /** @brief Get severity weight. @since 0.2.6 */
  severityWeight(severity: SecurityFinding['severity']): number {
    switch (severity) {
      case 'critical':
        return 10;
      case 'high':
        return 7;
      case 'medium':
        return 4;
      case 'low':
        return 2;
      case 'info':
        return 1;
    }
  }

  /** @brief Filter findings by severity. @since 0.2.6 */
  filterBySeverity(
    findings: SecurityFinding[],
    minSeverity: SecurityFinding['severity'],
  ): SecurityFinding[] {
    const weights: Record<SecurityFinding['severity'], number> = {
      critical: 10,
      high: 7,
      medium: 4,
      low: 2,
      info: 1,
    };
    const minWeight = weights[minSeverity];
    return findings.filter((f) => weights[f.severity] >= minWeight);
  }
}

/** @brief Create a security engine. @since 0.2.6 */
export function createSecurityEngine(options?: SecurityScanOptions): SecurityEngine {
  return new SecurityEngine(options);
}
