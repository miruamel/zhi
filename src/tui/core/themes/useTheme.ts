/**
 * @fileoverview Theme hook — persists active theme in localStorage.
 * @since 0.1.12
 * @package zhi
 */
import { useEffect, useState } from 'react';
import { getTheme, type ThemeName, type ThemeTokens } from './tokens';

const THEME_KEY = 'zhi:theme';

/** @brief Active theme hook with localStorage persistence. @since 0.1.12 */
export function useTheme(): [ThemeTokens, (name: ThemeName) => void, ThemeName] {
  const [name, setName] = useState<ThemeName>('dark');
  const [tokens, setTokens] = useState<ThemeTokens>(() => getTheme('dark'));

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY) as ThemeName | null;
      if (saved && saved in { dark: 1, light: 1, highContrast: 1 }) {
        setName(saved);
        setTokens(getTheme(saved));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setTheme = (n: ThemeName) => {
    setName(n);
    setTokens(getTheme(n));
    try {
      localStorage.setItem(THEME_KEY, n);
    } catch {
      /* ignore */
    }
  };

  return [tokens, setTheme, name];
}
