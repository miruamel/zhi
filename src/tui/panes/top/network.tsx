/** @brief Network pane: active connections with throughput + latency. @since 0.1.1 */
import { Box, Text, useInput } from 'ink';
import { colors } from '../../core/style/colors';
import { glyphs } from '../../core/style/icons';
import { formatTokens } from '../../core/style/format';

export interface NetworkConnection {
  id: string;
  host: string;
  port: number;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  bytesIn: number;
  bytesOut: number;
  latencyMs: number;
}

export interface NetworkProps {
  connections: NetworkConnection[];
  onDisconnect?: (id: string) => void;
  maxLines?: number;
  focused?: boolean;
}

const STATUS_DOT: Record<NetworkConnection['status'], string> = {
  connected: '●',
  connecting: '◐',
  disconnected: '○',
  error: '✗',
};

const STATUS_COLOR: Record<NetworkConnection['status'], string> = {
  connected: colors.done,
  connecting: colors.warn,
  disconnected: colors.pending,
  error: colors.error,
};

/** @brief Format byte count as "1.2k" / "12.4k" / "1.0M". @param {number} n @return {string} */
function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '0';
  return formatTokens(n);
}

/** @brief Render the network connections pane. @since 0.1.1 */
export function Network({ connections, onDisconnect, maxLines , focused = true }: NetworkProps) {
  const limit = maxLines ?? connections.length;
  const visible = connections.slice(0, limit);

  useInput((input) => {
    if (!focused) return;
    if (input === 'd' && onDisconnect && visible[0]) {
      onDisconnect(visible[0].id);
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.forward} bold>
        {glyphs.info} NETWORK
      </Text>
      {visible.length === 0 ? (
        <Box marginTop={1}>
          <Text color={colors.fgDim}>no connections</Text>
        </Box>
      ) : (
        <Box flexDirection="column" marginTop={1}>
          {visible.map((c) => (
            <Box key={c.id} gap={1}>
              <Text color={STATUS_COLOR[c.status]}>{STATUS_DOT[c.status]}</Text>
              <Text color={colors.fg}>{c.host}:{c.port}</Text>
              <Text color={colors.fgDim}>↓{formatBytes(c.bytesIn)} ↑{formatBytes(c.bytesOut)}</Text>
              <Text color={colors.warn}>{c.latencyMs}ms</Text>
            </Box>
          ))}
          {connections.length > visible.length ? (
            <Text color={colors.fgDim}>+{connections.length - visible.length} more</Text>
          ) : null}
        </Box>
      )}
    </Box>
  );
}