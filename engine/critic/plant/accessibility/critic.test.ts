import { test, expect } from 'bun:test';
import { accessibilityCritic } from './critic';

test('clean file scores 1', () => {
  const r = accessibilityCritic([{ path: 'a.ts', content: 'export const x = 1;\n' }]);
  expect(r.score).toBe(1);
  expect(r.findings).toHaveLength(0);
  expect(r.name).toBe('accessibility');
});

test('img without alt is flagged', () => {
  const r = accessibilityCritic([{ path: 'ui.tsx', content: 'const v = <img src="x.png" />;\n' }]);
  expect(r.findings).toEqual(['ui.tsx img-without-alt']);
  expect(r.score).toBe(0.9);
});

test('onClick without keyboard handler is flagged', () => {
  const r = accessibilityCritic([{ path: 'ui.tsx', content: 'const v = <div onClick={f} />;\n' }]);
  expect(r.findings).toEqual(['ui.tsx onClick-without-keyboard-handler']);
  expect(r.score).toBe(0.9);
});

test('test files excluded', () => {
  const r = accessibilityCritic([{ path: 'ui.test.tsx', content: '<img src="x" />\n' }]);
  expect(r.score).toBe(1);
  expect(r.findings).toHaveLength(0);
});

test('score floors at 0', () => {
  const files = Array.from({ length: 10 }, (_, i) => ({ path: `ui${i}.tsx`, content: `<img src="${i}" />\n` }));
  const r = accessibilityCritic(files);
  expect(r.score).toBe(0);
});
