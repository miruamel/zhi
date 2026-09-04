/** @brief DAG pane: step list with status icons. @since 0.1.2 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { glyphs } from '../../../core/icons';
import type { DagStep } from '../../../core/state';

function statusIcon(s: DagStep['status']): { g: string; c: string } {
  switch (s) {
    case 'running':
      return { g: glyphs.running, c: colors.running };
    case 'done':
      return { g: glyphs.done, c: colors.done };
    case 'failed':
      return { g: glyphs.failed, c: colors.failed };
    case 'skipped':
      return { g: '·', c: colors.fgDim };
    case 'pending':
    default:
      return { g: glyphs.pending, c: colors.pending };
  }
}

export interface DagProps {
  steps: DagStep[];
  currentStepId?: string;
  currentLoop: string;
}

/** @brief Render the DAG pane (step list with status). @since 0.1.2 */
export function Dag({ steps, currentStepId, currentLoop }: DagProps) {
  if (steps.length === 0) {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={colors.fgDim}
        paddingX={1}
        flexGrow={1}
      >
        <Text color={colors.accent} bold>
          ⟶ DAG
        </Text>
        <Text color={colors.fgDim}> (no plan yet — current: {currentLoop})</Text>
      </Box>
    );
  }
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.accent} bold>
        ⟶ DAG ({steps.length} steps)
      </Text>
      {steps.map((s) => {
        const { g, c } = statusIcon(s.status);
        const isCurrent = s.id === currentStepId;
        const marker = isCurrent ? '▸' : ' ';
        return (
          <Box key={s.id} gap={1}>
            <Text color={c}>
              {marker} {g} {s.kind.padEnd(9)}
            </Text>
            <Text color={isCurrent ? colors.fg : colors.fgDim}>{s.id}</Text>
            {s.tokensUsed !== undefined && s.tokensUsed > 0 && (
              <Text color={colors.fgDim}> {s.tokensUsed} tok</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
