/**
 * @fileoverview Model cache — response caching with TTL. @since 0.2.6
 * @package zhi
 */
export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  hits: number;
}

export interface ModelCache<T = unknown> {
  get(key: string): T | undefined;
  set(key: string, value: T, ttlMs?: number): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  size(): number;
  stats(): { hits: number; misses: number; evictions: number };
}

export class MemoryModelCache<T = unknown> implements ModelCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.evictions++;
      this.misses++;
      return undefined;
    }
    entry.hits++;
    this.hits++;
    return entry.value;
  }

  set(key: string, value: T, ttlMs = 60000): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs, hits: 0 });
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    return !!entry && Date.now() <= entry.expiresAt;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  size(): number {
    return this.store.size;
  }

  stats(): { hits: number; misses: number; evictions: number } {
    return { hits: this.hits, misses: this.misses, evictions: this.evictions };
  }
}

export function createModelCache<T = unknown>(): ModelCache<T> {
  return new MemoryModelCache<T>();
}
