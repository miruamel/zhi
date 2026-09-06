/**
 * @fileoverview Metrics — aggregate display widget.
 * @since 0.2.0
 */
import { Text } from 'ink';
import { colors } from '../../core/colors';
import { formatTokens, formatMs } from '../../core/format';

export interface MetricsProps {
  tokensUsed: number;
  tokensBudget: number;
  elapsedMs: number;
  stepsCompleted: number;
  stepsTotal: number;
  successRate: number;
  costEstimate?: number;
}

/** @brief Render a metrics summary panel. @since 0.2.0 */
export function Metrics({ tokensUsed, tokensBudget, elapsedMs, stepsCompleted, stepsTotal, successRate, costEstimate }: MetricsProps) {
  return (
    <Text flexDirection="column">
      <Text>
        <Text color={colors.accent}>Tokens: </Text>
        <Text>{formatTokens(tokensUsed)} / {formatTokens(tokensBudget)}</Text>
      </Text>
      <Text>
        <Text color={colors.accent}>Time: </Text>
        <Text>{formatMs(elapsedMs)}</Text>
      </Text>
      <Text>
        <Text color={colors.accent}>Steps: </Text>
        <Text>{stepsCompleted}/{stepsTotal}</Text>
        <Text dimColor> ({Math.round(successRate * 100)}%)</Text>
      </Text>
      {costEstimate !== undefined && (
        <Text>
          <Text color={colors.accent}>Cost: </Text>
          <Text>${costEstimate.toFixed(4)}</Text>
        </Text>
      )}
    </Text>
  );
}