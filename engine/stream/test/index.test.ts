/**
 * @brief Unit: parseStream — write-barrier detection (lines 22-27) + catch fallback (lines 29-31).
 * WASM write barrier is broken in proot env (parseSseWasm returns []), so we test the
 * dispatcher's fallback logic: empty output with non-empty input → disableWasm + parseSseTs,
 * and the catch path → disableWasm + parseSseTs.
 * @since 0.6.0
 */
import { describe, expect, it, beforeEach } from 'bun:test';
import { parseStream, isWasmAvailable } from '../index';
import { disableWasm } from '../zigBridge';

describe('parseStream write-barrier detection', () => {
  beforeEach(() => {
    // reset wasm availability before each test
    (globalThis as Record<string, unknown>).__zigWasmReset = true;
  });

  it('falls back to TS parser when WASM returns empty for non-empty chunk', async () => {
    // WASM write barrier is broken in this env → parseSseWasm returns []
    const chunk = 'data: hello\n\n';
    const result = await parseStream(chunk);
    expect(Array.isArray(result)).toBe(true);
    // TS parser should have produced at least one payload
    expect(result.length).toBeGreaterThan(0);
    // WASM should now be disabled
    expect(isWasmAvailable()).toBe(false);
  });
  it('returns WASM result directly when parseSseWasm succeeds with non-empty output', async () => {
    const { mock } = await import('bun:test');
    mock.module('../zigBridge', () => ({
      disableWasm: () => {},
      isWasmAvailable: () => true,
      parseSseWasm: async () => ['data: from-wasm'],
    }));
    const { parseStream: mockedParseStream } = await import('../index');
    const result = await mockedParseStream('data: hello\n\n');
    expect(result).toEqual(['data: from-wasm']);
  });

  it('falls back to TS parser when parseSseWasm throws', async () => {
    // Mock zigBridge so parseSseWasm throws — exercises the catch block (lines 29-31)
    const { mock } = await import('bun:test');
    mock.module('../zigBridge', () => ({
      disableWasm: () => {},
      isWasmAvailable: () => true,
      parseSseWasm: async () => { throw new Error('wasm parse failure'); },
    }));
    // Re-import parseStream after mock is in place
    const { parseStream: mockedParseStream } = await import('../index');
    const result = await mockedParseStream('data: hello\n\n');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});