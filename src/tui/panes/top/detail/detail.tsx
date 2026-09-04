/** @brief Step detail pane: current step info, tokens, elapsed, detail string. @since 0.1.2 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { formatTokens, formatPct, truncate } from '../../../core/format';
import type { DagStep } from '../../../core/state';

export interface DetailProps {
  step?: DagStep;
  loop: string;
  tokensUsed: number;
  tokensBudget: number;
  recoverAttempts: number;
  expanded?: boolean;
}

/** @brief Render the step detail pane. @since 0.1.2 */
export function Detail({
  step,
  loop,
  tokensUsed,
  tokensBudget,
  recoverAttempts,
  expanded = false,
}: DetailProps) {
  const pct = tokensBudget > 0 ? tokensUsed / tokensBudget : 0;
  const detailText = step?.detail ?? '';
  const hasDetail = detailText.length > 0;
  const lines = hasDetail ? detailText.split('\n') : [];
  const visible = expanded ? lines : lines.slice(0, 4);
  const hidden = expanded ? 0 : Math.max(0, lines.length - 4);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.warn}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.warn} bold>
        ⏵ STEP DETAIL {expanded ? '▾' : '▸'}
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
          {hasDetail ? (
            <Box flexDirection="column" marginTop={1}>
              <Text color={colors.fgDim} bold>
                output {lines.length} lines
              </Text>
              {visible.map((line, i) => (
                <Text key={i} color={colors.fg}>
                  {truncate(line, 120)}
                </Text>
              ))}
              {hidden > 0 && (
                <Text color={colors.fgDim}>… {hidden} more lines (press d to expand)</Text>
              )}
            </Box>
          ) : (
            <Text color={colors.fgDim}> (no output yet)</Text>
          )}
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
