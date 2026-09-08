/**
 * @fileoverview App input handler — key bindings, useInput wiring, and command palette.
 * @since 0.1.2
 * @updated 0.2.6 — extracted from app.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import { useInput } from 'ink';
import { resolveKey } from '../handlers/keymap';
import { applyKeyAction } from '../handlers/keyhandler';
import { AppState } from '../state';
import type { AppControllerResult } from './app-controller';
import type { CommandItem } from '../../widgets/command-palette';
import { CommandPalette } from '../../widgets/command-palette';

export interface AppProviderProps {
  controller: AppControllerResult;
  commands: CommandItem[];
  onAbort?: () => void;
  onQuit?: () => void;
  onRegister?: (push: (p: Partial<AppState>) => void) => void;
  children: React.ReactNode;
}

/**
 * @brief Wire useInput + render children with command palette overlay.
 * @param controller controller result from useAppController
 * @param commands command palette items
 * @param onAbort abort callback
 * @param onQuit quit callback
 * @param onRegister state push registration
 * @param children render tree
 * @since 0.1.2
 */
export function AppProvider({
  controller,
  commands,
  onAbort,
  onQuit,
  onRegister,
  children,
}: AppProviderProps): React.ReactNode {
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
      if (paletteOpenRef.current) return;
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

  return (
    <>
      {children}
      <CommandPalette
        open={paletteOpen}
        commands={commands}
        onClose={() => {
          setPaletteOpen(false);
          setMode('normal');
        }}
        onExecute={(cmd) => cmd.action()}
      />
    </>
  );
}
