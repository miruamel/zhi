/**
 * @fileoverview Memory pane — recall, reflect, add, delete facts with tag chips + search.
 * @since 0.1.11 @updated 0.1.14 — M2 Knowledge UI: tag filter, empty-state polish, query wiring
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { Badge } from '../../../widgets';
import { Pane } from '../../primitives/base/pane-base';

/** @brief One fact. @since 0.1.11 */
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
  activeTag?: string | null;
}

/** @brief Render the memory pane. @since 0.1.11 @updated 0.1.14 */
export function MemoryPane({ facts, query, onAdd, onDelete, activeTag }: MemoryPaneProps) {
  const q = (query ?? '').trim().toLowerCase();
  const tagFiltered = activeTag ? facts.filter((f) => f.tags.includes(activeTag)) : facts;
  const shown = q
    ? tagFiltered.filter(
        (f) =>
          f.key.toLowerCase().includes(q) ||
          f.value.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q)),
      )
    : tagFiltered;

  const tagCounts = new Map<string, number>();
  for (const f of facts) for (const t of f.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <Pane title="_MEMORY" focused={false}>
      <Box flexDirection="column" flexGrow={1}>
        {query && <Text color={colors.fgDim}>query: {query}</Text>}
        {topTags.length > 0 && (
          <Box gap={1} marginTop={0} flexWrap="wrap">
            <Badge
              label={activeTag ? `#${activeTag} ✕` : '#all'}
              color={activeTag ? colors.warn : colors.fgDim}
              variant="outline"
            />
            {topTags.map(([tag, count]) => (
              <Badge
                key={tag}
                label={`${tag} (${count})`}
                color={activeTag === tag ? colors.complete : colors.fgDim}
                variant={activeTag === tag ? 'solid' : 'outline'}
              />
            ))}
          </Box>
        )}
        {shown.length === 0 ? (
          <Box flexDirection="column" gap={0} marginTop={1}>
            <Text color={colors.fgDim}>No facts match.</Text>
            {topTags.length > 0 && (
              <Text color={colors.fgDim}>Try clearing the tag filter or search.</Text>
            )}
          </Box>
        ) : (
          shown.map((f) => (
            <Box key={f.key} gap={1} marginTop={1} flexDirection="column">
              <Text color={colors.fg} bold>
                {f.key}
              </Text>
              <Text color={colors.fgDim}>{f.value}</Text>
              {f.tags.length > 0 && (
                <Box gap={1} flexWrap="wrap">
                  {f.tags.map((t) => (
                    <Badge key={t} label={t} color={colors.warn} variant="outline" />
                  ))}
                </Box>
              )}
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
    </Pane>
  );
}
