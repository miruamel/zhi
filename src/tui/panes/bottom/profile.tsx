/** @brief Profile pane: agent profile/settings card with stats, features, endpoints. @since 0.1.1 */
import { Box, Text, useInput } from 'ink';
import { colors } from '../../core/style/colors';
import { glyphs } from '../../core/style/icons';
import { bar, formatTokens } from '../../core/style/format';

export interface AgentProfile {
  name: string;
  model: string;
  version: string;
  uptime: number;
  tokensUsed: number;
  tokensBudget: number;
  features: string[];
  endpoints: { api: string; ws: string };
}

export interface ProfileProps {
  profile: AgentProfile;
  onEdit?: (field: string, value: string) => void;
  onExport?: () => void;
}

const UPTIME_MS_PER_MIN = 60_000;
const UPTIME_MS_PER_HOUR = 3_600_000;
const UPTIME_MS_PER_DAY = 86_400_000;
const BAR_WIDTH = 16;

/** @brief Format uptime in ms as a compact human string (Xd Yh Zm Ws). @since 0.1.1 */
function formatUptime(ms: number): string {
  if (ms < UPTIME_MS_PER_MIN) return `${Math.floor(ms / 1000)}s`;
  const days = Math.floor(ms / UPTIME_MS_PER_DAY);
  const hours = Math.floor((ms % UPTIME_MS_PER_DAY) / UPTIME_MS_PER_HOUR);
  const mins = Math.floor((ms % UPTIME_MS_PER_HOUR) / UPTIME_MS_PER_MIN);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${mins}m`);
  return parts.join(' ');
}

/** @brief Render the agent profile/settings pane. @since 0.1.1 */
export function Profile({ profile, onEdit, onExport }: ProfileProps) {
  const usage = profile.tokensBudget > 0
    ? profile.tokensUsed / profile.tokensBudget
    : 0;

  useInput((input) => {
    if (input === 'e' && onEdit) {
      onEdit('name', profile.name);
    }
    if (input === 'x' && onExport) {
      onExport();
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.accentBlue}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.accentBlue} bold>
        {glyphs.info} PROFILE
      </Text>
      <Box flexDirection="column" marginTop={1}>
        <Box gap={1}>
          <Text color={colors.fgDim}>name:</Text>
          <Text bold color={colors.fg}>{profile.name}</Text>
        </Box>
        <Box gap={1}>
          <Text color={colors.fgDim}>model:</Text>
          <Text color={colors.fg}>{profile.model}</Text>
        </Box>
        <Box gap={1}>
          <Text color={colors.fgDim}>version:</Text>
          <Text color={colors.fg}>{profile.version}</Text>
        </Box>
        <Box gap={1}>
          <Text color={colors.fgDim}>uptime:</Text>
          <Text color={colors.fg}>{formatUptime(profile.uptime)}</Text>
        </Box>
        <Box gap={1} flexDirection="column">
          <Box gap={1}>
            <Text color={colors.fgDim}>tokens:</Text>
            <Text color={colors.fg}>
              {formatTokens(profile.tokensUsed)} / {formatTokens(profile.tokensBudget)}
            </Text>
          </Box>
          <Text color={colors.accentBlue}>{bar(usage, BAR_WIDTH)}</Text>
        </Box>
        <Box gap={1}>
          <Text color={colors.fgDim}>features:</Text>
          {profile.features.length === 0 ? (
            <Text color={colors.fgDim}>(none)</Text>
          ) : (
            profile.features.map((f) => (
              <Text key={f} color={colors.accent} bold>
                [{f}]
              </Text>
            ))
          )}
        </Box>
        <Box gap={1}>
          <Text color={colors.fgDim}>api:</Text>
          <Text color={colors.fg}>{profile.endpoints.api}</Text>
        </Box>
        <Box gap={1}>
          <Text color={colors.fgDim}>ws:</Text>
          <Text color={colors.fg}>{profile.endpoints.ws}</Text>
        </Box>
      </Box>
    </Box>
  );
}