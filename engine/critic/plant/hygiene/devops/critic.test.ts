/** @brief Test DevOps hygiene critic. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { devopsCritic } from './critic';

/** @brief Buat direktori temp. @return {string} path */
function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'devops-'));
}

test('clean repo (CI + .gitignore) scores 1', () => {
  const r = tmp();
  writeFileSync(join(r, '.gitignore'), '#\n');
  mkdirSync(join(r, '.github', 'workflows'), { recursive: true });
  writeFileSync(join(r, '.github', 'workflows', 'ci.yml'), 'name: ci\n');
  const c = devopsCritic(r);
  expect(c.score).toBe(1);
  expect(c.findings).toHaveLength(0);
  expect(c.weight).toBe(1.0);
});

test('missing CI + .gitignore penalized 0.5', () => {
  const c = devopsCritic(tmp());
  expect(c.findings).toHaveLength(2);
  expect(c.score).toBe(0.5);
});

test('scripts/ci counts as CI present', () => {
  const r = tmp();
  writeFileSync(join(r, '.gitignore'), '#\n');
  mkdirSync(join(r, 'scripts', 'ci'), { recursive: true });
  writeFileSync(join(r, 'scripts', 'ci', 'x.ts'), '//\n');
  const c = devopsCritic(r);
  expect(c.score).toBe(1);
});
