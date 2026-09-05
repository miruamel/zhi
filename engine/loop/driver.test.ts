import { describe, it, expect } from 'bun:test';
import { LoopDriver } from './driver';
import { LoopState, LoopEvent } from './states';

describe('LoopDriver', () => {
  it('starts at INTAKE', () => {
    expect(new LoopDriver().current).toBe(LoopState.INTAKE);
  });

  it('send() transitions on valid event and fires callback', () => {
    const seen: string[] = [];
    const d = new LoopDriver({ onTransition: (f, e, t) => seen.push(`${f}:${e}:${t}`) });
    expect(d.send(LoopEvent.GOAL_READY)).toBe(true);
    expect(d.current).toBe(LoopState.PLAN);
    expect(seen).toEqual(['INTAKE:GOAL_READY:PLAN']);
  });

  it('send() rejects illegal transition', () => {
    const d = new LoopDriver();
    expect(d.send(LoopEvent.COMMITTED)).toBe(false);
    expect(d.current).toBe(LoopState.INTAKE);
  });

  it('finished true at DONE', () => {
    const d = new LoopDriver({ start: LoopState.DONE });
    expect(d.finished).toBe(true);
  });

  it('run() drives full happy path to DONE', async () => {
    const d = new LoopDriver();
    await d.run({
      [LoopState.INTAKE]: () => LoopEvent.GOAL_READY,
      [LoopState.PLAN]: () => LoopEvent.PLAN_OK,
      [LoopState.ISOLATE]: () => LoopEvent.ISOLATED,
      [LoopState.EXECUTE]: () => LoopEvent.EXECUTED,
      [LoopState.CRITIQUE]: () => LoopEvent.CRITIQUED,
      [LoopState.EVALUATE]: () => LoopEvent.GATE_PASS,
      [LoopState.COMMIT]: () => LoopEvent.COMMITTED,
      [LoopState.PR_OPEN]: () => LoopEvent.PR_OPENED,
      [LoopState.CI_WATCH]: () => LoopEvent.CI_GREEN,
    });
    expect(d.finished).toBe(true);
    expect(d.current).toBe(LoopState.DONE);
  });

  it('run() throws on missing handler', async () => {
    const d = new LoopDriver();
    await expect(d.run({})).rejects.toThrow(/no handler/);
  });

  it('run() throws on illegal transition from handler', async () => {
    const d = new LoopDriver();
    await expect(d.run({ [LoopState.INTAKE]: () => LoopEvent.COMMITTED })).rejects.toThrow(
      /illegal/,
    );
  });
  it('run() throws on step timeout', async () => {
    const d = new LoopDriver();
    await expect(
      d.run(
        {
          [LoopState.INTAKE]: () =>
            new Promise<LoopEvent>(() => {
              /* never resolves */
            }),
        },
        64,
        50,
      ),
    ).rejects.toThrow(/step timeout/);
  });

  it('run() with stepTimeoutMs=0 disables timeout (rejects advance to budget)', async () => {
    const d = new LoopDriver();
    const seq: Partial<Record<LoopState, LoopEvent>> = {
      [LoopState.INTAKE]: LoopEvent.GOAL_READY,
      [LoopState.PLAN]: LoopEvent.PLAN_OK,
      [LoopState.ISOLATE]: LoopEvent.ISOLATED,
    };
    await expect(
      d.run(
        {
          [LoopState.INTAKE]: () =>
            new Promise<LoopEvent>((resolve) =>
              queueMicrotask(() => resolve(seq[LoopState.INTAKE]!)),
            ),
          [LoopState.PLAN]: () =>
            new Promise<LoopEvent>((resolve) =>
              queueMicrotask(() => resolve(seq[LoopState.PLAN]!)),
            ),
          [LoopState.ISOLATE]: () =>
            new Promise<LoopEvent>((resolve) =>
              queueMicrotask(() => resolve(seq[LoopState.ISOLATE]!)),
            ),
        },
        2,
        0,
      ),
    ).rejects.toThrow(/budget exceeded/);
  });
});
