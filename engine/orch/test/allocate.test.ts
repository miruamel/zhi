/**
 * @brief Unit: allocate() — proportional budget allocator. @since 0.1.0
 */
import { describe, expect, it } from 'bun:test';
import { allocate } from '../schedule';
import { buildDag } from '../dag';
import { parseGoal } from '../parse';

describe('orch allocate', () => {
  it('allocates proportionally to estimate', () => {
    const dag = buildDag(parseGoal('build auth, add tests'));
    const alloc = allocate(dag, 8);
    const sum = [...alloc.values()].reduce((s, v) => s + v, 0);
    expect(sum).toBe(8);
    expect(alloc.get('s1')!).toBeGreaterThan(alloc.get('s0')!);
  });

  it('splits equally when estimates are zero', () => {
    const zero = {
      nodes: [{ id: 'a', label: 'a', deps: [], estimate: 0, priority: 0.5 }],
      edges: [],
      order: ['a'],
    };
    const alloc = allocate(zero, 10);
    expect(alloc.get('a')).toBe(10);
  });

  it('empty dag -> empty map', () => {
    const dag = { nodes: [], edges: [], order: [] };
    expect(allocate(dag, 100).size).toBe(0);
  });
});
