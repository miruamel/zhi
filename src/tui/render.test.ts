/** @brief Test render entry: mountTui / renderSnapshot return unmountable handles. @since 0.1.4 */
import { describe, it, expect } from 'bun:test';
import { mountTui, renderSnapshot } from './render';
import { emptyState } from './core/state';

describe('mountTui', () => {
  it('returns an unmount handle', () => {
    const inst = mountTui({ goal: 'test', tokensBudget: 1000, threshold: 0.8 });
    expect(typeof inst.unmount).toBe('function');
    inst.unmount();
  });

  it('accepts optional callbacks without throwing', () => {
    const inst = mountTui({
      goal: 'cb',
      tokensBudget: 500,
      threshold: 0.7,
      onAbort: () => {},
      onQuit: () => {},
      onRegister: () => {},
    });
    expect(typeof inst.unmount).toBe('function');
    inst.unmount();
  });
});

describe('renderSnapshot', () => {
  it('renders from a pre-built state and returns unmount', () => {
    const state = emptyState('snap', 2000);
    const inst = renderSnapshot(state, 0.8);
    expect(typeof inst.unmount).toBe('function');
    inst.unmount();
  });

  it('renders finished + aborted state without throwing', () => {
    const state = emptyState('done', 100);
    state.finished = true;
    state.aborted = true;
    const inst = renderSnapshot(state, 0.5);
    inst.unmount();
  });
});
