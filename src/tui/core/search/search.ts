/** @brief Fuzzy and substring search over object arrays. @since 0.1.0 */

/** @brief Shape of items the search helpers understand. */
export interface Searchable {
  id: string;
  text: string;
  [k: string]: unknown;
}

/** @brief Highlight segment produced by {@link highlightMatches}. */
export interface MatchPart {
  text: string;
  match: boolean;
}

/** @brief Options accepted by {@link search}. */
export interface SearchOptions<T extends Searchable> {
  keys?: (keyof T)[];
  limit?: number;
  threshold?: number;
}

/** @brief Default fields searched when no keys are supplied. */
const DEFAULT_KEYS = ["text"] as const;

/** @brief Pick searchable string fields from an item. @param {T} item @param {(keyof T)[]} keys @return {string[]} */
function pickStrings<T extends Searchable>(item: T, keys: (keyof T)[]): string[] {
  const out: string[] = [];
  for (const k of keys) {
    const v = item[k as string];
    if (typeof v === "string") out.push(v);
  }
  return out;
}

/** @brief Score a fuzzy match (subsequence). Higher = better; 0 = no match.
 * Bonuses: exact match, prefix match, consecutive runs, word boundary, shorter text.
 * @param {string} query @param {string} text @return {number} */
export function fuzzyScore(query: string, text: string): number {
  if (!query) return 0;
  if (!text) return 0;

  const q = query.toLowerCase();
  const t = text.toLowerCase();

  if (q === t) return 1000;
  if (t.startsWith(q)) return 500 + (q.length / t.length) * 100;

  // Subsequence scan with bonuses.
  let qi = 0;
  let score = 0;
  let prevMatched = false;
  let prevWasBoundary = true;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    const ch = t[ti];
    const qch = q[qi];
    if (ch !== qch) {
      prevMatched = false;
      prevWasBoundary = ch === " " || ch === "-" || ch === "_" || ch === "/" || ch === ".";
      continue;
    }
    let bonus = 10;
    if (prevMatched) bonus += 20;
    if (prevWasBoundary) bonus += 15;
    if (ti === 0) bonus += 5;
    score += bonus;
    prevMatched = true;
    prevWasBoundary = false;
    qi++;
  }
  if (qi < q.length) return 0;

  // Penalize longer texts slightly so tighter matches win.
  score -= Math.max(0, t.length - q.length) * 0.1;
  return score;
}

/** @brief Score a substring (case-insensitive) match.
 * Rewards prefix and whole-word matches; returns 0 when not found.
 * @param {string} query @param {string} text @return {number} */
export function substringScore(query: string, text: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const idx = t.indexOf(q);
  if (idx < 0) return 0;
  let score = 100 - idx;
  const before = idx > 0 ? t[idx - 1] : " ";
  const isBoundary = before === " " || before === "-" || before === "_" || before === "/" || before === ".";
  if (isBoundary) score += 50;
  if (idx === 0) score += 30;
  return score;
}

/** @brief Filter and rank items by best fuzzy score across selected fields.
 * @param {T[]} items @param {string} query @param {(keyof T)[]} [keys] @return {T[]} */
export function fuzzyFilter<T extends Searchable>(
  items: T[],
  query: string,
  keys?: (keyof T)[],
): T[] {
  if (!query) return [];
  const fields = (keys ?? (DEFAULT_KEYS as unknown as (keyof T)[]));
  const scored: Array<{ item: T; score: number }> = [];
  for (const item of items) {
    let best = 0;
    for (const str of pickStrings(item, fields)) {
      const s = fuzzyScore(query, str);
      if (s > best) best = s;
    }
    if (best > 0) scored.push({ item, score: best });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.item);
}

/** @brief Split a string into match/non-match segments for highlighting.
 * Adjacent matches are coalesced into a single segment.
 * @param {string} text @param {string} query @return {MatchPart[]} */
export function highlightMatches(text: string, query: string): MatchPart[] {
  if (!text) return [];
  if (!query) return [{ text, match: false }];
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (!t.includes(q)) return [{ text, match: false }];

  const parts: MatchPart[] = [];
  let cursor = 0;
  let idx = t.indexOf(q, cursor);
  while (idx >= 0) {
    if (idx > cursor) {
      parts.push({ text: text.slice(cursor, idx), match: false });
    }
    parts.push({ text: text.slice(idx, idx + q.length), match: true });
    cursor = idx + q.length;
    idx = t.indexOf(q, cursor);
  }
  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), match: false });
  }
  return parts;
}

/** @brief Combined search: fuzzy filter, optional threshold and limit.
 * @param {T[]} items @param {string} query @param {SearchOptions<T>} [options] @return {T[]} */
export function search<T extends Searchable>(
  items: T[],
  query: string,
  options?: SearchOptions<T>,
): T[] {
  if (!query) return items.slice();

  const keys = options?.keys ?? (DEFAULT_KEYS as unknown as (keyof T)[]);
  const threshold = options?.threshold;
  const limit = options?.limit;

  const scored: Array<{ item: T; score: number }> = [];
  for (const item of items) {
    let best = 0;
    for (const str of pickStrings(item, keys)) {
      const f = fuzzyScore(query, str);
      const s = substringScore(query, str);
      const top = Math.max(f, s);
      if (top > best) best = top;
    }
    if (best <= 0) continue;
    if (threshold !== undefined && best < threshold) continue;
    scored.push({ item, score: best });
  }
  scored.sort((a, b) => b.score - a.score);
  const out = scored.map((s) => s.item);
  if (limit !== undefined && limit >= 0) return out.slice(0, limit);
  return out;
}
