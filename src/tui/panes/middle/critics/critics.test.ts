import { describe, it, expect } from 'bun:test';
import { renderToString } from "../../../core/test/render";
import { Critics } from './critics';
import type { CriticLine } from '../../../core/state';

describe('Critics', () => {
  it('handles empty critics', () => {
    const out = renderToString(Critics({ critics: [], weightedAvg: 0, threshold: 0.8 }) as any);
    expect(out).toContain('CRITICS');
  });

  it('shows critic names', () => {
    const critics: CriticLine[] = [
      { name: 'security', score: 0.9 },
      { name: 'perf', score: 0.5 },
    ];
    const out = renderToString(Critics({ critics, weightedAvg: 0.7, threshold: 0.8 }) as any);
    expect(out).toContain('security');
    expect(out).toContain('perf');
  });

  it('shows weighted average', () => {
    const critics: CriticLine[] = [{ name: 'security', score: 0.9 }];
    const out = renderToString(Critics({ critics, weightedAvg: 0.9, threshold: 0.8 }) as any);
    expect(out).toContain('0.90');
  });

  it('shows threshold', () => {
    const critics: CriticLine[] = [{ name: 'security', score: 0.9 }];
    const out = renderToString(Critics({ critics, weightedAvg: 0.9, threshold: 0.8 }) as any);
    expect(out).toContain('0.80');
  });

  it('handles abstain critics', () => {
    const critics: CriticLine[] = [
      { name: 'security', score: 0.9 },
      { name: 'perf', score: 0, abstain: true, reason: 'not applicable' },
    ];
    const out = renderToString(Critics({ critics, weightedAvg: 0.45, threshold: 0.8 }) as any);
    expect(out).toContain('perf');
  });
});
