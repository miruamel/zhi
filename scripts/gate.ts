#!/usr/bin/env bun
/**
 * @brief Gate orchestrator: lint + format + typecheck + test, with optional docs-only fast-path.
 *
 * Usage:
 *   bun run scripts/gate.ts              # full gate
 *   bun run scripts/gate.ts --if-changed # skip typecheck+test when only docs/markdown changed
 *
 * When --if-changed is passed, the script inspects the diff between the current
 * HEAD and the base ref (origin/main or GITHUB_BASE_REF). If every changed file
 * is a documentation/markdown file, typecheck and test are skipped — they are
 * expensive and cannot fail on docs-only changes.
 *
 * @param {boolean} [--if-changed] enable docs-only fast-path
 * @return {number} exit code (0 = pass)
 * @since 0.1.4
 */

import { execSync } from 'child_process';

const ROOT = process.cwd();

// Non-docs prefixes that always force full gate.
const SKIP_PREFIXES = [
  'src/',
  'engine/',
  'native/',
  'package.json',
  'package-lock.json',
  'tsconfig',
  'scripts/',
  'build.zig',
  'build.zig.zon',
  'zig.mod',
];

/**
 * Returns true if `path` is a documentation-only change.
 * @param filePath
 */
function isDocsOnly(filePath: string): boolean {
  if (filePath.endsWith('.md')) return true;
  if (filePath.startsWith('docs/')) return true;
  if (filePath.startsWith('audit-log/')) return true;
  if (filePath === '.prettierignore') return true;
  if (filePath.startsWith('.github/workflows/')) return true; // workflow-only changes
  return false;
}

/**
 * Returns true if `path` touches any non-docs file.
 * @param filePath
 */
function isNonDocs(filePath: string): boolean {
  // Docs-only patterns override SKIP_PREFIXES (e.g. .github/workflows/ci.yml
  // matches both the .github/ prefix and the docs-only check — docs-only wins).
  if (isDocsOnly(filePath)) return false;
  if (SKIP_PREFIXES.some((p) => filePath === p || filePath.startsWith(p))) return true;
  return true; // unknown files default to non-docs (safe — full gate)
}

/** Resolve the base ref to diff against. */
function resolveBaseRef(): string {
  if (process.env.GITHUB_BASE_REF) {
    return `origin/${process.env.GITHUB_BASE_REF}`;
  }
  return 'origin/main';
}

/**
 * Get list of changed files between HEAD and base ref.
 * @param baseRef
 */
function getChangedFiles(baseRef: string): string[] {
  try {
    const out = execSync(
      `git -C "${ROOT}" diff --name-only ${baseRef}...HEAD 2>/dev/null || git -C "${ROOT}" diff --name-only HEAD~1 HEAD 2>/dev/null`,
      { cwd: ROOT, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 },
    );
    return out.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Run a command; throw on non-zero exit.
 * @param label
 * @param cmd
 */
function run(label: string, cmd: string): void {
  console.log(`[gate] ${label}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const fastPath = args.includes('--if-changed');

  if (fastPath) {
    const baseRef = resolveBaseRef();
    const files = getChangedFiles(baseRef);
    const nonDocs = files.filter(isNonDocs);

    if (nonDocs.length === 0) {
      console.log(
        `[gate] --if-changed: ${files.length} file(s) changed, all docs/markdown — skipping typecheck + test`,
      );
      run('lint', 'bun run lint');
      run('format:check', 'bun run format:check');
      console.log('[gate] fast-path passed');
      return;
    }
    console.log(
      `[gate] --if-changed: ${nonDocs.length} non-docs file(s) changed (${nonDocs.join(', ')}) — running full gate`,
    );
  }

  run('lint', 'bun run lint');
  run('format:check', 'bun run format:check');
  run('typecheck', 'bun run typecheck');
  run('test', 'bun run test');
  console.log('[gate] all checks passed');
}

main().catch((err) => {
  console.error('[gate] FAILED:', err.message ?? err);
  process.exit(1);
});
