/** @brief Test Testing hygiene critic. @since 0.2.0 */
import { test, expect } from 'bun:test';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { testingCritic } from './critic';

/** @brief Buat direktori temp. @return {string} path */
function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'testing-'));
}

test('all sources have test sibling scores 1', () => {
  const r = tmp();
  mkdirSync(join(r, 'src'), { recursive: true });
  writeFileSync(join(r, 'src', 'a.ts'), 'export const a = 1;\n');
  writeFileSync(join(r, 'src', 'a.test.ts'), 'import { test } from "bun:test";\n');
  const c = testingCritic(r);
  expect(c.score).toBe(1);
  expect(c.findings).toHaveLength(0);
  expect(c.weight).toBe(1.0);
});

test('source without test sibling penalized 0.2', () => {
  const r = tmp();
  mkdirSync(join(r, 'src'), { recursive: true });
  writeFileSync(join(r, 'src', 'b.ts'), 'export const b = 1;\n');
  const c = testingCritic(r);
  expect(c.findings).toHaveLength(1);
  expect(c.score).toBeCloseTo(0.8);
});

test('nested engine sources checked', () => {
  const r = tmp();
  mkdirSync(join(r, 'engine', 'x', 'y'), { recursive: true });
  writeFileSync(join(r, 'engine', 'x', 'y', 'z.ts'), 'export const z = 1;\n');
  const c = testingCritic(r);
  expect(c.findings.some((f) => f.includes('engine/x/y/z.ts'))).toBe(true);
});
test('pure type file not flagged (no runtime export)', () => {
  const r = tmp();
  mkdirSync(join(r, 'src'), { recursive: true });
  writeFileSync(join(r, 'src', 'types.ts'), 'export interface X { a: number; }\nexport type Y = string;\n');
  const c = testingCritic(r);
  expect(c.findings).toHaveLength(0);
});

test('re-export shell not flagged', () => {
  const r = tmp();
  mkdirSync(join(r, 'src'), { recursive: true });
  writeFileSync(join(r, 'src', 'index.ts'), "export { a } from './a';\nexport * from './b';\n");
  const c = testingCritic(r);
  expect(c.findings).toHaveLength(0);
});

test('test.ts source not flagged as missing sibling', () => {
  const r = tmp();
  mkdirSync(join(r, 'src'), { recursive: true });
  writeFileSync(join(r, 'src', 'test.ts'), 'export function runTests() {}\n');
  const c = testingCritic(r);
  expect(c.findings.some((f) => f.includes('test.ts'))).toBe(false);
});

test('file with exported function flagged', () => {
  const r = tmp();
  mkdirSync(join(r, 'src'), { recursive: true });
  writeFileSync(join(r, 'src', 'svc.ts'), 'export function doThing() { return 1; }\n');
  const c = testingCritic(r);
  expect(c.findings.some((f) => f.includes('svc.ts'))).toBe(true);
});
