/** @brief Render tests for widgets + panes (ink render-to-string). @since 0.1.1 */
import { describe, it, expect } from 'bun:test';
import { render } from 'ink';
import React from 'react';
import { ProgressBar } from './widgets/indicators/progress';
import { StatCard } from './widgets/badges/stat';
import { Stages } from './panes/middle/stages';
import { Knowledge } from './panes/bottom/knowledge';
import { CodeViewer } from './panes/bottom/code';
import { Config } from './panes/bottom/config';
import { emptyState } from './core/state';

/** @brief Render an ink element to a string using a synchronous writable stdout.
 * @param {React.ReactElement} el - component to render.
 * @return {string} captured stdout text.
 * @note debug:true bypasses ink's render throttle so onRender fires immediately. */
function wrap(el: React.ReactElement): string {
  const chunks: string[] = [];
  const stdout = {
    write: (s: string) => { chunks.push(s); return true; },
    columns: 80,
    rows: 24,
    on: () => {},
    off: () => {},
  };
  const inst = render(el, { stdout: stdout as any, debug: true });
  inst.unmount();
  return chunks.join('');
}

describe('widgets', () => {
  it('ProgressBar renders label and percent', () => {
    const out = wrap(<ProgressBar label="done" value={42} max={100} width={10} />);
    expect(out).toContain('done');
    expect(out).toContain('42%');
  });

  it('ProgressBar clamps negative to 0', () => {
    const out = wrap(<ProgressBar label="x" value={-5} max={100} width={10} />);
    expect(out).toContain('0%');
  });

  it('ProgressBar clamps over max to 100', () => {
    const out = wrap(<ProgressBar label="x" value={200} max={100} width={10} />);
    expect(out).toContain('100%');
  });

  it('StatCard renders label value and trend', () => {
    const out = wrap(<StatCard label="tokens" value="1,234" trend="up" />);
    expect(out).toContain('tokens');
    expect(out).toContain('1,234');
    expect(out).toContain('↑');
  });
});

describe('panes', () => {
  it('Stages renders empty state', () => {
    const s = emptyState('test', 1000);
    const out = wrap(<Stages state={s} />);
    expect(out).toContain('STAGES');
    expect(out).toContain('no stages yet');
  });

  it('Stages renders with records', () => {
    const s = emptyState('test', 1000);
    s.stageRecords = [{ stage: 'build', ms: 120, ok: true }];
    const out = wrap(<Stages state={s} />);
    expect(out).toContain('build');
    expect(out).toContain('STAGES (1)');
  });

  it('Stages shows error on failed stage', () => {
    const s = emptyState('test', 1000);
    s.stageRecords = [{ stage: 'test', ms: 50, ok: false, error: 'boom' }];
    const out = wrap(<Stages state={s} />);
    expect(out).toContain('boom');
  });

  it('Knowledge renders empty', () => {
    const s = emptyState('test', 1000);
    const out = wrap(<Knowledge state={s} />);
    expect(out).toContain('KNOWLEDGE');
    expect(out).toContain('no facts yet');
  });

  it('Knowledge renders with facts', () => {
    const s = emptyState('test', 1000);
    s.facts = [{ key: 'theme', value: 'dark', tags: ['ui'] }];
    const out = wrap(<Knowledge state={s} />);
    expect(out).toContain('theme');
    expect(out).toContain('dark');
    expect(out).toContain('ui');
  });

  it('Knowledge limits to maxLines', () => {
    const s = emptyState('test', 1000);
    s.facts = [
      { key: 'a', value: '1', tags: [] },
      { key: 'b', value: '2', tags: [] },
      { key: 'c', value: '3', tags: [] },
    ];
    const out = wrap(<Knowledge state={s} maxLines={2} />);
    expect(out).toContain('a');
    expect(out).not.toContain('c');
  });

  it('CodeViewer renders empty', () => {
    const s = emptyState('test', 1000);
    const out = wrap(<CodeViewer state={s} />);
    expect(out).toContain('CODE');
    expect(out).toContain('no code generated yet');
  });

  it('CodeViewer renders with code', () => {
    const s = emptyState('test', 1000);
    s.code = 'console.log("hi")';
    const out = wrap(<CodeViewer state={s} />);
    expect(out).toContain('console.log');
  });

  it('CodeViewer limits to maxLines', () => {
    const s = emptyState('test', 1000);
    s.code = 'line1\nline2\nline3';
    const out = wrap(<CodeViewer state={s} maxLines={2} />);
    expect(out).toContain('line1');
    expect(out).not.toContain('line3');
  });

  it('Config renders with config', () => {
    const s = emptyState('test', 1000);
    s.config = { threshold: 0.8, tokensBudget: 5000, offline: false };
    const out = wrap(<Config state={s} />);
    expect(out).toContain('CONFIG');
    expect(out).toContain('0.8');
    expect(out).toContain('5000');
    expect(out).toContain('no');
  });
});