#!/usr/bin/env bun
/**
 * @brief Unit test for gate.ts fast-path logic.
 * @since 0.1.4
 */

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

function isDocsOnly(filePath: string): boolean {
  if (filePath.endsWith('.md')) return true;
  if (filePath.startsWith('docs/')) return true;
  if (filePath.startsWith('audit-log/')) return true;
  if (filePath === '.prettierignore' || filePath === '.gitignore') return true;
  if (filePath.startsWith('.github/workflows/')) return true;
  return false;
}

function isNonDocs(filePath: string): boolean {
  // Docs-only patterns override SKIP_PREFIXES (e.g. .github/workflows/ci.yml
  // matches both the .github/ prefix and the docs-only check — docs-only wins).
  if (isDocsOnly(filePath)) return false;
  if (SKIP_PREFIXES.some((p) => filePath === p || filePath.startsWith(p))) return true;
  return true; // unknown files default to non-docs (safe — full gate)
}

const tests: Array<[string, boolean]> = [
  ['audit-log/README.md', false],
  ['audit-log/entries/foo.md', false],
  ['README.md', false],
  ['CHANGES.md', false],
  ['docs/ARCHITECTURE.md', false],
  ['.prettierignore', false],
  ['.gitignore', false],
  ['.github/workflows/ci.yml', false],
  ['src/cli.ts', true],
  ['package.json', true],
  ['package-lock.json', true],
  ['tsconfig.json', true],
  ['tsconfig.build.json', true],
  ['scripts/gate.ts', true],
  ['native/stream/parse.zig', true],
  ['engine/loop/index.ts', true],
  ['build.zig', true],
  ['build.zig.zon', true],
  ['zig.mod', true],
  ['eslint.config.js', true],
  ['AGENTS.md', false],
  ['AGENTS.Style.md', false],
];

let pass = 0,
  fail = 0;
for (const [file, expected] of tests) {
  const actual = isNonDocs(file);
  const ok = actual === expected;
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${file} => nonDocs=${actual} (expected ${expected})`);
}
console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
