#!/usr/bin/env bun
/**
 * @brief Unit test for gate.ts fast-path logic.
 * @since 0.1.4
 */

import { expect, test } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getChangedFiles, isNonDocs } from './gate';

const cases: Array<[string, boolean]> = [
  ['audit-log/README.md', false],
  ['audit-log/entries/foo.md', false],
  ['README.md', false],
  ['CHANGES.md', false],
  ['docs/ARCHITECTURE.md', false],
  ['.prettierignore', false],
  ['.gitignore', true],
  ['.github/workflows/ci.yml', true],
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

test('runs full gate for CI workflow changes', () => {
  for (const [file, expected] of cases) {
    expect(isNonDocs(file), file).toBe(expected);
  }
});

test('fails closed when changed-file discovery is unavailable', () => {
  const dir = mkdtempSync(join(tmpdir(), 'zhi-gate-'));
  try {
    expect(getChangedFiles('origin/main', dir)).toBeNull();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
