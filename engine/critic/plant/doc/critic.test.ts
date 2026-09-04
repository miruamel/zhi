/** @brief Test doc critic (Doxygen @brief enforcement). @since 0.1.1 */
import { test, expect } from 'bun:test';
import { docCritic } from './critic';

test('file with export + @brief scores 1', () => {
  const c = docCritic([{ path: 'a.ts', content: '/** @brief X. */\nexport const x = 1;\n' }]);
  expect(c.score).toBe(1);
  expect(c.findings).toHaveLength(0);
  expect(c.weight).toBe(1.0);
});

test('file with export, no @brief -> finding', () => {
  const c = docCritic([{ path: 'b.ts', content: 'export const y = 2;\n' }]);
  expect(c.findings.some((f) => f.includes('missing-@brief'))).toBe(true);
  expect(c.score).toBeLessThan(1);
});

test('file without export is ignored', () => {
  const c = docCritic([{ path: 'c.ts', content: 'const z = 3;\n' }]);
  expect(c.findings).toHaveLength(0);
});

test('test files excluded from check', () => {
  const c = docCritic([{ path: 'd.test.ts', content: 'export const w = 4;\n' }]);
  expect(c.findings).toHaveLength(0);
});

test('penalty 0.2 per file, floor 0', () => {
  const c = docCritic([
    { path: 'e.ts', content: 'export const a = 1;\n' },
    { path: 'f.ts', content: 'export const b = 2;\n' },
    { path: 'g.ts', content: 'export const c = 3;\n' },
    { path: 'h.ts', content: 'export const d = 4;\n' },
    { path: 'i.ts', content: 'export const e = 5;\n' },
    { path: 'j.ts', content: 'export const f = 6;\n' },
  ]);
  expect(c.findings).toHaveLength(6);
  expect(c.score).toBe(0);
});
