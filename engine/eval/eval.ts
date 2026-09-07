/**
 * @fileoverview Evaluation coordinator — ties security, test, gate together. @since 0.2.6
 * @package zhi
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

export interface EvalOpts {
  files: Array<{ path: string; content: string }>;
  gateThreshold?: number;
}

export interface EvalResult {
  ok: boolean;
  passed: boolean;
  score: number;
  criteria: string[];
  blockers: string[];
  durationMs: number;
}

export interface EvalRunResult {
  passed: boolean;
  score: number;
  reasons: string[];
}

export function evaluate(worktree: string): EvalRunResult {
  const reasons: string[] = [];
  const files = collectFiles(worktree);
  const security = scanSecurity(files);
  if (!security.ok) {
    reasons.push('secret bocor');
    return { passed: false, score: 0, reasons };
  }
  const testResult = runTests(worktree);
  if (!testResult.allPassed) {
    reasons.push('test gagal');
    return { passed: false, score: 0, reasons };
  }
  reasons.push('criteria met');
  return { passed: true, score: 1, reasons };
}

function collectFiles(dir: string): Array<{ path: string; content: string }> {
  const out: Array<{ path: string; content: string }> = [];
  const walk = (d: string) => {
    let entries: string[];
    try {
      entries = readdirSync(d);
    } catch {
      return;
    }
    for (const e of entries) {
      const full = join(d, e);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) walk(full);
      else if (st.isFile() && (e.endsWith('.ts') || e.endsWith('.js'))) {
        try {
          out.push({ path: full, content: readFileSync(full, 'utf-8') });
        } catch {
          // skip unreadable
        }
      }
    }
  };
  walk(dir);
  return out;
}

function runTests(worktree: string): { allPassed: boolean } {
  try {
    const res = spawnSync('bun', ['test', worktree], {
      cwd: process.cwd(),
      encoding: 'utf-8',
      timeout: 30_000,
    });
    if (res.error) return { allPassed: false };
    const out = (res.stdout ?? '') + (res.stderr ?? '');
    const failMatch = out.match(/(\d+)\s+fail/);
    if (failMatch && parseInt(failMatch[1]!, 10) > 0) return { allPassed: false };
    return { allPassed: true };
  } catch {
    return { allPassed: false };
  }
}

export interface SecurityFinding {
  rule: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  path: string;
  line: number;
  message: string;
}

export interface SecurityReport {
  ok: boolean;
  findings: SecurityFinding[];
  scanned: number;
  score: number;
}

const SECRET_PATTERNS: Array<{
  regex: RegExp;
  rule: string;
  severity: SecurityFinding['severity'];
}> = [
  { regex: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i, rule: 'api-key', severity: 'high' },
  { regex: /secret\s*[:=]\s*['"][^'"]+['"]/i, rule: 'secret', severity: 'high' },
  { regex: /password\s*[:=]\s*['"][^'"]+['"]/i, rule: 'password', severity: 'high' },
  { regex: /token\s*[:=]\s*['"][^'"]+['"]/i, rule: 'token', severity: 'medium' },
  { regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, rule: 'private-key', severity: 'critical' },
];

export function scanSecurity(files: Array<{ path: string; content: string }>): SecurityReport {
  const findings: SecurityFinding[] = [];
  for (const f of files) {
    const lines = f.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const p of SECRET_PATTERNS) {
        const m = p.regex.exec(lines[i]);
        if (m) {
          findings.push({
            rule: p.rule,
            severity: p.severity,
            path: f.path,
            line: i + 1,
            message: `Matched ${p.rule}`,
          });
        }
      }
    }
  }
  const score = findings.length === 0 ? 100 : Math.max(0, 100 - findings.length * 25);
  return { ok: findings.length === 0, findings, scanned: files.length, score };
}

export function scanSecrets(worktree: string): { leaked: boolean; findings: string[] } {
  const files = collectFiles(worktree);
  const report = scanSecurity(files);
  return {
    leaked: !report.ok,
    findings: report.findings.map((f) => `${f.path}:${f.line} ${f.rule}`),
  };
}
