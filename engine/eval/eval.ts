/**
 * @fileoverview Evaluation coordinator — ties security, test, gate together. @since 0.1.9
 * @package zhi
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

import { scanSecurity } from './scan';
export { scanSecurity };

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

export async function evaluate(worktree: string): Promise<EvalRunResult> {
  const reasons: string[] = [];
  const files = collectFiles(worktree);
  const security = await scanSecurity(files);
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
          /* skip unreadable */
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

export async function scanSecrets(
  worktree: string,
): Promise<{ leaked: boolean; findings: string[] }> {
  const files = collectFiles(worktree);
  const report = await scanSecurity(files);
  return {
    leaked: !report.ok,
    findings: report.findings.map((f) => `${f.file}:${f.line} ${f.rule}`),
  };
}
