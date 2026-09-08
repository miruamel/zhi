/**
 * @fileoverview App root — the main ink <App> for Zhi TUI. @since 0.1.2
 * @updated 0.2.6 — integrated Arranger, StatusBar, CommandPalette, useFocus
 * @updated 0.2.6 — OrchPane, BudgetPane, LoopPane
 * @updated 0.2.6 — refactored: controller/commands/provider/render split (Phase 1)
 */
import { AppState } from './core/state';
import { useAppController } from './core/app-controller';
import { buildCommands } from './core/app-commands';
import { AppProvider } from './core/app-provider';
import { AppRender } from './core/app-render';

/** @brief Props for ZhiApp root component. @since 0.1.2 */
export interface AppProps {
  initialState: AppState;
  threshold: number;
  onAbort?: () => void;
  onQuit?: () => void;
  /** @brief Dipanggil sekali setelah mount: beri tahu loop ts push patch ke setState. */
  onRegister?: (push: (p: Partial<AppState>) => void) => void;
}

/**
 * @brief Root ink component — wires controller + provider + render.
 * @since 0.1.2
 */
export function ZhiApp({
  initialState,
  threshold,
  onAbort,
  onQuit,
  onRegister,
}: AppProps): React.ReactNode {
  const controller = useAppController(initialState, onAbort, onQuit, onRegister);
  const commands = buildCommands({
    exit: controller.exit,
    setPaused: controller.setPaused,
    setDetailExpanded: controller.setDetailExpanded,
    setLogExpanded: controller.setLogExpanded,
    setCriticsExpanded: controller.setCriticsExpanded,
    setPrExpanded: controller.setPrExpanded,
    setRedrawKey: controller.setRedrawKey,
    onAbort,
    nav: controller.nav,
    arranger: controller.arranger,
  });

  return (
    <AppProvider
      controller={controller}
      commands={commands}
      onAbort={onAbort}
      onQuit={onQuit}
      onRegister={onRegister}
    >
      <AppRender controller={controller} threshold={threshold} />
    </AppProvider>
  );
}
