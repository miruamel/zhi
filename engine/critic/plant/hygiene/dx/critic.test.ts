/** @brief Test DX hygiene critic. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { dxCritic } from './critic';

/** @brief Buat direktori temp. @return {string} path */
function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'dx-'));
}

test('clean repo (quickstart + AGENTS + test script) scores 1', () => {
  const r = tmp();
  writeFileSync(join(r, 'README.md'), '# Zhi\n## Quickstart\nbun run\n');
  writeFileSync(join(r, 'AGENTS.md'), '# AGENTS\n');
  writeFileSync(join(r, 'package.json'), JSON.stringify({ scripts: { test: 'bun test' } }));
  const c = dxCritic(r);
  expect(c.score).toBe(1);
  expect(c.findings).toHaveLength(0);
  expect(c.weight).toBe(0.8);
});

test('missing quickstart + AGENTS + test penalized 0.4', () => {
  const r = tmp();
  writeFileSync(join(r, 'README.md'), '# Zhi\n'); // tanpa quickstart
  const c = dxCritic(r);
  expect(c.findings).toHaveLength(3);
  expect(c.score).toBeCloseTo(0.4);
});

test('invalid package.json reported', () => {
  const r = tmp();
  writeFileSync(join(r, 'README.md'), '# Zhi\n## Usage\n');
  writeFileSync(join(r, 'AGENTS.md'), '# AGENTS\n');
  writeFileSync(join(r, 'package.json'), '{ not json');
  const c = dxCritic(r);
  expect(c.findings.some((f) => f.includes('invalid JSON'))).toBe(true);
});
