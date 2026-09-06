/**
 * @fileoverview Metrics pane — token usage, time, cost, success rate.
 * @since 0.2.0
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { Metrics, Sparkline, Gauge } from '../../../widgets';

export interface MetricsPaneProps {
  tokensUsed: number;
  tokensBudget: number;
  elapsedMs: number;
  stepsCompleted: number;
  stepsTotal: number;
  successRate: number;
  costEstimate?: number;
  sparkline?: number[];
}

/** @brief Render the metrics pane. @since 0.2.0 */
export function MetricsPane({ tokensUsed, tokensBudget, elapsedMs, stepsCompleted, stepsTotal, successRate, costEstimate, sparkline }: MetricsPaneProps) {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={colors.accentBlue} paddingX={1} flexGrow={1}>
      <Text color={colors.accentBlue} bold>_METRICS</Text>
      <Metrics
        tokensUsed={tokensUsed}
        tokensBudget={tokensBudget}
        elapsedMs={elapsedMs}
        stepsCompleted={stepsCompleted}
        stepsTotal={stepsTotal}
        successRate={successRate}
        costEstimate={costEstimate}
      />
      {sparkline && sparkline.length > 0 && (
        <Box marginTop={1}>
          <Sparkline data={sparkline} showLabels />
        </Box>
      )}
      <Box marginTop={1}>
        <Gauge value={successRate * 100} max={100} label="Quality" width={10} />
      </Box>
    </Box>
  );
}