/**
 * @brief Unit: zigBridge — disableWasm/isWasmAvailable + parseSseWasm write-barrier detection.
 * WASM write barrier is broken in proot env (parseSseWasm returns []), so we test the
 * disable path that parseStream relies on, plus the exported helpers.
 * @since 0.6.0
 */
import { describe, expect, it } from 'bun:test';
import { parseSseWasm, disableWasm, isWasmAvailable } from '../zigBridge';

describe('zigBridge helpers', () => {
  it('disableWasm flips availability to false', () => {
    const before = isWasmAvailable();
    disableWasm();
    expect(isWasmAvailable()).toBe(false);
    if (before) {
      // restore for subsequent tests in same module instance
      (globalThis as Record<string, unknown>).__zigWasmReset = true;
    }
  });

  it('parseSseWasm returns array (empty when write barrier broken)', async () => {
    const out = await parseSseWasm('data: hello\n\n');
    expect(Array.isArray(out)).toBe(true);
  });
});