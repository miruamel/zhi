/**
 * @fileoverview MCP pane — MCP server status, tools listing.
 * @since 0.2.3
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';

/** @brief MCP server info. @since 0.2.3 */
export interface McpServer {
  name: string;
  transport: 'stdio' | 'http' | 'sse';
  connected: boolean;
  toolCount: number;
  tools?: string[];
  error?: string;
}

/** @brief MCP pane props. @since 0.2.3 */
export interface McpPaneProps {
  servers: McpServer[];
}

/** @brief Render the MCP pane. @since 0.2.3 */
export function McpPane({ servers }: McpPaneProps) {
  const connectedCount = servers.filter((s) => s.connected).length;
  const totalTools = servers.reduce((sum, s) => sum + s.toolCount, 0);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.forward} bold>
        _MCP ({connectedCount}/{servers.length} up · {totalTools} tools)
      </Text>
      {servers.length === 0 ? (
        <Text color={colors.fgDim}>No MCP servers configured.</Text>
      ) : (
        servers.map((s) => {
          const color = s.connected ? colors.complete : colors.error;
          return (
            <Box key={s.name} gap={1}>
              <Text color={color}>
                {s.name.padEnd(16)}
                <Text color={color}>{s.connected ? '●' : '○'}</Text>
                <Text color={colors.fgDim}> {s.transport}</Text>
                <Text color={colors.fgDim}> {s.toolCount}t</Text>
              </Text>
              {s.error && <Text color={colors.error}> ⚠ {s.error.slice(0, 30)}</Text>}
            </Box>
          );
        })
      )}
    </Box>
  );
}
