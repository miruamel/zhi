/**
 * @fileoverview Metrics tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { Metrics } from './metrics';
import { renderToString } from '../../core/test/render';

describe('Metrics', () => {
  it('renders token counts', () => {
    const out = renderToString(
      Metrics({
        tokensUsed: 500,
        tokensBudget: 1000,
        elapsedMs: 5000,
        stepsCompleted: 3,
        stepsTotal: 5,
        successRate: 0.6,
      }),
    );
    expect(out).toContain('Tokens');
    expect(out).toContain('Steps');
  });

  it('renders cost when provided', () => {
    const out = renderToString(
      Metrics({
        tokensUsed: 100,
        tokensBudget: 1000,
        elapsedMs: 1000,
        stepsCompleted: 1,
        stepsTotal: 1,
        successRate: 1,
        costEstimate: 0.05,
      }),
    );
    expect(out).toContain('Cost');
  });
});
