import { describe, it, expect } from 'bun:test';
import { render } from 'ink';
import type { ReactNode } from 'react';
import { Dag } from './dag';
import type { DagStep } from '../../../core/state';

/** @brief Render ink element to string by overriding stdout. */
function renderToString(el: ReactNode): string {
  const chunks: string[] = [];
  const stdout = {
    write: (chunk: string) => {
      chunks.push(chunk);
      return true;
    },
  };
  const inst = render(el as any, { stdout: stdout as any });
  inst.unmount();
  return chunks.join('');
}

describe('Dag', () => {
  it('shows no-plan message when empty', () => {
    const out = renderToString(Dag({ steps: [], currentLoop: 'INTAKE' }) as any);
    expect(out).toContain('no plan yet');
  });

  it('shows step count when steps exist', () => {
    const steps: DagStep[] = [{ id: '1', kind: 'generate', status: 'done' }];
    const out = renderToString(Dag({ steps, currentLoop: 'INTAKE' }) as any);
    expect(out).toContain('1 steps');
  });

  it('shows step IDs', () => {
    const steps: DagStep[] = [
      { id: 'alpha', kind: 'generate', status: 'done' },
      { id: 'beta', kind: 'verify', status: 'running' },
    ];
    const out = renderToString(Dag({ steps, currentLoop: 'INTAKE' }) as any);
    expect(out).toContain('alpha');
    expect(out).toContain('beta');
  });

  it('shows step kinds', () => {
    const steps: DagStep[] = [
      { id: '1', kind: 'generate', status: 'done' },
      { id: '2', kind: 'critique', status: 'done' },
    ];
    const out = renderToString(Dag({ steps, currentLoop: 'INTAKE' }) as any);
    expect(out).toContain('generate');
    expect(out).toContain('critique');
  });

  it('shows token usage for steps', () => {
    const steps: DagStep[] = [{ id: '1', kind: 'generate', status: 'done', tokensUsed: 1500 }];
    const out = renderToString(Dag({ steps, currentLoop: 'INTAKE' }) as any);
    expect(out).toContain('1500');
    expect(out).toContain('tok');
  });

  it('handles all step statuses', () => {
    const steps: DagStep[] = [
      { id: '1', kind: 'generate', status: 'pending' },
      { id: '2', kind: 'verify', status: 'running' },
      { id: '3', kind: 'critique', status: 'done' },
      { id: '4', kind: 'eval', status: 'failed' },
      { id: '5', kind: 'commit', status: 'skipped' },
    ];
    const out = renderToString(Dag({ steps, currentLoop: 'CRITIQUE' }) as any);
    expect(out).toContain('5 steps');
  });

  it('shows current step id', () => {
    const steps: DagStep[] = [
      { id: 'first', kind: 'generate', status: 'done' },
      { id: 'second', kind: 'verify', status: 'running' },
    ];
    const out = renderToString(
      Dag({ steps, currentLoop: 'VERIFY', currentStepId: 'second' }) as any,
    );
    expect(out).toContain('second');
  });
});
