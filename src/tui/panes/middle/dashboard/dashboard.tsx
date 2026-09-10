/**
 * @fileoverview Dashboard pane — DORA, quality trends, cost, multi-run comparison.
 * @since 0.1.11
 * @updated 0.1.13 — token sparkline + real testCoverage/costTrend wiring (M1)
 * @updated 0.1.13 — multi-run comparison table (M1, #275)
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { Gauge } from '../../../widgets/gauge/gauge';
import { Sparkline } from '../../../widgets/sparkline/sparkline';
import { Table } from '../../../widgets/table/table';
import type { SessionInfo } from '../../../core/state';

/** @brief DORA metrics. @since 0.1.11 */
export interface DoraMetrics {
  deployFrequency: number;
  leadTime: number;
  changeFailureRate: number;
  mttr: number;
}

/** @brief Dashboard pane props. @since 0.1.11 @updated 0.1.13 */
export interface DashboardPaneProps {
  dora: DoraMetrics;
  qualityScore: number;
  testCoverage: number;
  costTrend: number;
  tokensUsed: number;
  tokensBudget: number;
  stepsCompleted: number;
  stepsTotal: number;
  tokenSparkline?: number[];
  sessions?: SessionInfo[];
}

/** @brief Render the dashboard pane. @since 0.1.11 @updated 0.1.13 */
export function DashboardPane({
  dora,
  qualityScore,
  testCoverage,
  costTrend,
  tokensUsed,
  tokensBudget,
  stepsCompleted,
  stepsTotal,
  tokenSparkline,
  sessions,
}: DashboardPaneProps) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.forward} bold>
        _DASHBOARD
      </Text>
      <Box gap={2} marginTop={1}>
        <Box flexDirection="column" width={18}>
          <Text color={colors.complete} bold>
            DORA
          </Text>
          <Gauge
            value={dora.deployFrequency}
            max={10}
            label="deploy/day"
            color={colors.complete}
            width={12}
          />
          <Gauge
            value={100 - dora.changeFailureRate}
            max={100}
            label="reliability"
            color={colors.warn}
            width={12}
          />
          <Gauge value={dora.mttr} max={60} label="MTTR min" color={colors.forward} width={12} />
        </Box>
        <Box flexDirection="column" width={18}>
          <Text color={colors.forward} bold>
            QUALITY
          </Text>
          <Gauge value={qualityScore} max={100} label="score" color={colors.complete} width={12} />
          <Gauge value={testCoverage} max={100} label="coverage" color={colors.warn} width={12} />
          <Gauge
            value={stepsCompleted}
            max={stepsTotal}
            label="progress"
            color={colors.forward}
            width={12}
          />
        </Box>
        <Box flexDirection="column" width={18}>
          <Text color={colors.warn} bold>
            COST
          </Text>
          <Gauge
            value={tokensUsed}
            max={tokensBudget}
            label="tokens"
            color={colors.error}
            width={12}
          />
          <Text color={costTrend >= 0 ? colors.error : colors.complete}>
            trend: {costTrend >= 0 ? '+' : ''}
            {costTrend}%
          </Text>
          {tokenSparkline && tokenSparkline.length > 0 && (
            <Sparkline data={tokenSparkline} color={colors.error} width={12} />
          )}
        </Box>
      </Box>
      {sessions && sessions.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text color={colors.forward} bold>
            RUNS ({sessions.length})
          </Text>
          <Table
            headers={['run', 'steps', 'tokens', 'status']}
            rows={sessions.map((s) => ({
              run: s.label,
              steps: s.steps,
              tokens: s.tokensUsed,
              status: s.finished ? 'done' : 'active',
            }))}
            maxRows={5}
            highlight={(row) => row.status === 'active'}
          />
        </Box>
      )}
    </Box>
  );
}
