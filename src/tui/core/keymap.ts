/** @brief Keymap: maps key press to action. @since 0.1.0 */
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
};

/** @brief Map key press to action. @param {string} input - raw key string from useInput. @return {KeyAction} */
export function resolveKey(input: string, key: { ctrl?: boolean }): KeyAction {
  if (key.ctrl && input === 'c') return 'abort';
  if (input in map) return map[input]!;
  return 'unknown';
}
