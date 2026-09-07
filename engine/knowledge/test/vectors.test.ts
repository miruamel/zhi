import { test, expect } from 'bun:test';
import { VectorStore } from '../vectors';

test('add + search returns nearest by cosine descending', () => {
  const s = new VectorStore();
  s.add({ id: 'a', vector: [1, 0, 0] });
  s.add({ id: 'b', vector: [0, 1, 0] });
  s.add({ id: 'c', vector: [1, 1, 0] });
  const r = s.search([1, 0, 0], 3);
  expect(r[0].id).toBe('a');
  expect(r[0].score).toBeCloseTo(1);
  expect(r.map((x) => x.id)).toEqual(['a', 'c', 'b']);
});

test('k clamps to store size', () => {
  const s = new VectorStore();
  s.add({ id: 'a', vector: [1, 0] });
  s.add({ id: 'b', vector: [0, 1] });
  expect(s.search([1, 0], 10)).toHaveLength(2);
  expect(s.search([1, 0], 0)).toHaveLength(0);
});

test('zero vector yields score 0 (no NaN)', () => {
  const s = new VectorStore();
  s.add({ id: 'a', vector: [0, 0, 0] });
  const r = s.search([1, 2, 3], 1);
  expect(r[0].score).toBe(0);
  expect(Number.isNaN(r[0].score)).toBe(false);
});

test('add rejects inconsistent dimension', () => {
  const s = new VectorStore();
  s.add({ id: 'a', vector: [1, 0] });
  expect(() => s.add({ id: 'b', vector: [1, 0, 0] })).toThrow(/dim/);
});

test('search rejects query dimension mismatch', () => {
  const s = new VectorStore();
  s.add({ id: 'a', vector: [1, 0] });
  expect(() => s.search([1, 0, 0], 1)).toThrow(/dim/);
});

test('duplicate id overwrites entry', () => {
  const s = new VectorStore();
  s.add({ id: 'a', vector: [1, 0], meta: { v: 1 } });
  s.add({ id: 'a', vector: [0, 1], meta: { v: 2 } });
  expect(s.size()).toBe(1);
  const r = s.search([0, 1], 1);
  expect(r[0].id).toBe('a');
  expect(r[0].meta).toEqual({ v: 2 });
});

test('empty store search returns []', () => {
  expect(new VectorStore().search([1, 0], 5)).toEqual([]);
});
