/** @brief Eval pane: build/test/security/gate stages. @since 0.1.0 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/style/colors';
import { formatMs, formatPct } from '../../../core/style/format';
import { glyphs } from '../../../core/style/icons';
import type { EvalReport } from '../../../core/state';

export interface EvalProps {
  evalReport: EvalReport;
}

/** @brief Render the eval pane (per-stage status). @since 0.1.0 */
export function Eval({ evalReport }: EvalProps) {
  const stages = [evalReport.build, evalReport.test, evalReport.security, evalReport.gate];
  const allOk = stages.every((s) => s.ok);
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.accentBlue}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.accentBlue} bold>
        ✓ EVAL
      </Text>
      {stages.map((s) => {
        const g = s.ok ? glyphs.done : glyphs.failed;
        const c = s.ok ? colors.done : colors.failed;
        return (
          <Box key={s.name} gap={1}>
            <Text color={c}>
              {g} {s.name.padEnd(8)}
            </Text>
            <Text color={colors.fgDim}> {formatMs(s.durationMs).padStart(8)}</Text>
            <Text color={s.ok ? colors.fgDim : colors.fg}>{s.detail}</Text>
          </Box>
        );
      })}
      <Box marginTop={1} gap={1}>
        <Text color={colors.fgDim}>coverage</Text>
        <Text color={colors.fg}>{formatPct(evalReport.weightedAvg)}</Text>
        <Text color={colors.fgDim}> · gate</Text>
        <Text color={allOk ? colors.done : colors.failed} bold>
          {evalReport.gatePass ? '✓ PASS' : '✗ FAIL'}
        </Text>
      </Box>
    </Box>
  );
}
