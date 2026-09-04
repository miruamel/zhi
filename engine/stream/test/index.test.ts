/**
 * @brief Unit: parseStream — dispatcher fallback logic (WASM disabled + catch).
 * WASM write barrier is broken in proot env (parseSseWasm returns []), so we test
 * the dispatcher's fallback logic deterministically by disabling WASM rather
 * than relying on env-specific breakage. @since 0.6.0
 */
import { describe, expect, it, beforeEach } from 'bun:test';
import { parseStream } from '../index';
import { disableWasm, isWasmAvailable, resetWasm } from '../zigBridge';

describe('parseStream write-barrier detection', () => {
  beforeEach(() => {
    resetWasm();
  });

  it('falls back to TS parser when WASM is disabled', async () => {
    // Write-barrier detection (lines 22-27) only fires when WASM
    // genuinely breaks — untestable deterministically without
    // mocking in a native CI env where WASM works. This test
    // covers the same fallback path deterministically: WASM
    // disabled → dispatcher routes straight to parseSseTs.
    disableWasm();
    const result = await parseStream('data: hello\n\n');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    resetWasm();
  });

  it('does NOT disable WASM for event-only chunks (no data: event)', async () => {
    // WASM write barrier makes parseSseWasm return [] for all chunks in
    // this env, but event-only chunks legitimately return [] from a
    // working parser. The dispatcher must distinguish: only disable
    // when a chunk containing data: events produces empty output.
    const result = await parseStream('event: heartbeat\n\n');
    expect(result).toEqual([]);
    // WASM should still be available — this is a valid empty result,
    // not a write-barrier symptom.
    expect(isWasmAvailable()).toBe(true);
  });

  it('disables WASM when data: chunk produces empty output (write barrier)', async () => {
    // In this env parseSseWasm returns [] for data: chunks too —
    // that IS the write barrier. Dispatcher must detect and fallback.
    const result = await parseStream('data: hello\n\n');
    expect(result.length).toBeGreaterThan(0);
    expect(isWasmAvailable()).toBe(false);
  });
});
