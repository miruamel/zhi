/**
 * @brief Unit: buildDag() — orch DAG construction. @since 0.1.2
 */
import { describe, expect, it } from 'bun:test';
import { buildDag } from '../dag';
import { parseGoal } from '../parse';

describe('orch buildDag', () => {
  it('single clause -> one step, no deps', () => {
    const dag = buildDag(parseGoal('build auth'));
    expect(dag.nodes).toHaveLength(1);
    expect(dag.nodes[0]!.id).toBe('s0');
    expect(dag.nodes[0]!.deps).toEqual([]);
    expect(dag.order).toEqual(['s0']);
    expect(dag.nodes[0]!.estimate).toBeGreaterThanOrEqual(1);
  });

  it('multi clause -> sequential chain', () => {
    const dag = buildDag(parseGoal('build auth, add tests'));
    expect(dag.nodes.map((n) => n.label)).toEqual(['build auth', 'add tests']);
    expect(dag.nodes[1]!.deps).toEqual(['s0']);
    expect(dag.order).toEqual(['s0', 's1']);
  });

  it('estimate counts non-stopword words', () => {
    const dag = buildDag(parseGoal('deploy the cli'));
    expect(dag.nodes[0]!.estimate).toBe(2); // 'the' is stopword
  });

  it('priority boosts first + last', () => {
    const dag = buildDag(parseGoal('a; b'));
    expect(dag.nodes[0]!.priority).toBeGreaterThan(0.5);
    expect(dag.nodes[1]!.priority).toBeGreaterThan(0.5);
  });
});
