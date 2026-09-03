/** @brief TUI render entry: bootstrap ink <ZhiApp> with state. @since 0.1.0 */
import { render as inkRender } from 'ink';
import { ZhiApp } from './app';
import { emptyState } from './core/state';
import type { AppState } from './core/state';

export interface RenderOptions {
  goal: string;
  tokensBudget: number;
  threshold: number;
  onAbort?: () => void;
  onQuit?: () => void;
  /** @brief Loop ts memanggil ini untuk push patch ke React state. */
  onRegister?: (push: (p: Partial<AppState>) => void) => void;
}

/** @brief Mount the TUI with the given initial state. @since 0.1.0 */
export function mountTui(opts: RenderOptions): { unmount: () => void } {
  const initial = emptyState(opts.goal, opts.tokensBudget);
  const inst = inkRender(
    <ZhiApp
      initialState={initial}
      threshold={opts.threshold}
      onAbort={opts.onAbort}
      onQuit={opts.onQuit}
      onRegister={opts.onRegister}
    />,
  );
  return { unmount: () => inst.unmount() };
}

/** @brief Render a static snapshot of state (no live loop). @since 0.1.0 */
export function renderSnapshot(state: AppState, threshold: number): { unmount: () => void } {
  const inst = inkRender(<ZhiApp initialState={state} threshold={threshold} />);
  return { unmount: () => inst.unmount() };
}
