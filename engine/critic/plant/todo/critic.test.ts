/** @brief Test todo critic. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { todoCritic } from './critic';

test('todoCritic clean file scores 1', () => {
  const c = todoCritic([{ path: 'a.ts', content: 'export const x = 1;\n' }]);
  expect(c.score).toBe(1);
  expect(c.findings).toHaveLength(0);
});

test('todoCritic flags TODO and FIXME, reduces score', () => {
  const c = todoCritic([{ path: 'a.ts', content: '// TODO: x\n// FIXME: y\n' }]);
  expect(c.score).toBe(0.8);
  expect(c.findings).toHaveLength(2);
  expect(c.findings[0]).toContain('TODO');
  expect(c.findings[1]).toContain('FIXME');
});
