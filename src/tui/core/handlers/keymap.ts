/**
 * @fileoverview Keymap: maps key press to action. @since 0.1.2
 */
export type KeyAction =
  | 'quit'
  | 'toggleLog'
  | 'toggleCritics'
  | 'togglePr'
  | 'toggleHelp'
  | 'toggleDetail'
  | 'pauseResume'
  | 'abort'
  | 'redraw'
  | 'nextLog'
  | 'prevLog'
  | 'logTop'
  | 'logBottom'
  | 'cycle'
  | 'openPalette'
  | 'closePalette'
  | 'nextPane'
  | 'prevPane'
  | 'splitH'
  | 'splitV'
  | 'closePane'
  | 'collapsePane'
  | 'expandPane'
  | 'jumpMode'
  | 'searchMode'
  | 'unknown';

const map: Record<string, KeyAction> = {
  q: 'quit',
  l: 'toggleLog',
  c: 'toggleCritics',
  p: 'togglePr',
  h: 'toggleHelp',
  '?': 'toggleHelp',
  d: 'toggleDetail',
  ' ': 'pauseResume',
  enter: 'unknown',
  escape: 'quit',
  r: 'redraw',
  j: 'nextLog',
  k: 'prevLog',
  g: 'logTop',
  G: 'logBottom',
  tab: 'cycle',
  '/': 'searchMode',
};

/** @brief Map key press to action. @param {string} input - raw key string from useInput. @return {KeyAction} */
export function resolveKey(input: string, key: { ctrl?: boolean; meta?: boolean; shift?: boolean }): KeyAction {
  if (key.ctrl && input === 'c') return 'abort';
  if (key.ctrl && input === 'k') return 'openPalette';
  if (key.ctrl && input === 'p') return 'openPalette';
  if (key.escape) return 'closePalette';
  if (key.ctrl && input === 'h') return 'splitH';
  if (key.ctrl && input === 'v') return 'splitV';
  if (key.ctrl && input === 'w') return 'closePane';
  if (key.ctrl && input === 'x') return 'collapsePane';
  if (key.ctrl && input === 'e') return 'expandPane';
  if (key.ctrl && input === 'j') return 'nextPane';
  if (key.ctrl && input === 'k') return 'prevPane';
  if (input in map) return map[input]!;
  return 'unknown';
}
