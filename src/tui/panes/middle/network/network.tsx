/**
 * @fileoverview Network pane — request latency, error rates.
 * @since 0.2.0
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { Sparkline, Badge } from '../../../widgets';

export interface NetworkRequest {
  url: string;
  status: number;
  durationMs: number;
  timestamp: number;
}

export interface NetworkPaneProps {
  requests: NetworkRequest[];
  online?: boolean;
  latencyMs?: number;
  errorRate?: number;
}

/** @brief Render the network pane. @since 0.2.0 */
export function NetworkPane({
  requests,
  online = true,
  latencyMs = 0,
  errorRate = 0,
}: NetworkPaneProps) {
  const recent = requests.slice(-10);
  const latencies = recent.map((r) => r.durationMs);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.commit}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.commit} bold>
        _NETWORK
      </Text>
      <Box gap={1} marginTop={1}>
        <Badge
          label={online ? '● ONLINE' : '● OFFLINE'}
          color={online ? colors.done : colors.error}
        />
        {latencyMs > 0 && <Text color={colors.fgDim}>latency: {latencyMs}ms</Text>}
        {errorRate > 0 && <Text color={colors.error}>errors: {(errorRate * 100).toFixed(1)}%</Text>}
      </Box>
      {latencies.length > 0 && (
        <Box marginTop={1}>
          <Sparkline data={latencies} color={colors.commit} />
        </Box>
      )}
      <Box marginTop={1} flexDirection="column">
        {recent.map((r, i) => (
          <Text key={i} dimColor>
            <Text color={r.status >= 400 ? colors.error : colors.done}>{r.status}</Text>
            {'  '}
            {r.url.length > 50 ? r.url.slice(0, 50) + '…' : r.url}
            {'  '}
            <Text color={colors.fgDim}>{r.durationMs}ms</Text>
          </Text>
        ))}
      </Box>
    </Box>
  );
}
