/**
 * @brief Persistent key-value storage for TUI panes (config, recent searches, drafts).
 * @since 0.1.1
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { dirname } from "node:path";

/** @brief Backend contract for any Storage implementation. @since 0.1.1 */
export interface StorageAdapter {
  /** @brief Read a string value by key, or null if absent. @since 0.1.1 */
  get(key: string): string | null;
  /** @brief Persist a string value. @since 0.1.1 */
  set(key: string, value: string): void;
  /** @brief Delete a key. No-op if absent. @since 0.1.1 */
  remove(key: string): void;
  /** @brief Erase every key. @since 0.1.1 */
  clear(): void;
  /** @brief List every stored key. @since 0.1.1 */
  keys(): string[];
}

/** @brief In-memory adapter backed by a Map; ephemeral, useful for tests. @since 0.1.1 */
export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, string>();

  get(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  set(key: string, value: string): void {
    this.store.set(key, value);
  }

  remove(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }
}

/** @brief File-backed JSON adapter; persists across sessions. @since 0.1.1 */
export class FileStorageAdapter implements StorageAdapter {
  private cache: Map<string, string>;
  private dirty = false;
  private writeTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * @brief Construct a file-backed adapter; loads eagerly, writes are debounced.
   * @param path Filesystem path of the JSON blob; created lazily.
   * @since 0.1.1
   */
  constructor(private readonly path: string) {
    this.cache = this.load(path);
  }

  private load(path: string): Map<string, string> {
    if (!existsSync(path)) return new Map();
    try {
      const raw = readFileSync(path, "utf8");
      const parsed = JSON.parse(raw) as Record<string, string>;
      return new Map(Object.entries(parsed));
    } catch {
      return new Map();
    }
  }

  private scheduleFlush(): void {
    if (this.writeTimer !== null) return;
    this.writeTimer = setTimeout(() => {
      this.writeTimer = null;
      this.flush();
    }, DEBOUNCE_MS);
  }

  private flush(): void {
    if (!this.dirty) return;
    this.dirty = false;
    const dir = dirname(this.path);
    if (dir && dir !== "." && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const obj = Object.fromEntries(this.cache);
    const tmp = `${this.path}.tmp`;
    writeFileSync(tmp, JSON.stringify(obj, null, 2), "utf8");
    renameSync(tmp, this.path);
  }

  get(key: string): string | null {
    return this.cache.get(key) ?? null;
  }

  set(key: string, value: string): void {
    this.cache.set(key, value);
    this.dirty = true;
    this.scheduleFlush();
  }

  remove(key: string): void {
    if (!this.cache.delete(key)) return;
    this.dirty = true;
    this.scheduleFlush();
  }

  clear(): void {
    if (this.cache.size === 0) return;
    this.cache.clear();
    this.dirty = true;
    this.scheduleFlush();
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

/** @brief Debounce window for coalescing rapid writes. @since 0.1.1 */
const DEBOUNCE_MS = 50;

/** @brief Default storage location (XDG-style). @since 0.1.1 */
const DEFAULT_PATH = `${process.env["HOME"] ?? "."}/.zhi/storage.json`;

/**
 * @brief Construct the appropriate adapter. Without a path, returns the in-memory variant.
 * @param path Optional JSON file path; when provided, returns a FileStorageAdapter.
 * @returns A ready-to-use StorageAdapter.
 * @since 0.1.1
 */
export function createStorage(path?: string): StorageAdapter {
  return path ? new FileStorageAdapter(path) : new MemoryStorageAdapter();
}

/**
 * @brief Hook helper bound to a single key; returns get/set that share the key.
 * @param storage Backing adapter (typically from createStorage).
 * @param key Key this helper is bound to.
 * @param fallback Default returned when the key is missing.
 * @returns Pair of closures reading/writing the bound key.
 * @since 0.1.1
 */
export function useStorage(
  storage: StorageAdapter,
  key: string,
  fallback: string,
): { get: () => string; set: (v: string) => void } {
  return {
    get: (): string => storage.get(key) ?? fallback,
    set: (v: string): void => {
      storage.set(key, v);
    },
  };
}
