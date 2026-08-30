import { describe, it, expect } from 'bun:test';
import { parseGoal, STOPWORDS } from './parse';
import { buildDag, topoSort } from './dag';
import { allocate, schedule } from './schedule';
import { CycleError, type Step } from './types';

describe('orch parseGoal', () => {
  it('throws on empty goal', () => {
    expect(() => parseGoal('   ')).toThrow('orch: goal kosong');
  });

  it('drops stopwords from tokens', () => {
    const intent = parseGoal('build auth module');
    expect(intent.tokens).toContain('auth');
    expect(intent.tokens).not.toContain('build');
  });

  it('extracts language and budget constraints', () => {
    const intent = parseGoal('build auth in typescript budget=500');
    expect(intent.constraints).toEqual([
      { kind: 'language', value: 'typescript' },
      { kind: 'budget', value: '500' },
    ]);
  });
});

describe('orch buildDag', () => {
  it('single clause -> one step, no deps', () => {
    const dag = buildDag(parseGoal('build auth'));
    expect(dag.nodes).toHaveLength(1);
    expect(dag.nodes[0].id).toBe('s0');
    expect(dag.nodes[0].deps).toEqual([]);
    expect(dag.order).toEqual(['s0']);
    expect(dag.nodes[0].estimate).toBeGreaterThanOrEqual(1);
  });

  it('multi clause -> sequential chain', () => {
    const dag = buildDag(parseGoal('build auth, add tests'));
    expect(dag.nodes.map((n) => n.label)).toEqual(['build auth', 'add tests']);
    expect(dag.nodes[1].deps).toEqual(['s0']);
    expect(dag.order).toEqual(['s0', 's1']);
  });
});

describe('orch topoSort', () => {
  const mk = (id: string, deps: string[]): Step => ({ id, label: id, deps, estimate: 1, priority: 0.5 });

  it('orders acyclic graph', () => {
    const nodes = [mk('a', []), mk('b', ['a'])];
    expect(topoSort(nodes, [{ from: 'a', to: 'b' }])).toEqual(['a', 'b']);
  });

  it('throws CycleError on cycle', () => {
    const nodes = [mk('a', ['b']), mk('b', ['a'])];
    const edges = [{ from: 'b', to: 'a' }, { from: 'a', to: 'b' }];
    expect(() => topoSort(nodes, edges)).toThrow(CycleError);
  });
});

describe('orch allocate', () => {
  const dag = buildDag(parseGoal('build auth, add tests'));

  it('allocates proportionally to estimate', () => {
    const alloc = allocate(dag, 8);
    const sum = [...alloc.values()].reduce((s, v) => s + v, 0);
    expect(sum).toBe(8);
    expect(alloc.get('s1')!).toBeGreaterThan(alloc.get('s0')!);
  });

  it('splits equally when estimates are zero', () => {
    const zero = { nodes: [{ id: 'a', label: 'a', deps: [], estimate: 0, priority: 0.5 }], edges: [], order: ['a'] };
    const alloc = allocate(zero, 10);
    expect(alloc.get('a')).toBe(10);
  });
});

describe('orch schedule', () => {
  it('returns all steps in execution order', () => {
    const dag = buildDag(parseGoal('build auth, add tests, write docs'));
    const alloc = allocate(dag, 100);
    const steps = schedule(dag, alloc);
    expect(steps.map((s) => s.id)).toEqual(dag.order);
    expect(steps).toHaveLength(dag.nodes.length);
  });
});

describe('orch topoSort (extra)', () => {
  const mk = (id: string, deps: string[]): Step => ({ id, label: id, deps, estimate: 1, priority: 0.5 });
  it('skips edges with unknown nodes', () => {
    const nodes = [mk('s0', [])];
    const edges = [{ from: 's0', to: 'ghost' }];
    expect(topoSort(nodes, edges)).toEqual(['s0']);
  });
});

describe('orch buildDag (extra)', () => {
  it('estimate counts non-stopword words', () => {
    const dag = buildDag(parseGoal('deploy the cli'));
    expect(dag.nodes[0].estimate).toBe(2); // 'the' is stopword
  });
  it('priority boosts first + last', () => {
    const dag = buildDag(parseGoal('a; b'));
    expect(dag.nodes[0].priority).toBeGreaterThan(0.5);
    expect(dag.nodes[1].priority).toBeGreaterThan(0.5);
  });
});

describe('orch STOPWORDS', () => {
  it('has common articles', () => {
    expect(STOPWORDS.has('the')).toBe(true);
    expect(STOPWORDS.has('dan')).toBe(true);
  });
});

describe('orch allocate (extra)', () => {
  it('empty dag -> empty map', () => {
    const dag = { nodes: [], edges: [], order: [] };
    expect(allocate(dag, 100).size).toBe(0);
  });
});

describe('orch schedule (extra)', () => {
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
