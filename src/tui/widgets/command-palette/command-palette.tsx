/**
 * @fileoverview Command palette widget — Ctrl+K modal for global command search.
 * @description Fuzzy search over all available commands with keyboard navigation.
 * @package zhi
 */
import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import { colors } from '../../core/colors';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  category?: string;
  shortcut?: string;
  keywords?: string[];
  action: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  commands: CommandItem[];
  onClose: () => void;
  onExecute?: (cmd: CommandItem) => void;
  placeholder?: string;
}

/** @brief Simple fuzzy match: check if all chars of query appear in order. @since 0.2.0 */
function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

/** @brief Render the command palette modal. @since 0.2.0 */
export function CommandPalette({
  open,
  commands,
  onClose,
  onExecute,
  placeholder = 'Type to search...',
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);

  const filtered = commands
    .map((c, i) => ({ ...c, _i: i }))
    .filter((c) => fuzzyMatch(c.label, query) || fuzzyMatch(c.description ?? '', query))
    .slice(0, 20);

  useInput(
    (
      input: string,
      key: { return?: boolean; escape?: boolean; up?: boolean; down?: boolean; tab?: boolean },
    ) => {
      if (key.escape) {
        onClose();
        return;
      }
      if (key.return) {
        const cmd = filtered[selected];
        if (cmd) {
          onExecute?.(cmd);
          onClose();
        }
        return;
      }
      if (key.up) setSelected((s) => Math.max(0, s - 1));
      if (key.down) setSelected((s) => Math.min(filtered.length - 1, s + 1));
      if (input && !key.up && !key.down && !key.escape && !key.return && !key.tab) {
        setQuery((q) => q + input);
        setSelected(0);
      }
    },
  );

  if (!open) return null;

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor={colors.accentBlue}
      paddingX={2}
      paddingY={1}
    >
      <Box gap={1}>
        <Text color={colors.accentBlue} bold>
          ◈
        </Text>
        <Text color={colors.fgDim}>{placeholder}</Text>
        <Text color={colors.fg}>{query}</Text>
      </Box>
      <Box flexDirection="column" marginTop={1}>
        {filtered.length === 0 ? (
          <Text color={colors.fgDim}>No commands match "{query}"</Text>
        ) : (
          filtered.map((cmd, i) => (
            <Box key={cmd.id} gap={1}>
              <Text color={i === selected ? colors.accent : colors.fgDim}>
                {i === selected ? '›' : ' '}
              </Text>
              <Text color={i === selected ? colors.fg : colors.fgDim} bold={i === selected}>
                {cmd.label}
              </Text>
              {cmd.shortcut && <Text color={colors.fgDim}>{cmd.shortcut}</Text>}
              {cmd.description && <Text color={colors.fgDim}>— {cmd.description}</Text>}
            </Box>
          ))
        )}
      </Box>
      <Box marginTop={1} gap={2}>
        <Text color={colors.fgDim}>↑↓ navigate</Text>
        <Text color={colors.fgDim}>Enter execute</Text>
        <Text color={colors.fgDim}>Esc close</Text>
      </Box>
    </Box>
  );
}
