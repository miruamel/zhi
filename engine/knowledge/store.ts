/**
 * @fileoverview Knowledge store — key-value semantic memory with tag queries. @since 0.2.6
 * @package zhi
 */

/** @brief Knowledge fact. @since 0.2.6 */
export interface KnowledgeFact {
  key: string;
  value: string;
  tags: string[];
}

/** @brief Knowledge entry. @since 0.2.6 */
export interface KnowledgeEntry {
  id: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  score?: number;
}

/** @brief Search result. @since 0.2.6 */
export interface SearchResult {
  entry: KnowledgeEntry;
  score: number;
}

/** @brief Store options. @since 0.2.6 */
export interface StoreOptions {
  maxEntries?: number;
  similarityThreshold?: number;
}

/** @brief In-memory knowledge store with key-value facts and tag queries. @since 0.2.6 */
export class KnowledgeStore {
  private facts: Map<string, KnowledgeFact> = new Map();
  private entries: Map<string, KnowledgeEntry> = new Map();

  constructor(_options: StoreOptions = {}) {}

  /** @brief Add or update a fact by key. @since 0.2.6 */
  add(fact: KnowledgeFact): KnowledgeFact {
    this.facts.set(fact.key, fact);
    return fact;
  }

  /** @brief Get fact by key. @since 0.2.6 */
  get(key: string): KnowledgeFact | undefined {
    return this.facts.get(key);
  }

  /** @brief Remove fact by key. @since 0.2.6 */
  remove(key: string): boolean {
    return this.facts.delete(key);
  }

  /** @brief Count facts. @since 0.2.6 */
  get size(): number {
    return this.facts.size;
  }

  /** @brief Query facts by tag. @since 0.2.6 */
  byTag(tag: string): KnowledgeFact[] {
    return [...this.facts.values()].filter((f) => f.tags.includes(tag));
  }

  /** @brief Search by keyword. @since 0.2.6 */
  search(query: string, limit = 10): SearchResult[] {
    const results: SearchResult[] = [];
    for (const [key, fact] of this.facts) {
      if (
        fact.value.toLowerCase().includes(query.toLowerCase()) ||
        fact.key.toLowerCase().includes(query.toLowerCase())
      ) {
        const entry: KnowledgeEntry = {
          id: key,
          content: fact.value,
          createdAt: 0,
          updatedAt: 0,
          score: 1.0,
        };
        results.push({ entry, score: 1.0 });
      }
    }
    return results.slice(0, limit);
  }

  /** @brief Cosine similarity between two vectors. @since 0.2.6 */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : dot / denom;
  }

  /** @brief Clear all entries. @since 0.2.6 */
  clear(): void {
    this.facts.clear();
    this.entries.clear();
  }

  /** @brief Export all facts. @since 0.2.6 */
  export(): KnowledgeFact[] {
    return [...this.facts.values()];
  }
}

/** @brief Create a knowledge store. @since 0.2.6 */
export function createStore(options?: StoreOptions): KnowledgeStore {
  return new KnowledgeStore(options);
}
