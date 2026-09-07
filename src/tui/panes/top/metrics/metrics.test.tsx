/**
 * @fileoverview Metrics pane tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { MetricsPane } from './metrics';
import { renderToString } from '../../../core/test/render';

describe('MetricsPane', () => {
  it('renders metrics data', () => {
    const out = renderToString(
      MetricsPane({
        tokensUsed: 100,
        tokensBudget: 1000,
        elapsedMs: 5000,
        stepsCompleted: 2,
        stepsTotal: 5,
        successRate: 0.8,
      }),
    );
    expect(out).toContain('METRICS');
    expect(out).toContain('Tokens');
  });

  it('renders sparkline when data provided', () => {
    const out = renderToString(
      MetricsPane({
        tokensUsed: 100,
        tokensBudget: 1000,
        elapsedMs: 1000,
        stepsCompleted: 1,
        stepsTotal: 1,
        successRate: 1,
        sparkline: [10, 20, 30, 40],
      }),
    );
    expect(out).toMatch(/[▁▂▃▄▅▆▇█]/);
  });
});
