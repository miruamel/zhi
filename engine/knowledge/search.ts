/**
 * @fileoverview Semantic search over embedded chunks. @since 0.2.6
 * @package zhi
 */
import { embed, cosineSimilarity } from './embed';

/** @brief A chunk in the vector index. @since 0.2.6 */
export interface IndexedChunk {
  id: string;
  text: string;
  vector: number[];
  metadata: { path: string; tags: string[] };
}

/** @brief Search result. @since 0.2.6 */
export interface SearchResult {
  chunk: IndexedChunk;
  score: number;
}

/** @brief Search engine interface. @since 0.2.6 */
export interface SearchEngine {
  add(chunk: Omit<IndexedChunk, 'vector'>): void;
  search(query: string, k?: number, filter?: { tags?: string[]; path?: string }): SearchResult[];
  remove(id: string): void;
  size(): number;
}

/** @brief Create a search engine. @since 0.2.6 */
export function createSearch(dims: number = 64): SearchEngine {
  const chunks = new Map<string, IndexedChunk>();

  return {
    add(chunk: Omit<IndexedChunk, 'vector'>): void {
      chunks.set(chunk.id, { ...chunk, vector: embed(chunk.text, dims) });
    },
    search(
      query: string,
      k: number = 5,
      filter?: { tags?: string[]; path?: string },
    ): SearchResult[] {
      const qv = embed(query, dims);
      const results: SearchResult[] = [];
      for (const c of chunks.values()) {
        if (filter?.path && !c.metadata.path.includes(filter.path)) continue;
        if (filter?.tags && !filter.tags.some((t) => c.metadata.tags.includes(t))) continue;
        results.push({ chunk: c, score: cosineSimilarity(qv, c.vector) });
      }
      return results.sort((a, b) => b.score - a.score).slice(0, k);
    },
    remove(id: string): void {
      chunks.delete(id);
    },
    size(): number {
      return chunks.size;
    },
  };
}
