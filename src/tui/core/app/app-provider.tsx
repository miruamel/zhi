/**
 * @fileoverview App provider — wires useInput via useAppInput, renders children + palette.
 * @since 0.1.2
 * @updated 0.1.12 — input logic extracted to use-app-input.ts to satisfy SLOC guard
 * @package zhi
 */
import type { AppControllerResult } from './app-controller';
import { AppState } from '../state';
import type { CommandItem } from '../../widgets/command-palette';
import { CommandPalette } from '../../widgets/command-palette';
import { useAppInput } from './use-app-input';

export interface AppProviderProps {
  controller: AppControllerResult;
  commands: CommandItem[];
  onAbort?: () => void;
  onQuit?: () => void;
  onRegister?: (push: (p: Partial<AppState>) => void) => void;
  children: React.ReactNode;
}

/**
 * @brief Render children with command palette overlay and wire input.
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
  useAppInput({ controller, onAbort, onQuit, onRegister });
  const { paletteOpen, setPaletteOpen, setMode } = controller;

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
