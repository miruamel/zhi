/**
 * @fileoverview Knowledge query — cosine-similarity ranked fact search. @since 0.1.14
 * @package zhi
 */
import { embed, cosineSimilarity } from './embed';
import type { KnowledgeFact } from './store';

/** @brief Query options. @since 0.1.14 */
export interface QueryOptions {
  topK?: number;
  threshold?: number;
}

/** @brief Query facts by cosine similarity against a text query. @since 0.1.14 */
export function queryFacts(
  facts: KnowledgeFact[],
  queryText: string,
  opts: QueryOptions = {},
): KnowledgeFact[] {
  const { topK = 10, threshold = 0 } = opts;
  if (!queryText.trim()) return facts;
  const qv = embed(queryText);
  const scored = facts.map((f) => {
    const fv = embed(f.value);
    return { fact: f, score: cosineSimilarity(qv, fv) };
  });
  return scored
    .filter((s) => s.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.fact);
}
