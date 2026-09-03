/**
 * @brief Unit: parseStream — write-barrier detection (lines 22-27) + catch fallback (lines 29-31).
 * WASM write barrier is broken in proot env (parseSseWasm returns []), so we test the
 * dispatcher's fallback logic directly: empty output with non-empty input → disableWasm + parseSseTs.
 * @since 0.6.0
 */
import { describe, expect, it, beforeEach } from 'bun:test';
import { parseStream, isWasmAvailable } from '../index';
import { resetWasm } from '../zigBridge';

describe('parseStream write-barrier detection', () => {
  beforeEach(() => {
    resetWasm();
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

  it('falls back to TS parser when WASM is already disabled', async () => {
    const { disableWasm } = await import('../zigBridge');
    disableWasm();
    const result = await parseStream('data: world\n\n');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
