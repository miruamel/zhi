/**
 * @brief Map CriticResult[] → CriticItem[] (TUI findings).
 * @since 0.1.15
 */
import type { CriticResult } from '../../../../engine/critic/aggregate';
import type { CriticItem } from '../../../tui/core/store/types/entities/dag';

/** @brief Map critic score (0..1) → CriticItem severity. @since 0.1.15 */
export function scoreToSeverity(score: number): CriticItem['severity'] {
  if (score < 0.4) return 'critical';
  if (score < 0.6) return 'high';
  if (score < 0.8) return 'medium';
  return 'low';
}

/** @brief Parse a finding string into file + line. @since 0.1.15 */
export function parseFinding(f: string): { file?: string; line?: number } {
  // Strip optional critic prefix like "security: src/foo.ts:42" → "src/foo.ts:42".
  const stripped = f.replace(/^[a-z]+:\s*/i, '');
  const m = stripped.match(/^([^\s:]+):(\d+)/);
  if (m) return { file: m[1], line: Number(m[2]) };
  const m2 = stripped.match(/^([^\s:]+):/);
  if (m2) return { file: m2[1] };
  return {};
}

/** @brief Map CriticResult[] → CriticItem[] (TUI findings). @since 0.1.15 */
export function mapCriticItems(critiques: CriticResult[]): CriticItem[] {
  const items: CriticItem[] = [];
  for (const c of critiques) {
    for (const f of c.findings) {
      const parsed = parseFinding(f);
      items.push({
        id: `${c.name}:${parsed.line ?? 0}:${items.length}`,
        category: c.name,
        severity: scoreToSeverity(c.score),
        title: c.name,
        description: f,
        file: parsed.file,
        line: parsed.line,
        suggestion: undefined,
        autoFix: false,
        fixed: false,
      });
    }
  }
  return items;
}
