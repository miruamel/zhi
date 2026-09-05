/**
 * @brief Unit: tui/core/keyhandler — pure key-action reducer.
 * @since 0.1.4
 */
import { describe, expect, it, mock } from 'bun:test';
import { applyKeyAction } from '../handlers/keyhandler';
import type { AppState } from '../state';

function makeDeps(overrides: Partial<import('../handlers/keyhandler').KeyHandlerDeps> = {}) {
  const calls: Record<string, unknown[]> = {};
  const deps: import('../handlers/keyhandler').KeyHandlerDeps = {
    setState: (p: Partial<AppState>) => {
      calls.setState = [p];
    },
    setPaused: (v: unknown) => {
      calls.setPaused = [v];
    },
    setShowHelp: (v: unknown) => {
      calls.setShowHelp = [v];
    },
    setDetailExpanded: (v: unknown) => {
      calls.setDetailExpanded = [v];
    },
    setLogExpanded: (v: unknown) => {
      calls.setLogExpanded = [v];
    },
    setCriticsExpanded: (v: unknown) => {
      calls.setCriticsExpanded = [v];
    },
    setPrExpanded: (v: unknown) => {
      calls.setPrExpanded = [v];
    },
    setLogOffset: (v: unknown) => {
      calls.setLogOffset = [v];
    },
    setFocusIdx: (v: unknown) => {
      calls.setFocusIdx = [v];
    },
    setRedrawKey: (v: unknown) => {
      calls.setRedrawKey = [v];
    },
    exit: () => {
      calls.exit = [];
    },
    log: [],
    ...overrides,
  };
  return { deps, calls };
}

function makeLogEntry(i: number): AppState['log'][number] {
  return { ts: 0, runId: 'r', kind: 'log', msg: `m${i}` } as unknown as AppState['log'][number];
}

describe('applyKeyAction', () => {
  it('quit calls onQuit and exit', () => {
    const onQuit = mock(() => {});
    const { deps, calls } = makeDeps({ onQuit });
    const exited = applyKeyAction('quit', deps);
    expect(exited).toBe(true);
    expect(calls.exit).toBeDefined();
    expect(onQuit).toHaveBeenCalled();
  });

  it('abort sets state and calls onAbort + exit', () => {
    const onAbort = mock(() => {});
    const { deps, calls } = makeDeps({ onAbort });
    const exited = applyKeyAction('abort', deps);
    expect(exited).toBe(true);
    expect(calls.setState).toEqual([{ aborted: true, finished: true }]);
    expect(onAbort).toHaveBeenCalled();
  });

  it('pauseResume toggles paused', () => {
    const { deps, calls } = makeDeps();
    applyKeyAction('pauseResume', deps);
    expect(calls.setPaused).toBeDefined();
  });

  it('toggleHelp toggles showHelp', () => {
    const { deps, calls } = makeDeps();
    applyKeyAction('toggleHelp', deps);
    expect(calls.setShowHelp).toBeDefined();
  });

  it('toggleDetail toggles detailExpanded', () => {
    const { deps, calls } = makeDeps();
    applyKeyAction('toggleDetail', deps);
    expect(calls.setDetailExpanded).toBeDefined();
  });

  it('toggleLog toggles logExpanded', () => {
    const { deps, calls } = makeDeps();
    applyKeyAction('toggleLog', deps);
    expect(calls.setLogExpanded).toBeDefined();
  });

  it('toggleCritics toggles criticsExpanded', () => {
    const { deps, calls } = makeDeps();
    applyKeyAction('toggleCritics', deps);
    expect(calls.setCriticsExpanded).toBeDefined();
  });

  it('togglePr toggles prExpanded', () => {
    const { deps, calls } = makeDeps();
    applyKeyAction('togglePr', deps);
    expect(calls.setPrExpanded).toBeDefined();
  });

  it('nextLog increments offset', () => {
    const { deps, calls } = makeDeps();
    applyKeyAction('nextLog', deps);
    expect(calls.setLogOffset).toBeDefined();
  });

  it('prevLog decrements offset (clamped at 0)', () => {
    const { deps, calls } = makeDeps();
    applyKeyAction('prevLog', deps);
    expect(calls.setLogOffset).toBeDefined();
  });

  it('logTop sets offset to 0', () => {
    const { deps, calls } = makeDeps();
    applyKeyAction('logTop', deps);
    expect(calls.setLogOffset).toEqual([0]);
  });

  it('logBottom sets offset to max(0, log.length - 40)', () => {
    const { deps, calls } = makeDeps({
      log: Array.from({ length: 100 }, (_, i) => makeLogEntry(i)),
    });
    applyKeyAction('logBottom', deps);
    expect(calls.setLogOffset).toEqual([60]);
  });

  it('logBottom with short log clamps to 0', () => {
    const { deps, calls } = makeDeps({
      log: Array.from({ length: 10 }, (_, i) => makeLogEntry(i)),
    });
    applyKeyAction('logBottom', deps);
    expect(calls.setLogOffset).toEqual([0]);
  });

  it('redraw increments redrawKey', () => {
    const { deps, calls } = makeDeps();
    applyKeyAction('redraw', deps);
    expect(calls.setRedrawKey).toBeDefined();
  });

  it('cycle increments focusIdx mod 6', () => {
    const { deps, calls } = makeDeps();
    applyKeyAction('cycle', deps);
    expect(calls.setFocusIdx).toBeDefined();
  });

  it('unknown action is a no-op', () => {
    const { deps, calls } = makeDeps();
    const exited = applyKeyAction('unknown', deps);
    expect(exited).toBe(false);
    expect(calls.exit).toBeUndefined();
  });

  it('quit without onQuit still exits', () => {
    const { deps, calls } = makeDeps();
    const exited = applyKeyAction('quit', deps);
    expect(exited).toBe(true);
    expect(calls.exit).toBeDefined();
  });
});
