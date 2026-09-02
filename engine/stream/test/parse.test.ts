/**
 * @brief Unit: parser TS murni (parseSseTs) + dispatcher (parseStream). @since 0.1.1
 */
import { describe, expect, it } from 'bun:test';
import { parseSseTs } from '../parseSseTs';
import { parseStream, isWasmAvailable } from '../index';

describe('parseSseTs (TS fallback)', () => {
  it('extracts data payloads from SSE', async () => {
    const out = await parseSseTs('event: token\ndata: hello\n\ndata: world\n\n');
    expect(out).toEqual(['hello', 'world']);
  });

  it('strips leading space after data:', async () => {
    expect(await parseSseTs('data:  x\n\n')).toEqual(['x']);
  });

  it('ignores non-data lines', async () => {
    expect(await parseSseTs('event: ping\nid: 1\n\n')).toEqual([]);
  });

  it('handles multiple data lines in one event', async () => {
    expect(await parseSseTs('data: a\ndata: b\ndata: c\n\n')).toEqual(['a', 'b', 'c']);
  });
});

describe('parseStream dispatcher', () => {
  it('falls back to TS when WASM write barrier fails', async () => {
    // Dispatcher auto-detects zero-byte WASM output and disables WASM.
    const out = await parseStream('data: hello\n\n');
    expect(out).toEqual(['hello']);
  });

  it('exposes isWasmAvailable', () => {
    expect(typeof isWasmAvailable()).toBe('boolean');
  });
});
