/**
 * @brief Pure key-action reducer for ZhiApp — extracted from useInput switch.
 * Testable without ink rendering. @since 0.1.4
 */
import type { KeyAction } from './keymap';
import type { AppState } from './state';

export interface KeyHandlerDeps {
  setState: (patch: Partial<AppState>) => void;
  setPaused: (v: boolean | ((p: boolean) => boolean)) => void;
  setShowHelp: (v: boolean | ((h: boolean) => boolean)) => void;
  setDetailExpanded: (v: boolean | ((e: boolean) => boolean)) => void;
  setLogExpanded: (v: boolean | ((e: boolean) => boolean)) => void;
  setCriticsExpanded: (v: boolean | ((e: boolean) => boolean)) => void;
  setPrExpanded: (v: boolean | ((e: boolean) => boolean)) => void;
  setLogOffset: (v: number | ((o: number) => number)) => void;
  setFocusIdx: (v: number | ((i: number) => number)) => void;
  setRedrawKey: (v: number | ((k: number) => number)) => void;
  onAbort?: () => void;
  onQuit?: () => void;
  exit: () => void;
  log: AppState['log'];
}

/**
 * @brief Apply a KeyAction to the app state. Returns true if exit() was called.
 * @param {KeyAction} action
 * @param {KeyHandlerDeps} deps
 * @return {boolean} true if exit() was called
 */
export function applyKeyAction(action: KeyAction, deps: KeyHandlerDeps): boolean {
  switch (action) {
    case 'quit':
      deps.onQuit?.();
      deps.exit();
      return true;
    case 'abort':
      deps.setState({ aborted: true, finished: true });
      deps.onAbort?.();
      deps.exit();
      return true;
    case 'pauseResume':
      deps.setPaused((p: boolean) => !p);
      break;
    case 'toggleHelp':
      deps.setShowHelp((h: boolean) => !h);
      break;
    case 'toggleDetail':
      deps.setDetailExpanded((e: boolean) => !e);
      break;
    case 'toggleLog':
      deps.setLogExpanded((e: boolean) => !e);
      break;
    case 'toggleCritics':
      deps.setCriticsExpanded((e: boolean) => !e);
      break;
    case 'togglePr':
      deps.setPrExpanded((e: boolean) => !e);
      break;
    case 'nextLog':
      deps.setLogOffset((o: number) => o + 1);
      break;
    case 'prevLog':
      deps.setLogOffset((o: number) => Math.max(0, o - 1));
      break;
    case 'logTop':
      deps.setLogOffset(0);
      break;
    case 'logBottom':
      deps.setLogOffset(Math.max(0, deps.log.length - 40));
      break;
    case 'redraw':
      deps.setRedrawKey((k: number) => k + 1);
      break;
    case 'cycle':
      deps.setFocusIdx((i: number) => (i + 1) % 6);
      break;
    default:
      break;
  }
  return false;
}
