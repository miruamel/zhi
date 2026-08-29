/** @brief Test imports critic. @since 0.1.0 */
import { test, expect } from 'bun:test';
import { importsCritic } from './critic';

test('importsCritic alias path scores 1', () => {
  const c = importsCritic([{ path: 'a.ts', content: "import { x } from 'engine/foo';\n" }]);
  expect(c.score).toBe(1);
});

test('importsCritic shallow relative ≤3 ok', () => {
  const src = "import { a } from './b';\nimport { c } from '../c';\nimport { d } from '../../d';\nimport { e } from '../../../e';\n";
  const c = importsCritic([{ path: 'a.ts', content: src }]);
  expect(c.score).toBe(1);
});

test('importsCritic flags deep relative >3', () => {
  const c = importsCritic([{ path: 'a.ts', content: "import { x } from '../../../../d';\n" }]);
  expect(c.score).toBeLessThan(1);
  expect(c.findings[0]).toContain('deep-relative');
  expect(c.findings[0]).toContain('4>3');
});
