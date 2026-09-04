/** @brief Test maintainability critic. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { maintainabilityCritic, codeLines } from './critic';

test('codeLines drops blank/comment/short/import', () => {
  const src = [
    '',
    '// comment',
    '/* block */',
    "import { x } from './y';",
    'const a = 1;',
    'x',
  ].join('\n');
  expect(codeLines(src)).toEqual(['const a = 1;']);
});

test('scores 1 with no duplicates', () => {
  const c = maintainabilityCritic([
    { path: 'a.ts', content: 'const alpha = 1;\nconst beta = 2;\n' },
  ]);
  expect(c.score).toBe(1);
  expect(c.findings).toHaveLength(0);
});

test('penalizes duplicated lines across files', () => {
  const dup = 'const shared = compute();\n';
  const c = maintainabilityCritic([
    { path: 'a.ts', content: 'const a = 1;\n' + dup + dup },
    { path: 'b.ts', content: 'const b = 2;\n' + dup },
  ]);
  expect(c.score).toBeLessThan(1);
  expect(c.findings.length).toBeGreaterThan(0);
  expect(c.findings[0]).toContain('dup');
  expect(c.findings[0]).toContain('3x');
});
