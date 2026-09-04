/** @brief ProgressRing widget: circular progress indicator via Unicode block chars. @since 0.1.1 */
import { Text } from 'ink';
import { colors } from '../../core/style/colors';

export interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  color?: string;
  label?: string;
  showPercent?: boolean;
}

/** @brief Total cell count of the ring template. @since 0.1.1 */
const RING_CELLS = 8;

/** @brief Ring template — 3-row layout, ring cells marked as `R`, center as `C`. @since 0.1.1 */
const RING_ROWS = [' R R ', 'R C R', ' R R '] as const;

/** @brief Resolve per-row, per-column ring cell positions from the template. @since 0.1.1 */
const RING_MAP: ReadonlyArray<{ row: number; col: number }> = (() => {
  const map: { row: number; col: number }[] = [];
  for (let r = 0; r < RING_ROWS.length; r++) {
    for (let c = 0; c < RING_ROWS[r].length; c++) {
      if (RING_ROWS[r][c] === 'R') map.push({ row: r, col: c });
    }
  }
  return map;
})();

/** @brief Render a circular progress ring using Unicode block characters. @since 0.1.1 */
export function ProgressRing({
  value,
  max = 100,
  size = 1,
  color = colors.accent,
  label,
  showPercent = false,
}: ProgressRingProps) {
  const safeMax = max > 0 ? max : 0;
  const safeValue = Math.max(0, Math.min(value, safeMax));
  const pct = safeMax > 0 ? safeValue / safeMax : 0;
  const filled = Math.round(pct * RING_CELLS);
  const percentText = `${Math.round(pct * 100)}%`;
  const filledChar = '▓';
  const emptyChar = '░';
  const gap = ' '.repeat(Math.max(0, size - 1));
  const gapLeft = ' '.repeat(Math.max(0, size - 1));

  const lines: { text: string; filledCount: number }[] = [];
  for (let r = 0; r < RING_ROWS.length; r++) {
    let line = '';
    let filledInRow = 0;
    for (let c = 0; c < RING_ROWS[r].length; c++) {
      const ch = RING_ROWS[r][c];
      if (ch === 'C') {
        line += showPercent ? percentText : ' ';
      } else if (ch === 'R') {
        const idx = RING_MAP.findIndex((p) => p.row === r && p.col === c);
        const isFilled = idx < filled;
        if (isFilled) filledInRow++;
        line += isFilled ? filledChar : emptyChar;
        if (c < RING_ROWS[r].length - 1 && RING_ROWS[r][c + 1] !== ' ') line += gap;
      } else {
        line += ch;
      }
    }
    lines.push({ text: line, filledCount: filledInRow });
  }

  return (
    <Text>
      {lines.map((row, i) => (
        <Text key={i}>
          {gapLeft}
          {(() => {
            const segments: React.ReactNode[] = [];
            const text = row.text;
            let inFilled = false;
            let buf = '';
            for (const ch of text) {
              const isBlock = ch === filledChar || ch === emptyChar;
              const segFilled = ch === filledChar;
              if (!isBlock) {
                if (buf) {
                  segments.push(
                    <Text key={segments.length} color={inFilled ? color : colors.fgDim}>
                      {buf}
                    </Text>,
                  );
                  buf = '';
                }
                segments.push(
                  <Text key={segments.length} color={colors.fg}>
                    {ch}
                  </Text>,
                );
                inFilled = false;
                continue;
              }
              if (segFilled !== inFilled && buf) {
                segments.push(
                  <Text key={segments.length} color={inFilled ? color : colors.fgDim}>
                    {buf}
                  </Text>,
                );
                buf = '';
              }
              buf += ch;
              inFilled = segFilled;
            }
            if (buf) {
              segments.push(
                <Text key={segments.length} color={inFilled ? color : colors.fgDim}>
                  {buf}
                </Text>,
              );
            }
            return segments;
          })()}
          {'\n'}
        </Text>
      ))}
      {label !== undefined && label !== '' && (
        <Text color={colors.fgDim}>{label}</Text>
      )}
    </Text>
  );
}
