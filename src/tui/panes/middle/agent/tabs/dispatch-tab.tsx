/**
 * @fileoverview Dispatch tab — task input box + target agent info.
 * @since 0.1.11
 * @updated 0.2.6 — extracted from agent.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import { Box, Text } from 'ink';
import { colors } from '../../../../core/colors';
import { Badge } from '../../../../widgets/badge/badge';
import type { AgentDisplay } from '../agent-types';

/** @brief Render dispatch input + target info. @since 0.1.11 */
export function DispatchTab({
  dispatchInput,
  selectedAgent,
}: {
  dispatchInput: string;
  selectedAgent?: AgentDisplay;
}): React.ReactNode {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color={colors.fgDim}>Dispatch task to selected agent:</Text>
      <Box marginTop={1} borderStyle="single" borderColor={colors.fgDim} paddingX={1}>
        <Text color={colors.forward}>{'> '}</Text>
        <Text color={colors.fg}>{dispatchInput || 'type task...'}</Text>
      </Box>
      {selectedAgent && (
        <Box marginTop={1}>
          <Text color={colors.fgDim}>
            Target: {selectedAgent.name} ({selectedAgent.id}) · capabilities:{' '}
            {selectedAgent.capabilities.join(', ')}
          </Text>
        </Box>
      )}
      <Box marginTop={1} gap={1}>
        <Badge color={colors.complete}>Enter send</Badge>
        <Badge color={colors.warn}>Esc clear</Badge>
      </Box>
    </Box>
  );
}
