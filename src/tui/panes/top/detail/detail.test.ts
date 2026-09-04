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

  it('shows no output message when step has no detail', () => {
    const step: DagStep = { id: 's1', kind: 'generate', status: 'running' };
    const out = renderToString(
      Detail({
        step,
        loop: 'GENERATE',
        tokensUsed: 0,
        tokensBudget: 1000,
        recoverAttempts: 0,
      }) as any,
    );
    expect(out).toContain('no output yet');
  });

  it('shows first 4 detail lines when collapsed', () => {
    const detail = Array.from({ length: 10 }, (_, i) => `line ${i}`).join('\n');
    const step: DagStep = { id: 's1', kind: 'generate', status: 'running', detail };
    const out = renderToString(
      Detail({
        step,
        loop: 'GENERATE',
        tokensUsed: 0,
        tokensBudget: 1000,
        recoverAttempts: 0,
        expanded: false,
      }) as any,
    );
    expect(out).toContain('line 0');
    expect(out).toContain('line 3');
    expect(out).not.toContain('line 9');
    expect(out).toContain('6 more lines');
  });

  it('shows all detail lines when expanded', () => {
    const detail = Array.from({ length: 10 }, (_, i) => `line ${i}`).join('\n');
    const step: DagStep = { id: 's1', kind: 'generate', status: 'running', detail };
    const out = renderToString(
      Detail({
        step,
        loop: 'GENERATE',
        tokensUsed: 0,
        tokensBudget: 1000,
        recoverAttempts: 0,
        expanded: true,
      }) as any,
    );
    expect(out).toContain('line 0');
    expect(out).toContain('line 9');
    expect(out).not.toContain('more lines');
  });

  it('truncates long lines to 120 chars', () => {
    const detail = 'x'.repeat(200);
    const step: DagStep = { id: 's1', kind: 'generate', status: 'running', detail };
    const out = renderToString(
      Detail({
        step,
        loop: 'GENERATE',
        tokensUsed: 0,
        tokensBudget: 1000,
        recoverAttempts: 0,
        expanded: true,
      }) as any,
    );
    expect(out).toContain('…');
  });
});
