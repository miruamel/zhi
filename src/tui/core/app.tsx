/**
 * @fileoverview TUI app — main application component for the Zhi terminal interface.
 * @since 0.2.6
 * @package zhi
 */
import React, { useState, useCallback } from 'react';
import { useInput } from 'ink';
import { Box, Text } from 'ink';

/** @brief App props. @since 0.2.6 */
export interface AppProps {
  title?: string;
  version?: string;
  onExit?: () => void;
  children?: React.ReactNode;
}

/** @brief Menu item. @since 0.2.6 */
export interface MenuItem {
  id: string;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  onSelect?: () => void;
}

/** @brief App state. @since 0.2.6 */
export interface AppState {
  activeMenu: string;
  focused: boolean;
  history: string[];
  exitRequested: boolean;
}

/** @brief Default app state. @since 0.2.6 */
export const DEFAULT_APP_STATE: AppState = {
  activeMenu: 'home',
  focused: true,
  history: [],
  exitRequested: false,
};

/** @brief TUI app component. @since 0.2.6 */
export function App({ title = 'Zhi', version = '0.2.6', onExit, children }: AppProps) {
  const [state, setState] = useState<AppState>(DEFAULT_APP_STATE);
  const handleInput = useCallback(
    (_input: string, key: { escape?: boolean; ctrlC?: boolean; return?: boolean }) => {
      if (key.ctrlC || key.escape) {
        setState((prev) => ({ ...prev, exitRequested: true }));
        onExit?.();
      }
    },
    [onExit],
  );

  useInput(handleInput, { isActive: state.focused });

  return (
    <Box flexDirection="column" padding={1}>
      <Box borderStyle="round" paddingX={1}>
        <Text bold>{title}</Text>
        <Text> v{version}</Text>
      </Box>
      <Box marginY={1}>
        <Text>Active: {state.activeMenu}</Text>
      </Box>
      <Box flexDirection="column">{children}</Box>
      {state.exitRequested && (
        <Box marginY={1}>
          <Text color="yellow">Press any key to confirm exit...</Text>
        </Box>
      )}
    </Box>
  );
}

/** @brief App context. @since 0.2.6 */
export const AppContext = React.createContext<{
  state: AppState;
  pushHistory: (entry: string) => void;
  setActiveMenu: (menu: string) => void;
}>({
  state: DEFAULT_APP_STATE,
  pushHistory: () => {},
  setActiveMenu: () => {},
});

/** @brief Use app context. @since 0.2.6 */
export function useApp() {
  return React.useContext(AppContext);
}

/** @brief Create app state. @since 0.2.6 */
export function createAppState(overrides: Partial<AppState> = {}): AppState {
  return { ...DEFAULT_APP_STATE, ...overrides };
}

/** @brief Menu bar component. @since 0.2.6 */
export function MenuBar({ items, active }: { items: MenuItem[]; active: string }) {
  return (
    <Box>
      {items.map((item) => (
        <Box key={item.id} marginX={1}>
          <Text
            color={active === item.id ? 'cyan' : 'white'}
            bold={active === item.id}
            dimColor={item.disabled}
          >
            {item.shortcut && `[${item.shortcut}] `}
            {item.label}
          </Text>
        </Box>
      ))}
    </Box>
  );
}

/** @brief Status bar component. @since 0.2.6 */
export function StatusBar({ message, color = 'green' }: { message: string; color?: string }) {
  return (
    <Box borderStyle="single" paddingX={1}>
      <Text color={color as any}>{message}</Text>
    </Box>
  );
}

/** @brief Dialog component. @since 0.2.6 */
export function Dialog({
  visible,
  title,
  children,
}: {
  visible: boolean;
  title: string;
  children: React.ReactNode;
}) {
  if (!visible) return null;
  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Text bold>{title}</Text>
      {children}
      <Box marginTop={1}>
        <Text>[y] Confirm [n] Cancel</Text>
      </Box>
    </Box>
  );
}

/** @brief Tab component. @since 0.2.6 */
export function Tab({
  label,
  active,
  children,
}: {
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box flexDirection="column">
      <Text bold={active} color={active ? 'cyan' : 'gray'}>
        {active ? '► ' : '  '}
        {label}
      </Text>
      {active && <Box marginLeft={2}>{children}</Box>}
    </Box>
  );
}

/** @brief Tabs container. @since 0.2.6 */
export function Tabs({
  tabs,
  activeTab,
  children,
}: {
  tabs: string[];
  activeTab: string;
  children: React.ReactNode;
}) {
  return (
    <Box flexDirection="column">
      <Box>
        {tabs.map((tab) => (
          <Box key={tab} marginX={1}>
            <Text color={activeTab === tab ? 'cyan' : 'gray'} bold={activeTab === tab}>
              {tab}
            </Text>
          </Box>
        ))}
      </Box>
      <Box marginTop={1}>{children}</Box>
    </Box>
  );
}
