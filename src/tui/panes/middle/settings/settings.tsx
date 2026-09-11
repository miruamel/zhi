/**
 * @fileoverview Settings pane — config entries, toggle, edit.
 * @since 0.1.11
 * @updated 0.1.13 — focus state via props (presentational).
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';

/** @brief One config entry. @since 0.1.11 */
export interface ConfigEntry {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean';
  description: string;
}

export interface SettingsPaneProps {
  entries: ConfigEntry[];
  onChange?: (key: string, value: string) => void;
  isFocused?: boolean;
}

const TYPE_COLOR: Record<ConfigEntry['type'], string> = {
  string: colors.fg,
  number: colors.forward,
  boolean: colors.complete,
};
/** @brief Render the settings pane. Focus state via props (presentational). @since 0.1.11 */
export function SettingsPane({ entries, onChange, isFocused = false }: SettingsPaneProps) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={isFocused ? colors.accent : colors.warn}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={isFocused ? colors.accent : colors.warn} bold>
        _SETTINGS ({entries.length})
      </Text>
      {entries.length === 0 ? (
        <Text color={colors.fgDim}>No settings.</Text>
      ) : (
        entries.map((e) => (
          <Box key={e.key} gap={1} marginTop={1} flexDirection="column">
            <Text color={TYPE_COLOR[e.type]}>
              {e.key} [{e.type}]
            </Text>
            <Text color={colors.fgDim}>{e.description}</Text>
            <Text color={colors.fg}>{e.value}</Text>
            {onChange && <Text color={colors.fgDim}>[e] edit</Text>}
          </Box>
        ))
      )}
    </Box>
  );
}
