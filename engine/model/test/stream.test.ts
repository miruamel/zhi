import { describe, it, expect } from 'bun:test';
import { parseStream } from '../stream';

describe('native stream (wasm)', () => {
  it('extracts data payloads from SSE', async () => {
    const out = await parseStream('event: token\ndata: hello\n\ndata: world\n\n');
    expect(out).toEqual(['hello', 'world']);
  });
  it('strips leading space after data:', async () => {
    expect(await parseStream('data:  x\n\n')).toEqual(['x']);
  });
  it('ignores non-data lines', async () => {
    expect(await parseStream('event: ping\nid: 1\n\n')).toEqual([]);
  });
  it('handles multiple data lines in one event', async () => {
    const out = await parseStream('data: a\ndata: b\n\n');
    expect(out).toEqual(['a', 'b']);
  });
});
