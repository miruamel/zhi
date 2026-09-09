/**
 * @fileoverview Runtime log tab — scrollable event log from agent runtime.
 * @since 0.1.11
 * @updated 0.2.6 — extracted from agent.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import { Box, Text } from 'ink';
import { colors } from '../../../../core/colors';
import type { RuntimeLogEntry } from '../agent-types';
import { formatRelative, levelColor } from '../agent-utils';

/** @brief Render runtime log entries. @since 0.1.11 */
export function RuntimeLogTab({ runtimeLog }: { runtimeLog: RuntimeLogEntry[] }): React.ReactNode {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color={colors.fgDim}>{runtimeLog.length} event(s) in runtime log</Text>
      <Box marginTop={1} flexDirection="column">
        {runtimeLog.slice(-50).map((e) => (
          <Box key={e.id}>
            <Text color={levelColor(e)}>{`[${e.level.toUpperCase().padEnd(5)}]`}</Text>
            <Text color={colors.fgDim}>{formatRelative(e.timestamp)}</Text>
            {e.agentId && <Text color={colors.forward}>{` ${e.agentId}`}</Text>}
            <Text color={colors.fg}> {e.message}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
