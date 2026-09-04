/**
 * @brief Ring-buffer command history.
 *
 * @since 0.2.0
 */

const DEFAULT_MAX_SIZE = 200;

/** @brief A single history entry. */
export interface HistoryEntry {
  /** Stable unique identifier. */
  id: string;
  /** Wall-clock timestamp (ms since epoch). */
  ts: number;
  /** The command that was executed. */
  command: string;
  /** Optional result/observation recorded alongside the command. */
  result?: string;
}

/**
 * @brief Bounded, append-only ring buffer of command entries.
 *
 * New pushes evict the oldest entry once `maxSize` is reached.
 * Entries are addressable by `id` and JSON-serializable.
 */
export class History {
  private items: HistoryEntry[];
  private readonly maxSize: number;
  private nextSeq = 0;

  /** @param maxSize Maximum entries to retain (default 200). */
  constructor(maxSize: number = DEFAULT_MAX_SIZE) {
    this.items = [];
    this.maxSize = Math.max(1, Math.floor(maxSize));
  }

  /**
   * @brief Append a new command.
   * @param command Command text.
   * @param result Optional result/observation.
   * @return The created entry.
   */
  push(command: string, result?: string): HistoryEntry {
    const seq = this.nextSeq++;
    const entry: HistoryEntry = {
      id: `${Date.now().toString(36)}-${seq.toString(36)}`,
      ts: Date.now(),
      command,
      result,
    };
    this.items.push(entry);
    if (this.items.length > this.maxSize) {
      this.items.splice(0, this.items.length - this.maxSize);
    }
    return entry;
  }

  /**
   * @brief Return the latest `n` entries (chronological order).
   * @param n Maximum entries; omit for all.
   */
  recent(n?: number): HistoryEntry[] {
    if (n === undefined || n >= this.items.length) {
      return [...this.items];
    }
    return this.items.slice(-n);
  }

  /**
   * @brief Find entries whose command or result contains `query` (case-insensitive).
   */
  search(query: string): HistoryEntry[] {
    const needle = query.toLowerCase();
    const hits: HistoryEntry[] = [];
    for (const e of this.items) {
      if (
        e.command.toLowerCase().includes(needle) ||
        (e.result !== undefined && e.result.toLowerCase().includes(needle))
      ) {
        hits.push(e);
      }
    }
    return hits;
  }

  /** @brief Look up an entry by id. */
  get(id: string): HistoryEntry | undefined {
    return this.items.find((e) => e.id === id);
  }

  /** @brief Remove all entries. */
  clear(): void {
    this.items = [];
  }

  /** Current entry count. */
  get size(): number {
    return this.items.length;
  }

  /** @brief Snapshot entries for persistence. */
  toJSON(): HistoryEntry[] {
    return this.items.map((e) => ({ ...e }));
  }

  /** @brief Replace contents from a previously serialized snapshot. */
  fromJSON(data: HistoryEntry[]): void {
    this.items = data.map((e) => ({ ...e }));
    if (this.items.length > this.maxSize) {
      this.items.splice(0, this.items.length - this.maxSize);
    }
  }
}

/**
 * @brief Convenience factory.
 * @param maxSize Maximum entries to retain.
 */
export function createHistory(maxSize?: number): History {
  return new History(maxSize);
}