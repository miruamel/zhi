/** @brief Test allocate + schedule. @since 0.2.0 */
import { test, expect } from 'bun:test';
import { allocate, schedule } from './schedule';
import { buildDag } from './dag';
import { parseGoal } from './parse';
import type { Dag } from './types';

test('allocate proportional to estimate', () => {
  const dag = buildDag(parseGoal('a; bb cc')); // s0 est 1, s1 est 2 -> sum 3
  const alloc = allocate(dag, 90);
  expect(alloc.get('s0')).toBe(30);
  expect(alloc.get('s1')).toBe(60);
});

test('allocate zero-estimate splits evenly', () => {
  const dag: Dag = {
    nodes: [
      { id: 's0', label: 'x', deps: [], estimate: 0, priority: 0.5 },
      { id: 's1', label: 'y', deps: [], estimate: 0, priority: 0.5 },
    ],
    edges: [],
    order: ['s0', 's1'],
  };
  const alloc = allocate(dag, 100);
  expect(alloc.get('s0')).toBe(50);
  expect(alloc.get('s1')).toBe(50);
});

test('allocate empty dag -> empty map', () => {
  const dag: Dag = { nodes: [], edges: [], order: [] };
  expect(allocate(dag, 100).size).toBe(0);
});

test('schedule orders by depth ascending', () => {
  const dag = buildDag(parseGoal('a; b; c')); // s0->s1->s2
  const alloc = allocate(dag, 90);
  expect(schedule(dag, alloc).map((s) => s.id)).toEqual(['s0', 's1', 's2']);
});

test('schedule breaks depth tie by token weight (higher first)', () => {
  const dag: Dag = {
    nodes: [
      { id: 's0', label: 'x', deps: [], estimate: 1, priority: 0.5 },
      { id: 's1', label: 'y', deps: [], estimate: 1, priority: 0.5 },
    ],
    edges: [],
    order: ['s0', 's1'],
  };
  const alloc = new Map([
    ['s0', 10],
    ['s1', 90],
  ]);
  expect(schedule(dag, alloc).map((s) => s.id)).toEqual(['s1', 's0']);
});
