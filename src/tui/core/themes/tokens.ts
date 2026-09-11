/**
 * @fileoverview Theme tokens — light, dark, high-contrast color palettes.
 * @since 0.1.12
 * @package zhi
 */

/** @brief Theme color token set. @since 0.1.12 */
export interface ThemeTokens {
  bg: string;
  fg: string;
  fgDim: string;
  accent: string;
  accentBlue: string;
  warn: string;
  error: string;
  running: string;
  done: string;
  pending: string;
  failed: string;
  scoring: string;
  forward: string;
  commit: string;
  complete: string;
}

/** @brief Built-in theme definitions. @since 0.1.12 */
export const themes: Record<string, ThemeTokens> = {
  dark: {
    bg: 'black',
    fg: 'white',
    fgDim: 'gray',
    accent: 'green',
    accentBlue: 'cyan',
    warn: 'yellow',
    error: 'red',
    running: 'yellow',
    done: 'green',
    pending: 'gray',
    failed: 'red',
    scoring: 'magenta',
    forward: 'cyan',
    commit: 'cyan',
    complete: 'greenBright',
  },
  light: {
    bg: 'white',
    fg: 'black',
    fgDim: 'gray',
    accent: 'green',
    accentBlue: 'blue',
    warn: 'yellow',
    error: 'red',
    running: 'yellow',
    done: 'green',
    pending: 'gray',
    failed: 'red',
    scoring: 'magenta',
    forward: 'blue',
    commit: 'blue',
    complete: 'green',
  },
  highContrast: {
    bg: 'black',
    fg: 'white',
    fgDim: 'white',
    accent: 'green',
    accentBlue: 'cyan',
    warn: 'yellow',
    error: 'red',
    running: 'yellow',
    done: 'green',
    pending: 'gray',
    failed: 'red',
    scoring: 'magenta',
    forward: 'cyan',
    commit: 'cyan',
    complete: 'greenBright',
  },
} as const;

export type ThemeName = keyof typeof themes;

/** @brief Resolve theme by name, falling back to dark. @since 0.1.12 */
export function getTheme(name: string): ThemeTokens {
  return themes[name] ?? themes.dark;
}
