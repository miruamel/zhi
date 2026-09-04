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

  it('does not disable WASM for event-only chunks (no data:)', async () => {
    // Event-only chunks (heartbeat, comment, id:) legitimately
    // return [] from a working parser. The write-barrier guard
    // must not fire on them — only chunks containing data: events
    // can trigger a false-positive disable.
    const result = await parseStream('event: heartbeat\n\n');
    expect(Array.isArray(result)).toBe(true);
    expect(isWasmAvailable()).toBe(true);
    resetWasm();
  });

  it('does not disable WASM for comment-only chunks', async () => {
    const result = await parseStream(':keepalive\n\n');
    expect(Array.isArray(result)).toBe(true);
    expect(isWasmAvailable()).toBe(true);
    resetWasm();
  });
});
