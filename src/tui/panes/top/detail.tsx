/** @brief Step detail pane: current step info, tokens, elapsed, detail string. @since 0.1.0 */
import { Box, Text } from 'ink';
import { colors } from '../../core/colors';
import { formatTokens, formatPct } from '../../core/format';
import type { DagStep } from '../../core/state';

export interface DetailProps {
  step?: DagStep;
  loop: string;
  tokensUsed: number;
  tokensBudget: number;
  recoverAttempts: number;
}

/** @brief Render the step detail pane. @since 0.1.0 */
export function Detail({ step, loop, tokensUsed, tokensBudget, recoverAttempts }: DetailProps) {
  const pct = tokensBudget > 0 ? tokensUsed / tokensBudget : 0;
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.warn}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.warn} bold>
        ⏵ STEP DETAIL
      </Text>
      <Box gap={1}>
        <Text color={colors.fgDim}>state:</Text>
        <Text color={colors.fg}>{loop}</Text>
      </Box>
      {step ? (
        <>
          <Box gap={1}>
            <Text color={colors.fgDim}>id:</Text>
            <Text color={colors.fg}>{step.id}</Text>
            <Text color={colors.fgDim}>kind:</Text>
            <Text color={colors.fg}>{step.kind}</Text>
          </Box>
          <Box gap={1}>
            <Text color={colors.fgDim}>status:</Text>
            <Text color={colors.fg}>{step.status}</Text>
            {step.tokenBudget !== undefined && (
              <Text color={colors.fgDim}> budget {formatTokens(step.tokenBudget)}</Text>
            )}
            {step.tokensUsed !== undefined && (
              <Text color={colors.fgDim}> used {formatTokens(step.tokensUsed)}</Text>
            )}
          </Box>
          {step.detail && <Text color={colors.fgDim}> {step.detail}</Text>}
        </>
      ) : (
        <Text color={colors.fgDim}> (idle — waiting for {loop})</Text>
      )}
      <Box marginTop={1} gap={1}>
        <Text color={colors.fgDim}>tokens:</Text>
        <Text color={colors.fg}>{formatTokens(tokensUsed)}</Text>
        <Text color={colors.fgDim}>
          / {formatTokens(tokensBudget)} ({formatPct(pct)})
        </Text>
      </Box>
      <Box gap={1}>
        <Text color={colors.fgDim}>recover attempts:</Text>
        <Text color={recoverAttempts > 0 ? colors.warn : colors.fg}>{recoverAttempts}</Text>
      </Box>
    </Box>
  );
}
