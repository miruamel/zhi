/** @brief StageRecords pane: per-stage latency + error dashboard. @since 0.1.1 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/style/colors';
import { formatMs } from '../../../core/style/format';
import { glyphs } from '../../../core/style/icons';
import type { AppState } from '../../../core/state';

export interface StagesProps {
  state: AppState;
  maxLines?: number;
}

/** @brief Render the stage metrics pane. @since 0.1.1 */
export function Stages({ state, maxLines = 10 }: StagesProps) {
  const records = state.stageRecords;
  const visible = records.slice(-maxLines);
  const maxMs = Math.max(1, ...records.map((r) => r.ms));
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.accentBlue}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.accentBlue} bold>
        ◈ STAGES ({records.length})
      </Text>
      {visible.length === 0 ? (
        <Text color={colors.fgDim}> (no stages yet)</Text>
      ) : (
        visible.map((r, i) => {
          const bar = Math.round((r.ms / maxMs) * 20);
          const g = r.ok ? glyphs.done : glyphs.failed;
          const c = r.ok ? colors.done : colors.failed;
          return (
            <Box key={i} gap={1}>
              <Text color={c}>
                {g} {r.stage.padEnd(10)}
              </Text>
              <Text color={colors.fgDim}>{'█'.repeat(bar).padEnd(20)}</Text>
              <Text color={colors.fgDim}>{formatMs(r.ms).padStart(8)}</Text>
              {r.error && <Text color={colors.error}> {r.error}</Text>}
            </Box>
          );
        })
      )}
      <Box marginTop={1} gap={1}>
        <Text color={colors.fgDim}>total</Text>
        <Text color={colors.fg}>{formatMs(state.metrics.totalMs)}</Text>
        <Text color={colors.fgDim}> · errors</Text>
        <Text color={colors.error}>{state.metrics.errors}</Text>
        <Text color={colors.fgDim}> · recover</Text>
        <Text color={colors.warn}>{state.metrics.recoverAttempts}</Text>
      </Box>
    </Box>
  );
}
