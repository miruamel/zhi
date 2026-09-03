/**
 * @brief Tests for storage adapters and useStorage helper.
 * @since 0.1.1
 */

import { describe, expect, test, beforeEach, afterEach, vi } from "bun:test";
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  createStorage,
  FileStorageAdapter,
  MemoryStorageAdapter,
  useStorage,
  type StorageAdapter,
} from "./storage";

let dir = "";
let file = "";

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "zhi-storage-"));
  file = join(dir, "store.json");
});

afterEach(() => {
  vi.useRealTimers();
  if (dir) rmSync(dir, { recursive: true, force: true });
});

function flush(): Promise<void> {
  // Run pending debounce timers and let microtasks resolve.
  return new Promise<void>((resolve) => setImmediate(resolve));
}

describe("MemoryStorageAdapter", () => {
  test("get returns null when key is absent", () => {
    const s = new MemoryStorageAdapter();
    expect(s.get("nope")).toBeNull();
  });

  test("set then get roundtrips", () => {
    const s = new MemoryStorageAdapter();
    s.set("k", "v");
    expect(s.get("k")).toBe("v");
  });

  test("remove deletes a present key", () => {
    const s = new MemoryStorageAdapter();
    s.set("k", "v");
    s.remove("k");
    expect(s.get("k")).toBeNull();
  });

  test("remove on absent key is a no-op", () => {
    const s = new MemoryStorageAdapter();
    expect(() => s.remove("missing")).not.toThrow();
  });

  test("clear removes every key", () => {
    const s = new MemoryStorageAdapter();
    s.set("a", "1");
    s.set("b", "2");
    s.clear();
    expect(s.keys()).toEqual([]);
  });

  test("keys returns insertion order", () => {
    const s = new MemoryStorageAdapter();
    s.set("b", "2");
    s.set("a", "1");
    s.set("c", "3");
    expect(s.keys()).toEqual(["b", "a", "c"]);
  });
});

describe("FileStorageAdapter", () => {
  test("creates the file lazily on first write", async () => {
    vi.useFakeTimers();
    const a = new FileStorageAdapter(file);
    expect(existsSync(file)).toBe(false);
    a.set("k", "v");
    vi.advanceTimersByTime(100);
    await flush();
    expect(existsSync(file)).toBe(true);
  });

  test("get on missing file returns null", () => {
    const a = new FileStorageAdapter(file);
    expect(a.get("k")).toBeNull();
  });

  test("persists across instances", async () => {
    vi.useFakeTimers();
    const a = new FileStorageAdapter(file);
    a.set("hello", "world");
    a.set("count", "42");
    vi.advanceTimersByTime(100);
    await flush();
    const b = new FileStorageAdapter(file);
    expect(b.get("hello")).toBe("world");
    expect(b.get("count")).toBe("42");
    expect(b.keys().sort()).toEqual(["count", "hello"]);
  });

  test("remove deletes a key on disk after flush", async () => {
    vi.useFakeTimers();
    const a = new FileStorageAdapter(file);
    a.set("k", "v");
    a.remove("k");
    vi.advanceTimersByTime(100);
    await flush();
    const b = new FileStorageAdapter(file);
    expect(b.get("k")).toBeNull();
  });

  test("clear empties the file", async () => {
    vi.useFakeTimers();
    const a = new FileStorageAdapter(file);
    a.set("a", "1");
    a.set("b", "2");
    a.clear();
    vi.advanceTimersByTime(100);
    await flush();
    const raw = readFileSync(file, "utf8");
    expect(JSON.parse(raw)).toEqual({});
  });

  test("recovers from corrupt JSON by treating as empty", () => {
    writeFileSync(file, "{not valid json", "utf8");
    const a = new FileStorageAdapter(file);
    expect(a.keys()).toEqual([]);
    a.set("k", "v");
    expect(a.get("k")).toBe("v");
  });
});

describe("createStorage", () => {
  test("without path returns a memory adapter", () => {
    const s = createStorage();
    expect(s).toBeInstanceOf(MemoryStorageAdapter);
  });

  test("with path returns a file adapter", () => {
    const s = createStorage(file);
    expect(s).toBeInstanceOf(FileStorageAdapter);
  });
});

describe("useStorage", () => {
  let s: StorageAdapter;

  beforeEach(() => {
    s = new MemoryStorageAdapter();
  });

  test("get returns fallback when key missing", () => {
    const slot = useStorage(s, "k", "default");
    expect(slot.get()).toBe("default");
  });

  test("set writes through the underlying storage", () => {
    const slot = useStorage(s, "k", "default");
    slot.set("hello");
    expect(s.get("k")).toBe("hello");
  });

  test("get reflects previous set on same instance", () => {
    const slot = useStorage(s, "k", "default");
    slot.set("x");
    expect(slot.get()).toBe("x");
  });

  test("set then get on a re-bound slot reads from same key", () => {
    const a = useStorage(s, "shared", "fb");
    a.set("written");
    const b = useStorage(s, "shared", "fb");
    expect(b.get()).toBe("written");
  });
});
