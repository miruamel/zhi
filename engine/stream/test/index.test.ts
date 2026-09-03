/**
 * @brief Unit: parseStream — dispatcher fallback logic (WASM disabled + catch).
 * WASM write barrier is broken in proot env (parseSseWasm returns []), so we test
 * the dispatcher's fallback logic deterministically by disabling WASM rather
 * than relying on env-specific breakage. @since 0.6.0
 */
import { describe, expect, it, beforeEach } from 'bun:test';
import { parseStream, isWasmAvailable } from '../index';
import { disableWasm, resetWasm } from '../zigBridge';

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
});
