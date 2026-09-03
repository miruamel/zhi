/** @brief Metrics pane: aggregate stats + stage progress bars. @since 0.1.1 */
import { Box, Text } from 'ink';
import { colors } from '../../core/style/colors';
import { glyphs } from '../../core/style/icons';
import { formatMs, formatTokens } from '../../core/style/format';
import { StatCard, ProgressBar } from '../../widgets';
import type { AppState, StageRecord } from '../../core/state';

export interface MetricsProps {
  state: AppState;
}

/** @brief Render the metrics dashboard pane. @since 0.1.1 */
export function Metrics({ state }: MetricsProps) {
  const m = state.metrics;
  const stages = state.stageRecords;
  const maxMs = Math.max(1, ...stages.map((r: StageRecord) => r.ms));
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.accent}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.accent} bold>
        {glyphs.info} METRICS
      </Text>
      <Box gap={1} marginTop={1}>
        <StatCard label="stages" value={String(stages.length)} color={colors.fg} />
        <StatCard
          label="errors"
          value={String(m.errors)}
          color={m.errors > 0 ? colors.error : colors.done}
        />
        <StatCard
          label="recover"
          value={String(m.recoverAttempts)}
          color={m.recoverAttempts > 0 ? colors.warn : colors.fg}
        />
      </Box>
      <Box gap={1}>
        <StatCard label="elapsed" value={formatMs(m.totalMs)} color={colors.fg} />
        <StatCard label="tokens" value={formatTokens(state.tokensUsed)} color={colors.warn} />
      </Box>
      {stages.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text color={colors.fgDim}>stage breakdown</Text>
          {stages.slice(-5).map((r: StageRecord, i: number) => (
            <ProgressBar
              key={i}
              label={r.stage}
              value={r.ms}
              max={maxMs}
              color={r.ok ? colors.done : colors.error}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
