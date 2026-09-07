/**
 * @fileoverview BudgetPane tests. @since 0.2.2
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render';
import { BudgetPane } from './budget';

describe('BudgetPane', () => {
  it('renders token and cost labels', () => {
    const f = renderToString(
      <BudgetPane
        tokensUsed={500}
        tokensBudget={1000}
        costEstimate={1.5}
        costBudget={10}
        stepsCompleted={2}
        stepsTotal={5}
        elapsedMs={60_000}
      />,
    );
    expect(f).toContain('_BUDGET');
    expect(f).toContain('Tokens');
    expect(f).toContain('Cost');
  });

  it('shows budget exceeded alert when over budget', () => {
    const f = renderToString(
      <BudgetPane
        tokensUsed={1100}
        tokensBudget={1000}
        costEstimate={12}
        costBudget={10}
        stepsCompleted={1}
        stepsTotal={1}
        elapsedMs={1000}
        onBudgetAlert={() => {}}
      />,
    );
    expect(f).toContain('budget exceeded');
  });

  it('renders without alert when under budget', () => {
    const f = renderToString(
      <BudgetPane
        tokensUsed={100}
        tokensBudget={1000}
        costEstimate={1}
        costBudget={10}
        stepsCompleted={0}
        stepsTotal={1}
        elapsedMs={1000}
      />,
    );
    expect(f).not.toContain('budget exceeded');
  });
});
