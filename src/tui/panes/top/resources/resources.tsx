/** @brief Resources pane: live CPU/memory/disk/network gauges + sparkline. @since 0.1.1 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/style/colors';
import { glyphs } from '../../../core/style/icons';
import { ProgressBar } from '../../../widgets';

/** @brief Single-snapshot system resource reading. @since 0.1.1 */
export interface ResourceSnapshot {
  cpu: number;
  memory: { used: number; total: number };
  disk: { used: number; total: number };
  network: { bytesIn: number; bytesOut: number };
  history?: { cpu: number[]; mem: number[] };
}

/** @brief Resources pane props. @since 0.1.1 */
export interface ResourcesProps {
  resources: ResourceSnapshot;
  width?: number;
  focused?: boolean;
}

const SPARK_CHARS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
const TITLE = `${glyphs.info} RESOURCES`;

/** @brief Format a byte count as "1.2k", "8.4M", etc. @since 0.1.1 */
function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '0';
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}k`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)}M`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(1)}G`;
}

/** @brief Format used/total pair as "4.2G / 16G". @since 0.1.1 */
function formatUsed(used: number, total: number): string {
  return `${formatBytes(used)} / ${formatBytes(total)}`;
}

/** @brief Build a sparkline string from a series of 0..1 values. @since 0.1.1 */
function sparkline(values: number[], width: number): string {
  if (values.length === 0) return '';
  const tail = values.slice(-width);
  return tail
    .map((v) => {
      const clamped = Math.max(0, Math.min(1, v));
      const idx = Math.min(SPARK_CHARS.length - 1, Math.round(clamped * (SPARK_CHARS.length - 1)));
      return SPARK_CHARS[idx];
    })
    .join('');
}

/** @brief Render the resources monitor pane. @since 0.1.1 */
export function Resources({ resources, width }: ResourcesProps) {
  const barWidth = width ? Math.max(8, Math.min(40, width - 30)) : 20;
  const memPct = resources.memory.total > 0 ? resources.memory.used / resources.memory.total : 0;
  const diskPct = resources.disk.total > 0 ? resources.disk.used / resources.disk.total : 0;
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={colors.warn} paddingX={1}>
      <Text color={colors.warn} bold>
        {TITLE}
      </Text>
      <Box flexDirection="column" marginTop={1}>
        <ProgressBar label="cpu" value={resources.cpu} max={100} width={barWidth} />
        <ProgressBar
          label="memory"
          value={memPct * 100}
          max={100}
          width={barWidth}
          color={memPct > 0.85 ? colors.error : colors.warn}
        />
        <Text color={colors.fgDim}>  mem: {formatUsed(resources.memory.used, resources.memory.total)}</Text>
        <ProgressBar
          label="disk"
          value={diskPct * 100}
          max={100}
          width={barWidth}
          color={diskPct > 0.9 ? colors.error : colors.accent}
        />
        <Text color={colors.fgDim}>  dsk: {formatUsed(resources.disk.used, resources.disk.total)}</Text>
        <Text color={colors.fgDim}>
          net: ↓ {formatBytes(resources.network.bytesIn)} ↑ {formatBytes(resources.network.bytesOut)}
        </Text>
      </Box>
      {resources.history && (
        <Box flexDirection="column" marginTop={1}>
          <Text color={colors.fgDim}>history</Text>
          <Box gap={2}>
            <Text color={colors.warn}>cpu {sparkline(resources.history.cpu, barWidth)}</Text>
            <Text color={colors.warn}>mem {sparkline(resources.history.mem, barWidth)}</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}