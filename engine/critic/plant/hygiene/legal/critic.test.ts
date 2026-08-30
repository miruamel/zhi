/** @brief Test Legal hygiene critic. @since 0.2.0 */
import { test, expect } from 'bun:test';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { legalCritic } from './critic';

/** @brief Buat direktori temp. @return {string} path */
function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'legal-'));
}

test('clean repo (LICENSE + README) scores 1', () => {
  const r = tmp();
  writeFileSync(join(r, 'LICENSE'), 'MIT\n');
  writeFileSync(join(r, 'README.md'), '# Zhi\n');
  const c = legalCritic(r);
  expect(c.score).toBe(1);
  expect(c.findings).toHaveLength(0);
  expect(c.weight).toBe(1.0);
});

test('missing LICENSE + README penalized 0.4', () => {
  const c = legalCritic(tmp());
  expect(c.findings).toHaveLength(2);
  expect(c.score).toBe(0.4);
});
