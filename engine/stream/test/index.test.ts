/**
 * @brief Unit: parseStream — dispatcher fallback logic (WASM disabled + catch).
 * WASM hot path now works (build-lib + ar x extraction), so
 * write-barrier detection is tested deterministically via disableWasm()
 * rather than relying on env-specific breakage. @since 0.1.2
 */
import { describe, expect, it, beforeEach } from 'bun:test';
import { parseStream } from '../index';
import { disableWasm, isWasmAvailable, parseSseWasm, resetCache, resetWasm } from '../zigBridge';

describe('parseStream write-barrier detection', () => {
  beforeEach(() => {
    resetWasm();
    resetCache();
  });

  it('falls back to TS parser when WASM is disabled', async () => {
    // Write-barrier detection only fires when WASM genuinely breaks.
    // Test the same fallback path deterministically: WASM disabled →
    // dispatcher routes straight to parseSseTs.
    disableWasm();
    const result = await parseStream('data: hello\n\n');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    resetWasm();
  });

  it('does NOT disable WASM for event-only chunks (no data: event)', async () => {
    // Event-only chunks legitimately return [] from a working parser.
    // The dispatcher must distinguish: only disable when a chunk
    // containing data: events produces empty output.
    const result = await parseStream('event: heartbeat\n\n');
    expect(result).toEqual([]);
    // WASM should still be available — this is a valid empty result,
    // not a write-barrier symptom.
    expect(isWasmAvailable()).toBe(true);
  });
});

describe('parseSseWasm load-failure recovery', () => {
  beforeEach(() => {
    resetWasm();
    resetCache();
  });

  it('can parse after cache reset (singleton survives reset)', async () => {
    // First parse populates the singleton cache.
    const r1 = await parseSseWasm('data: hello\n\n');
    expect(r1).toEqual(['hello']);

    // Reset clears cached + loading state.
    resetCache();

    // Second parse must succeed — proves the singleton
    // doesn't get stuck after reset.
    const r2 = await parseSseWasm('data: world\n\n');
    expect(r2).toEqual(['world']);
  });

  it('isWasmAvailable stays true after reset', () => {
    expect(isWasmAvailable()).toBe(true);
  });
});
