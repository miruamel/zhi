/** @brief Tests for Files pane. @since 0.1.1 */
import { describe, it, expect, mock } from 'bun:test';
import { render } from 'ink';
import React from 'react';
// removed: WriteStream from node:fs (ink uses NodeJS.WriteStream)
import { Files, formatSize, type FileEntry } from './files';

/** @brief Minimal stdout shape ink requires. */
interface CaptureStdout {
  write: (s: string) => boolean;
  columns: number;
  rows: number;
  on: (..._args: unknown[]) => void;
  off: (..._args: unknown[]) => void;
}

/** @brief Render ink element to string via a synchronous writable stdout. */
function wrap(el: React.ReactElement): string {
  const chunks: string[] = [];
  const stdout: CaptureStdout = {
    write: (s) => { chunks.push(s); return true; },
    columns: 80,
    rows: 24,
    on: () => {},
    off: () => {},
  };
  const inst = render(el, { stdout: stdout as unknown as NodeJS.WriteStream, debug: true });
  inst.unmount();
  return chunks.join('');
}

const SAMPLE: FileEntry[] = [
  { path: 'src/index.ts', size: 1234, lang: 'ts', status: 'modified' },
  { path: 'src/app.tsx', size: 0, lang: 'tsx', status: 'added' },
  { path: 'package.json', size: 2_500_000, lang: 'json' },
  { path: 'README.md', size: 512, lang: 'md' },
  { path: 'main.py', size: 999_999, lang: 'py', status: 'deleted' },
];

describe('Files pane', () => {
  it('renders every file path', () => {
    const out = wrap(React.createElement(Files, { files: SAMPLE }));
    for (const f of SAMPLE) expect(out).toContain(f.path);
  });

  it('uses default title with file count', () => {
    const out = wrap(React.createElement(Files, { files: SAMPLE }));
    expect(out).toContain(`FILES (${SAMPLE.length})`);
  });

  it('honors custom title prop', () => {
    const out = wrap(React.createElement(Files, { files: SAMPLE, title: 'CHANGED' }));
    expect(out).toContain('CHANGED');
  });

  it('truncates to maxLines', () => {
    const out = wrap(React.createElement(Files, { files: SAMPLE, maxLines: 2 }));
    expect(out).toContain(SAMPLE[0]!.path);
    expect(out).toContain(SAMPLE[1]!.path);
    expect(out).not.toContain(SAMPLE[2]!.path);
  });

  it('renders language badge token for each entry', () => {
    const out = wrap(React.createElement(Files, { files: SAMPLE }));
    expect(out).toContain('[ts]');
    expect(out).toContain('[tsx]');
    expect(out).toContain('[json]');
    expect(out).toContain('[md]');
    expect(out).toContain('[py]');
  });

  it('shows fallback bracket for unknown lang', () => {
    const out = wrap(React.createElement(Files, { files: [{ path: 'x.rs', size: 1, lang: 'rs' }] }));
    expect(out).toContain('[rs]');
  });

  it('renders empty state when no files', () => {
    const out = wrap(React.createElement(Files, { files: [] }));
    expect(out).toContain('no files');
  });

  it('exposes onFileClick prop without calling during render', () => {
    const calls: string[] = [];
    wrap(React.createElement(Files, { files: SAMPLE, onFileClick: (p) => calls.push(p) }));
    expect(calls).toEqual([]);
  });

  it('accepts different onFileClick instances (no render crash)', () => {
    const a = mock(() => {});
    const b = mock(() => {});
    expect(() =>
      wrap(
        <>
          <Files files={SAMPLE} onFileClick={a} />
          <Files files={SAMPLE} onFileClick={b} />
        </>,
      ),
    ).not.toThrow();
  });

  it('renders without throwing when status omitted', () => {
    expect(() =>
      wrap(React.createElement(Files, { files: [{ path: 'x.txt', size: 10, lang: 'txt' }] })),
    ).not.toThrow();
  });
});

describe('formatSize', () => {
  it('formats sub-KB as bytes', () => {
    expect(formatSize(0)).toBe('0 B');
    expect(formatSize(512)).toBe('512 B');
    expect(formatSize(1023)).toBe('1023 B');
  });

  it('formats KB range with one decimal', () => {
    expect(formatSize(1024)).toBe('1.0 KB');
    expect(formatSize(2048)).toBe('2.0 KB');
    expect(formatSize(1234)).toBe('1.2 KB');
  });

  it('formats MB range with one decimal', () => {
    expect(formatSize(1024 * 1024)).toBe('1.0 MB');
    expect(formatSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });

  it('returns 0 B for negative or non-finite input', () => {
    expect(formatSize(-1)).toBe('0 B');
    expect(formatSize(NaN)).toBe('0 B');
    expect(formatSize(Infinity)).toBe('0 B');
  });
});