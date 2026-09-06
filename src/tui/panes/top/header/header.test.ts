import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render';
import { Header } from './header';

describe('Header', () => {
  const baseProps = {
    loop: 'INTAKE',
    goal: 'test goal',
    startedAt: 1700000000000,
    finished: false,
    aborted: false,
  };

  it('shows RUNNING state', () => {
    const out = renderToString(Header(baseProps) as any);
    expect(out).toContain('RUNNING');
  });

  it('shows DONE state when finished', () => {
    const out = renderToString(Header({ ...baseProps, finished: true }) as any);
    expect(out).toContain('DONE');
  });

  it('shows ABORTED state when aborted', () => {
    const out = renderToString(Header({ ...baseProps, aborted: true }) as any);
    expect(out).toContain('ABORTED');
  });

  it('shows loop name', () => {
    const out = renderToString(Header({ ...baseProps, loop: 'GENERATE' }) as any);
    expect(out).toContain('GENERATE');
  });

  it('shows goal text', () => {
    const out = renderToString(Header(baseProps) as any);
    expect(out).toContain('test goal');
  });

  it('shows elapsed time', () => {
    const out = renderToString(Header(baseProps) as any);
    expect(out).toContain('elapsed');
  });
});
