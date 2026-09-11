/**
 * @fileoverview OrchPane tests. @since 0.1.11
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render/render';
import { OrchPane, toOrchStep } from './orch';
import type { DagStep } from '../../../core/state';

const steps = [
  { id: 'a', kind: 'generate', title: 'gen', status: 'done' as const, tokens: 100 },
  { id: 'b', kind: 'verify', title: 'verify', status: 'running' as const, tokens: 50 },
  { id: 'c', kind: 'critique', title: 'crit', status: 'pending' as const },
];

describe('OrchPane', () => {
  it('renders step count and status icons', () => {
    const f = renderToString(<OrchPane steps={steps} currentStepId="b" />);
    expect(f).toContain('_ORCH (3');
    expect(f).toContain('gen');
    expect(f).toContain('verify');
    expect(f).toContain('crit');
  });

  it('shows no steps message when empty', () => {
    const f = renderToString(<OrchPane steps={[]} />);
    expect(f).toContain('No steps yet.');
  });

  it('converts DagStep to OrchStep', () => {
    const s: DagStep = {
      id: 'x',
      kind: 'eval',
      status: 'done',
      tokensUsed: 42,
      detail: 'eval step',
    };
    const o = toOrchStep(s);
    expect(o.id).toBe('x');
    expect(o.kind).toBe('eval');
    expect(o.title).toBe('eval step');
    expect(o.tokens).toBe(42);
  });

  it('renders tree topology when parent/children present', () => {
    const treeSteps = [
      {
        id: 'root',
        kind: 'generate',
        title: 'gen',
        status: 'done' as const,
        tokens: 100,
        children: ['a', 'b'],
      },
      {
        id: 'a',
        kind: 'verify',
        title: 'verify',
        status: 'running' as const,
        tokens: 50,
        parent: 'root',
      },
      { id: 'b', kind: 'critique', title: 'crit', status: 'pending' as const, parent: 'root' },
    ];
    const f = renderToString(<OrchPane steps={treeSteps} currentStepId="a" />);
    expect(f).toContain('tree');
    expect(f).toContain('gen');
    expect(f).toContain('verify');
    expect(f).toContain('crit');
  });

  it('toOrchStep preserves topology fields', () => {
    const s: DagStep = {
      id: 'x',
      kind: 'eval',
      status: 'done',
      tokensUsed: 42,
      detail: 'eval step',
      children: ['y'],
      parent: 'z',
    };
    const o = toOrchStep(s);
    expect(o.children).toEqual(['y']);
    expect(o.parent).toBe('z');
  });
});
