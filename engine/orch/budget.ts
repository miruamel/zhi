/**
 * @fileoverview Orchestrator budget tracker. @since 0.2.6
 * @package zhi
 */
/** @brief Budget limits. @since 0.2.6 */
export interface BudgetLimits {
  tokens: number;
  steps: number;
  cost: number;
}

/** @brief Budget alert. @since 0.2.6 */
export interface BudgetAlert {
  type: 'tokens' | 'steps' | 'cost';
  threshold: number;
  current: number;
  message: string;
}

/** @brief Budget tracker. @since 0.2.6 */
export interface BudgetTracker {
  consume(tokens: number, cost?: number): void;
  check(): BudgetAlert[];
  getReport(): {
    tokensUsed: number;
    tokensBudget: number;
    stepsUsed: number;
    stepsBudget: number;
    costUsed: number;
    costBudget: number;
  };
}

/** @brief Create a budget tracker. @since 0.2.6 */
export function createBudgetTracker(limits: BudgetLimits): BudgetTracker {
  let tokensUsed = 0;
  let stepsUsed = 0;
  let costUsed = 0;

  return {
    consume(tokens: number, cost?: number): void {
      tokensUsed += tokens;
      stepsUsed += 1;
      if (cost) costUsed += cost;
    },
    check(): BudgetAlert[] {
      const alerts: BudgetAlert[] = [];
      const pct = (current: number, budget: number) => (budget > 0 ? current / budget : 0);
      if (pct(tokensUsed, limits.tokens) >= 0.8)
        alerts.push({
          type: 'tokens',
          threshold: 0.8,
          current: tokensUsed,
          message: `Token usage at ${Math.round(pct(tokensUsed, limits.tokens) * 100)}%`,
        });
      if (pct(stepsUsed, limits.steps) >= 0.8)
        alerts.push({
          type: 'steps',
          threshold: 0.8,
          current: stepsUsed,
          message: `Step usage at ${Math.round(pct(stepsUsed, limits.steps) * 100)}%`,
        });
      if (pct(costUsed, limits.cost) >= 0.8)
        alerts.push({
          type: 'cost',
          threshold: 0.8,
          current: costUsed,
          message: `Cost usage at ${Math.round(pct(costUsed, limits.cost) * 100)}%`,
        });
      return alerts;
    },
    getReport() {
      return {
        tokensUsed,
        tokensBudget: limits.tokens,
        stepsUsed,
        stepsBudget: limits.steps,
        costUsed,
        costBudget: limits.cost,
      };
    },
  };
}
