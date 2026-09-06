/**
 * @fileoverview Memory pane — recall, reflect, add, delete facts.
 * @since 0.2.1
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';

/** @brief One fact. @since 0.2.1 */
export interface Fact {
  key: string;
  value: string;
  tags: string[];
}

export interface MemoryPaneProps {
  facts: Fact[];
  query?: string;
  onAdd?: (key: string, value: string, tags: string[]) => void;
  onDelete?: (key: string) => void;
}

/** @brief Render the memory pane. @since 0.2.1 */
export function MemoryPane({ facts, query, onAdd, onDelete }: MemoryPaneProps) {
  const shown = query
    ? facts.filter(
        (f) =>
          f.key.includes(query) || f.value.includes(query) || f.tags.some((t) => t.includes(query)),
      )
    : facts;
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.complete}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.complete} bold>
        _MEMORY ({shown.length}/{facts.length})
      </Text>
      {query && <Text color={colors.fgDim}>query: {query}</Text>}
      {shown.length === 0 ? (
        <Text color={colors.fgDim}>No facts match.</Text>
      ) : (
        shown.map((f) => (
          <Box key={f.key} gap={1} marginTop={1} flexDirection="column">
            <Text color={colors.fg} bold>
              {f.key}
            </Text>
            <Text color={colors.fgDim}>{f.value}</Text>
            {f.tags.length > 0 && <Text color={colors.warn}>tags: {f.tags.join(', ')}</Text>}
            {onDelete && <Text color={colors.error}>[d] delete</Text>}
          </Box>
        ))
      )}
      {onAdd && (
        <Box marginTop={1}>
          <Text color={colors.fgDim}>[a] add · [/] search</Text>
        </Box>
      )}
    </Box>
  );
}
