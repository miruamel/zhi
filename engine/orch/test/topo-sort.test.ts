/**
 * @brief Unit: topoSort() — topological order + cycle detection. @since 0.1.2
 */
import { describe, expect, it } from 'bun:test';
import { topoSort } from '../dag';
import { CycleError, type Step } from '../types';

const mk = (id: string, deps: string[]): Step => ({
  id,
  label: id,
  deps,
  estimate: 1,
  priority: 0.5,
});

describe('orch topoSort', () => {
  it('orders acyclic graph', () => {
    const nodes = [mk('a', []), mk('b', ['a'])];
    expect(topoSort(nodes, [{ from: 'a', to: 'b' }])).toEqual(['a', 'b']);
  });

  it('throws CycleError on cycle', () => {
    const nodes = [mk('a', ['b']), mk('b', ['a'])];
    const edges = [
      { from: 'b', to: 'a' },
      { from: 'a', to: 'b' },
    ];
    expect(() => topoSort(nodes, edges)).toThrow(CycleError);
  });

  it('skips edges with unknown nodes', () => {
    const nodes = [mk('s0', [])];
    const edges = [{ from: 's0', to: 'ghost' }];
    expect(topoSort(nodes, edges)).toEqual(['s0']);
  });
});
