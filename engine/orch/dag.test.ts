/** @brief Test topoSort + buildDag. @since 0.2.0 */
import { test, expect } from 'bun:test';
import { topoSort, buildDag } from './dag';
import { parseGoal } from './parse';
import type { Step } from './types';

/** @brief Buat Step minimal. @param {string} id @param {string[]} deps @return {Step} */
function step(id: string, deps: string[] = []): Step {
  return { id, label: id, deps, estimate: 1, priority: 0.5 };
}

test('topoSort linear order', () => {
  const nodes = [step('s0'), step('s1', ['s0']), step('s2', ['s1'])];
  const edges = [
    { from: 's0', to: 's1' },
    { from: 's1', to: 's2' },
  ];
  expect(topoSort(nodes, edges)).toEqual(['s0', 's1', 's2']);
});

test('topoSort detects cycle', () => {
  const nodes = [step('s0'), step('s1', ['s0'])];
  const edges = [
    { from: 's0', to: 's1' },
    { from: 's1', to: 's0' },
  ];
  expect(() => topoSort(nodes, edges)).toThrow();
});

test('topoSort skips edges with unknown nodes', () => {
  const nodes = [step('s0')];
  const edges = [{ from: 's0', to: 'ghost' }];
  expect(topoSort(nodes, edges)).toEqual(['s0']);
});

test('buildDag single clause -> one node, no deps', () => {
  const dag = buildDag(parseGoal('deploy cli'));
  expect(dag.nodes).toHaveLength(1);
  expect(dag.nodes[0].id).toBe('s0');
  expect(dag.nodes[0].deps).toEqual([]);
  expect(dag.order).toEqual(['s0']);
});

test('buildDag multi-clause -> chained deps + topo order', () => {
  const dag = buildDag(parseGoal('parse input; generate code; run tests'));
  expect(dag.nodes).toHaveLength(3);
  expect(dag.nodes[1].deps).toEqual(['s0']);
  expect(dag.nodes[2].deps).toEqual(['s1']);
  expect(dag.order).toEqual(['s0', 's1', 's2']);
  expect(dag.edges).toHaveLength(2);
});

test('buildDag estimate counts non-stopword words', () => {
  const dag = buildDag(parseGoal('deploy the cli'));
  expect(dag.nodes[0].estimate).toBe(2); // 'the' is stopword, 'deploy' is not
});

test('buildDag priority boosts first + last', () => {
  const dag = buildDag(parseGoal('a; b'));
  expect(dag.nodes[0].priority).toBeGreaterThan(0.5);
  expect(dag.nodes[1].priority).toBeGreaterThan(0.5);
});
