/** @brief Test composer plant + integrasi aggregate. @since 0.1.0 */
import { test, expect } from 'bun:test';
import { composeCritiques, composeHygiene } from './compose';
import { aggregate } from '../aggregate';

test('compose runs all eight critics', () => {
  const cr = composeCritiques([{ path: 'engine/foo/a.ts', content: 'export const x = 1;\n' }]);
  expect(cr).toHaveLength(8);
  expect(cr.map((c) => c.name).sort()).toEqual(['accessibility', 'architecture', 'doc', 'imports', 'maintainability', 'privacy', 'sloc', 'todo']);
});

test('compose clean files aggregate to score 1 (gate pass)', () => {
  const cr = composeCritiques([{ path: 'a.ts', content: '/** @brief X. */\nexport const x = 1;\n' }]);
  const r = aggregate(cr, 0.7);
  expect(r.score).toBe(1);
  expect(r.passed).toBe(true);
  expect(r.findings).toHaveLength(0);
});

test('compose detects violations across critics', () => {
  const cr = composeCritiques([
    { path: 'big.ts', content: 'x\n'.repeat(210) },
    { path: 'todo.ts', content: '// TODO: x\n// FIXME: y\n// TODO: z\n// FIXME: w\n' },
    { path: 'imp.ts', content: "import { x } from '../../../../d';\nimport { y } from '../../../../e';\n" },
  ]);
  const r = aggregate(cr, 0.7);
  expect(r.score).toBeLessThan(1);
  expect(r.score).toBeGreaterThanOrEqual(0.7);
  expect(r.findings.length).toBeGreaterThan(0);
  expect(r.byCritic.sloc).toBeLessThan(1);
  expect(r.byCritic.todo).toBeLessThan(1);
  expect(r.byCritic.imports).toBeLessThan(1);
  // gate ketat (0.9) menolak artefak bermasalah
  expect(aggregate(cr, 0.9).passed).toBe(false);
});

test('compose severe violations fail even lenient gate', () => {
  const cr = composeCritiques([
    { path: 'god.ts', content: 'x\n'.repeat(400) },
    { path: 'mess.ts', content: '// TODO\n// FIXME\n// XXX\n// TODO\n// FIXME\nconst cfg = { password: "supersecretvalue123" };\n' },
    { path: 'deep.ts', content: "import { a } from '../../../../../a';\nimport { b } from '../../../../../b';\nimport { c } from '../../../../../c';\n" },
  ]);
  const r = aggregate(cr, 0.7);
  expect(r.score).toBeLessThan(0.7);
  expect(r.passed).toBe(false);
});

test('composeHygiene runs three repo-wide critics on real root', () => {
  const cr = composeHygiene(process.cwd());
  expect(cr).toHaveLength(3);
  expect(cr.map((c) => c.name).sort()).toEqual(['devops', 'dx', 'legal']);
  const r = aggregate(cr, 0.7);
  expect(r.passed).toBe(true);
});
