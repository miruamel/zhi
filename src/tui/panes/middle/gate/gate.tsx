/** @brief Gate evaluation pane: per-gate pass/fail/score row list. @since 0.1.1 */
import { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../../../core/style/colors';
import { formatMs } from '../../../core/style/format';

export interface GateResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'pending' | 'skip';
  score: number;
  detail?: string;
  durationMs: number;
}

export interface GateProps {
  gates: GateResult[];
  onReplay?: (id: string) => void;
  maxLines?: number;
  focused?: boolean;
}

const STATUS_ICON: Record<GateResult['status'], { glyph: string; color: string }> = {
  pass: { glyph: '✓', color: colors.done },
  fail: { glyph: '✗', color: colors.error },
  pending: { glyph: '◌', color: colors.warn },
  skip: { glyph: '⊘', color: colors.fgDim },
};

const SCORE_WIDTH = 12;

/** @brief Render a 12-wide filled bar for the gate score. */
function scoreBar(score: number): string {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(score) ? score : 0));
  const filled = Math.round(clamped * SCORE_WIDTH);
  return '█'.repeat(filled) + '░'.repeat(SCORE_WIDTH - filled);
}

/** @brief Handle a keypress in the gate pane: navigate focus or dispatch replay. @since 0.1.1 */
export function handleGateKey(
  input: string,
  key: { upArrow?: boolean; downArrow?: boolean },
  gates: GateResult[],
  focus: number,
  onReplay?: (id: string) => void,
): { nextFocus: number; replayed?: string } {
  if (key.downArrow || input === 'j') {
    return { nextFocus: Math.min(focus + 1, Math.max(0, gates.length - 1)) };
  } else if (key.upArrow || input === 'k') {
    return { nextFocus: Math.max(0, focus - 1) };
  } else if (input === 'r' && onReplay && gates[focus]) {
    return { nextFocus: focus, replayed: gates[focus].id };
  }
  return { nextFocus: focus };
}

/** @brief Render the gate evaluation pane. @since 0.1.1 */
export function Gate({ gates, onReplay, maxLines = 20 , focused = true }: GateProps) {
  const [focus, setFocus] = useState(0);
  const visible = gates.slice(0, maxLines);

  useInput((input, key) => {
    if (!focused) return;
    const { nextFocus, replayed } = handleGateKey(input, key, gates, focus, onReplay);
    setFocus(nextFocus);
    if (replayed && onReplay) onReplay(replayed);
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.done}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.done} bold>
        ✓ GATE ({gates.length})
      </Text>
      {visible.length === 0 ? (
        <Text color={colors.fgDim}> (no gates yet — press r on a row to replay)</Text>
      ) : (
        visible.map((g, i) => {
          const { glyph, color } = STATUS_ICON[g.status];
          const marker = i === focus ? '▶' : ' ';
          return (
            <Box key={g.id} gap={1}>
              <Text color={i === focus ? colors.fg : colors.fgDim}>{marker}</Text>
              <Text color={color}>{glyph}</Text>
              <Text color={colors.fg}>{g.name.padEnd(14)}</Text>
              <Text color={color}>{scoreBar(g.score)}</Text>
              <Text color={colors.fgDim}>{g.score.toFixed(2)}</Text>
              <Text color={colors.fgDim}>{formatMs(g.durationMs).padStart(8)}</Text>
              {g.detail && <Text color={colors.fgDim}> {g.detail}</Text>}
            </Box>
          );
        })
      )}
      <Box marginTop={1} gap={1}>
        <Text color={colors.fgDim}>↑↓ navigate</Text>
        <Text color={colors.fgDim}> · r replay</Text>
      </Box>
    </Box>
  );
}
