/**
 * @fileoverview OrchPane tests. @since 0.2.2
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render';
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
});
