import { describe, it, expect } from 'bun:test';
import { render } from 'ink';
import type { ReactNode } from 'react';
import { Detail } from './detail';
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

describe('Detail', () => {
  it('shows idle message when no step', () => {
    const out = renderToString(
      Detail({ loop: 'INTAKE', tokensUsed: 0, tokensBudget: 1000, recoverAttempts: 0 }) as any,
    );
    expect(out).toContain('idle');
  });

  it('shows step id and kind when step provided', () => {
    const step: DagStep = { id: 's1', kind: 'generate', status: 'running' };
    const out = renderToString(
      Detail({
        step,
        loop: 'GENERATE',
        tokensUsed: 250,
        tokensBudget: 1000,
        recoverAttempts: 0,
      }) as any,
    );
    expect(out).toContain('s1');
    expect(out).toContain('generate');
  });

  it('shows token budget when present', () => {
    const step: DagStep = { id: 's1', kind: 'generate', status: 'running', tokenBudget: 500 };
    const out = renderToString(
      Detail({
        step,
        loop: 'GENERATE',
        tokensUsed: 250,
        tokensBudget: 1000,
        recoverAttempts: 0,
      }) as any,
    );
    expect(out).toContain('500');
  });

  it('shows recover attempts count', () => {
    const out = renderToString(
      Detail({ loop: 'INTAKE', tokensUsed: 0, tokensBudget: 1000, recoverAttempts: 3 }) as any,
    );
    expect(out).toContain('recover');
    expect(out).toContain('3');
  });

  it('shows token usage ratio', () => {
    const out = renderToString(
      Detail({ loop: 'INTAKE', tokensUsed: 500, tokensBudget: 1000, recoverAttempts: 0 }) as any,
    );
    expect(out).toContain('500');
    expect(out).toContain('1.0k');
  });
});
