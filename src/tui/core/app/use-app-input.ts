/**
 * @fileoverview App input hook — useInput wiring extracted from AppProvider.
 * @since 0.1.12
 * @package zhi
 */
import { useInput } from 'ink';
import { useRef } from 'react';
import { resolveKey } from '../handlers/keymap';
import { applyKeyAction } from '../handlers/keyhandler';
import type { AppState } from '../state';
import type { AppControllerResult } from './app-controller';

export interface UseAppInputOptions {
  controller: AppControllerResult;
  onAbort?: () => void;
  onQuit?: () => void;
  onRegister?: (push: (p: Partial<AppState>) => void) => void;
}

/**
 * @brief Wire useInput key bindings for the app shell.
 * @param controller controller result from useAppController
 * @param onAbort abort callback
 * @param onQuit quit callback
 * @param onRegister state push registration
 * @since 0.1.12
 */
export function useAppInput({ controller, onAbort, onQuit, onRegister }: UseAppInputOptions): void {
  const {
    state,
    pushState,
    paletteOpen,
    setPaletteOpen,
    setMode,
    setPaused,
    setShowHelp,
    setDetailExpanded,
    setLogExpanded,
    setCriticsExpanded,
    setPrExpanded,
    setLogOffset,
    setFocusIdx,
    setRedrawKey,
    nav,
    arranger,
    exit,
  } = controller;
  const paletteOpenRef = useRef(paletteOpen);
  paletteOpenRef.current = paletteOpen;

  onRegister?.((p: Partial<AppState>) => pushState(p));

  useInput(
    (
      input: string,
      key: { ctrl?: boolean; meta?: boolean; shift?: boolean; return?: boolean; escape?: boolean },
    ) => {
      if (paletteOpenRef.current) {
        if (key.escape) {
          setPaletteOpen(false);
          setMode('normal');
        }
        return;
      }
      const action = resolveKey(input, key);
      switch (action) {
        case 'quit':
          onQuit?.();
          exit();
          break;
        case 'openPalette':
          setPaletteOpen(true);
          setMode('command');
          break;
        case 'closePalette':
          setPaletteOpen(false);
          setMode('normal');
          break;
        case 'pauseResume':
          setPaused((p) => !p);
          break;
        case 'abort':
          onAbort?.();
          break;
        case 'nextPane':
          nav.move(1);
          break;
        case 'prevPane':
          nav.move(-1);
          break;
        case 'searchMode':
          setMode('search');
          break;
        case 'jumpMode':
          setMode('command');
          break;
        case 'splitH':
          arranger.dispatch({ type: 'split', id: nav.current, direction: 'horizontal' });
          break;
        case 'splitV':
          arranger.dispatch({ type: 'split', id: nav.current, direction: 'vertical' });
          break;
        case 'closePane':
          arranger.dispatch({ type: 'close', id: nav.current });
          break;
        case 'collapsePane':
          arranger.dispatch({ type: 'collapse', id: nav.current });
          break;
        case 'expandPane':
          arranger.dispatch({ type: 'expand', id: nav.current });
          break;
        default:
          applyKeyAction(action, {
            setState: pushState,
            setPaused,
            setShowHelp,
            setDetailExpanded,
            setLogExpanded,
            setCriticsExpanded,
            setPrExpanded,
            setLogOffset,
            setFocusIdx,
            setRedrawKey,
            onAbort,
            onQuit,
            exit,
            log: state.log,
          });
      }
    },
  );
}
