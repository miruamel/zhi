/**
 * @fileoverview Status bar widget — global metrics row at bottom of TUI.
 * @description Shows token usage, elapsed time, git status, network, and key hints.
 * @package zhi
 */
import { Box, Text } from 'ink';
import { colors } from '../../core/colors';
import { formatMs, formatTokens, bar } from '../../core/format';

export interface StatusBarProps {
  tokensUsed: number;
  tokensBudget: number;
  elapsedMs: number;
  step?: string;
  stepCount?: number;
  stepTotal?: number;
  gitBranch?: string;
  gitAhead?: number;
  gitBehind?: number;
  networkOnline?: boolean;
  memoryMb?: number;
  cpuPercent?: number;
  focusLabel?: string;
  mode?: 'normal' | 'insert' | 'command' | 'search';
  hints?: string[];
}

/** @brief Render a single status cell. @since 0.2.0 */
function Cell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Box gap={1}>
      <Text color={colors.fgDim}>{label}</Text>
      <Text color={color ?? colors.fg}>{value}</Text>
    </Box>
  );
}

/** @brief Render the global status bar. @since 0.2.0 */
export function StatusBar({
  tokensUsed,
  tokensBudget,
  elapsedMs,
  step,
  stepCount,
  stepTotal,
  gitBranch,
  gitAhead,
  gitBehind,
  networkOnline,
  memoryMb,
  cpuPercent,
  focusLabel,
  mode = 'normal',
  hints = [],
}: StatusBarProps) {
  const tokenPct = tokensBudget > 0 ? (tokensUsed / tokensBudget) * 100 : 0;
  const tokenColor = tokenPct > 90 ? colors.error : tokenPct > 75 ? colors.warn : colors.fg;
  const modeColor =
    mode === 'command' ? colors.accentBlue
    : mode === 'search' ? colors.warn
    : mode === 'insert' ? colors.running
    : colors.fgDim;

  return (
    <Box flexDirection="column">
      <Box borderStyle="single" borderColor={colors.fgDim} paddingX={1} gap={2}>
        <Box gap={2}>
          <Text color={modeColor} bold>
            {mode.toUpperCase()}
          </Text>
          <Text color={colors.fgDim}>│</Text>
          <Cell label="tokens" value={bar(tokenPct, 8)} color={tokenColor} />
          <Text color={colors.fgDim}>│</Text>
          <Cell label="elapsed" value={formatMs(elapsedMs)} />
          {step && (
            <>
              <Text color={colors.fgDim}>│</Text>
              <Cell label="step" value={stepCount !== undefined ? `${stepCount}/${stepTotal}` : step} />
            </>
          )}
          {gitBranch && (
            <>
              <Text color={colors.fgDim}>│</Text>
              <Cell
                label="git"
                value={`${gitBranch}${gitAhead ? `↑${gitAhead}` : ''}${gitBehind ? `↓${gitBehind}` : ''}`}
                color={colors.commit}
              />
            </>
          )}
          {networkOnline !== undefined && (
            <>
              <Text color={colors.fgDim}>│</Text>
              <Cell
                label="net"
                value={networkOnline ? 'on' : 'off'}
                color={networkOnline ? colors.done : colors.error}
              />
            </>
          )}
          {memoryMb !== undefined && (
            <>
              <Text color={colors.fgDim}>│</Text>
              <Cell label="mem" value={`${memoryMb}MB`} />
            </>
          )}
          {cpuPercent !== undefined && (
            <>
              <Text color={colors.fgDim}>│</Text>
              <Cell label="cpu" value={`${cpuPercent}%`} />
            </>
          )}
          {focusLabel && (
            <>
              <Text color={colors.fgDim}>│</Text>
              <Cell label="focus" value={focusLabel} color={colors.accent} />
            </>
          )}
        </Box>
        <Box gap={1}>
          <Text color={colors.fgDim}>hints:</Text>
          {hints.map((h, i) => (
            <Text key={i} color={colors.fgDim}>
              {h}
            </Text>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
