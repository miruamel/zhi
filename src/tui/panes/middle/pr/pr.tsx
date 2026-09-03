/** @brief PR / CI pane: PR link + CI status with elapsed. @since 0.1.0 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/style/colors';
import { formatMs } from '../../../core/style/format';
import type { PrCiState } from '../../../core/state';

function ciColor(status: PrCiState['ciStatus']): string {
  switch (status) {
    case 'green':
      return colors.done;
    case 'red':
      return colors.failed;
    case 'pending':
      return colors.running;
    case 'unknown':
    default:
      return colors.fgDim;
  }
}

function ciLabel(status: PrCiState['ciStatus']): string {
  switch (status) {
    case 'green':
      return '✓ CI green';
    case 'red':
      return '✗ CI red';
    case 'pending':
      return '◌ CI running…';
    case 'unknown':
    default:
      return '○ CI —';
  }
}

export interface PrProps {
  prCi: PrCiState;
  expanded?: boolean;
}

/** @brief Render the PR/CI pane. @since 0.1.0 */
export function Pr({ prCi, expanded = false }: PrProps) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.commit}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.commit} bold>
        ⇡ PR / CI
      </Text>
      {prCi.prUrl ? (
        <Box gap={1}>
          <Text color={colors.fgDim}>PR</Text>
          <Text color={colors.fg}>#{prCi.prNumber ?? '?'}</Text>
          <Text color={colors.fgDim}>{prCi.prUrl}</Text>
        </Box>
      ) : (
        <Text color={colors.fgDim}>PR — (not opened yet)</Text>
      )}
      <Box gap={1}>
        <Text color={ciColor(prCi.ciStatus)}>{ciLabel(prCi.ciStatus)}</Text>
        {prCi.ciDurationMs !== undefined && (
          <Text color={colors.fgDim}> {formatMs(prCi.ciDurationMs)}</Text>
        )}
      </Box>
      {expanded && (
        <Box flexDirection="column" marginTop={1}>
          <Text color={colors.fgDim}>ci status</Text>
          <Text color={ciColor(prCi.ciStatus)}>
            {prCi.ciStatus === 'green'
              ? '✓ all checks passed'
              : prCi.ciStatus === 'red'
                ? '✗ checks failing'
                : prCi.ciStatus === 'pending'
                  ? '◌ checks running…'
                  : '○ no CI data'}
          </Text>
          {prCi.ciDurationMs !== undefined && (
            <Text color={colors.fgDim}>elapsed {formatMs(prCi.ciDurationMs)}</Text>
          )}
        </Box>
      )}
    </Box>
  );
}
