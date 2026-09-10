/**
 * @fileoverview Knowledge inspector pane — vector store stats + cosine search.
 * @since 0.1.14 @package zhi
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { Badge } from '../../../widgets';
import { Pane } from '../../primitives/base/pane-base';
import { queryFacts } from '@engine/knowledge/query';
import type { KnowledgeFact } from '@engine/knowledge/store';

export interface KnowledgeInspectorProps {
  facts: KnowledgeFact[];
  query?: string;
  onQuery?: (q: string) => void;
  embeddingDims?: number;
}

/** @brief Render the knowledge inspector pane. @since 0.1.14 */
export function KnowledgeInspector({
  facts,
  query,
  onQuery,
  embeddingDims = 64,
}: KnowledgeInspectorProps) {
  const q = (query ?? '').trim();
  const results = q ? queryFacts(facts, q, { topK: 10 }) : facts;
  const tagCounts = new Map<string, number>();
  for (const f of facts) for (const t of f.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <Pane title="_KNOWLEDGE" focused={false}>
      <Box flexDirection="column" flexGrow={1}>
        <Box gap={2} flexWrap="wrap">
          <Badge label={`facts: ${facts.length}`} color={colors.complete} />
          <Badge label={`dim: ${embeddingDims}`} color={colors.forward} />
          <Badge label={`tags: ${tagCounts.size}`} color={colors.warn} />
        </Box>
        {topTags.length > 0 && (
          <Box gap={1} marginTop={1} flexWrap="wrap">
            {topTags.map(([tag, count]) => (
              <Badge key={tag} label={`${tag} (${count})`} color={colors.fgDim} variant="outline" />
            ))}
          </Box>
        )}
        {onQuery && (
          <Box marginTop={1}>
            <Text color={colors.fgDim}>
              {q ? `search: ${q}` : 'type to search facts by similarity'}
            </Text>
          </Box>
        )}
        {results.length === 0 ? (
          <Box marginTop={1}>
            <Text color={colors.fgDim}>No facts match.</Text>
          </Box>
        ) : (
          results.map((f) => (
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
            </Box>
          ))
        )}
      </Box>
    </Pane>
  );
}
