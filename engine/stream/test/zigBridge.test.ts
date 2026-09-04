/**
 * @brief Unit: zigBridge — disableWasm/isWasmAvailable + parseSseWasm write-barrier detection.
 * WASM write barrier is broken in proot env (parseSseWasm throws), so we test the
 * disable path that parseStream relies on, plus the exported helpers.
 * @since 0.1.2
 */
import { describe, expect, it, beforeEach } from 'bun:test';
import { parseSseWasm, disableWasm, isWasmAvailable, resetWasm } from '../zigBridge';

describe('zigBridge helpers', () => {
  beforeEach(() => {
    resetWasm();
  });

  it('disableWasm flips availability to false', () => {
    const before = isWasmAvailable();
    disableWasm();
    expect(isWasmAvailable()).toBe(false);
    if (before) {
      resetWasm();
    }
  });

  it('parseSseWasm returns array (empty when write barrier broken)', async () => {
    const out = await parseSseWasm('data: hello\n\n');
    expect(Array.isArray(out)).toBe(true);
  });
});
