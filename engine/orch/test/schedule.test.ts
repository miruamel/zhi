/**
 * @brief Unit: schedule() — execution order from DAG + allocation. @since 0.1.0
 */
import { describe, expect, it } from 'bun:test';
import { allocate, schedule } from '../schedule';
import { buildDag } from '../dag';
import { parseGoal } from '../parse';

describe('orch schedule', () => {
  it('returns all steps in execution order', () => {
    const dag = buildDag(parseGoal('build auth, add tests, write docs'));
    const alloc = allocate(dag, 100);
    const steps = schedule(dag, alloc);
    expect(steps.map((s) => s.id)).toEqual(dag.order);
    expect(steps).toHaveLength(dag.nodes.length);
  });

  it('breaks depth tie by token weight (higher first)', () => {
    const dag = {
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
});
