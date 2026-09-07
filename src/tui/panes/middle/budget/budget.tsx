/**
 * @fileoverview Budget pane — token/cost tracking, budget burn.
 * @since 0.2.2
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { Gauge } from '../../../widgets';

/** @brief Budget pane props. @since 0.2.2 */
export interface BudgetPaneProps {
  tokensUsed: number;
  tokensBudget: number;
  costEstimate: number;
  costBudget: number;
  stepsCompleted: number;
  stepsTotal: number;
  elapsedMs: number;
  ratePerMinute?: number;
  onBudgetAlert?: () => void;
}

const fmtCost = (n: number) => `$${n.toFixed(2)}`;
const fmtTokens = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : `${(n / 1_000).toFixed(1)}k`;

/** @brief Render the budget pane. @since 0.2.2 */
export function BudgetPane({
  tokensUsed,
  tokensBudget,
  costEstimate,
  costBudget,
  stepsCompleted,
  stepsTotal,
  elapsedMs,
  ratePerMinute,
  onBudgetAlert,
}: BudgetPaneProps) {
  const tokenPct = tokensBudget > 0 ? tokensUsed / tokensBudget : 0;
  const costPct = costBudget > 0 ? costEstimate / costBudget : 0;
  const isOver = tokenPct > 1 || costPct > 1;
  const elapsedMin = elapsedMs / 60_000;
  const rate = ratePerMinute ?? (elapsedMin > 0 ? tokensUsed / elapsedMin : 0);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={isOver ? colors.error : colors.complete}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={isOver ? colors.error : colors.complete} bold>
        _BUDGET
      </Text>
      <Box gap={2} marginTop={1}>
        <Gauge value={tokenPct * 100} max={100} label="Tokens" width={10} />
        <Gauge value={costPct * 100} max={100} label="Cost" width={10} />
      </Box>
      <Box gap={2} marginTop={1}>
        <Text color={colors.fgDim}>
          {fmtTokens(tokensUsed)} / {fmtTokens(tokensBudget)}
        </Text>
        <Text color={colors.fgDim}>
          {fmtCost(costEstimate)} / {fmtCost(costBudget)}
        </Text>
      </Box>
      <Box gap={2} marginTop={1}>
        <Text color={colors.fgDim}>
          {stepsCompleted}/{stepsTotal} steps · {elapsedMin.toFixed(1)}m
        </Text>
        <Text color={colors.fgDim}>{fmtTokens(rate)}/min</Text>
      </Box>
      {isOver && onBudgetAlert && (
        <Box marginTop={1}>
          <Text color={colors.error}>⚠ budget exceeded — [a] alert</Text>
        </Box>
      )}
    </Box>
  );
}
