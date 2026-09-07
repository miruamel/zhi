/** @brief Critic: data-privacy — detect PII leakage, secrets, sensitive data. @since 0.2.6 */
import type { CriticResult } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

/** @brief Penalty per privacy violation. @since 0.2.6 */
const PENALTY = 0.05;

/** @brief PII patterns to flag. @since 0.2.6 */
const PII_PATTERNS: RegExp[] = [
  /\b(?:email|e-mail|password|passwd|token|api[_-]?key|secret|private[_-]?key|access[_-]?key)\b/i,
  /\b(?:\d{3}-\d{2}-\d{4}|\d{4}-\d{4}-\d{4}-\d{4})\b/,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  /\b(?:SSN|social[_-]?security)\b/i,
  /\b(?:passport|driver[_-]?license)\b/i,
  /\b(?:\{["'](?:key|secret|token)["']\s*:\s*["'][^"']+["']\})\b/,
  /\bprocess\.env\.[A-Z_]+/g,
  /\bconsole\.log\s*\([^)]*(?:password|secret|token|key|email)\b/i,
];

/** @brief Data privacy critic: penalize files with PII or secret exposure.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.2.6 */
export function dataPrivacyCritic(files: FileRecord[]): CriticResult {
  const findings: string[] = [];
  let score = 1;
  for (const f of files) {
    let count = 0;
    for (const p of PII_PATTERNS) {
      const matches = f.content.match(p);
      if (matches) count += matches.length;
    }
    if (count > 0) {
      findings.push(`${f.path}: ${count} privacy-sensitive pattern(s)`);
      score -= PENALTY * count;
    }
  }
  return { name: 'data-privacy', score: Math.max(0, score), weight: 0.6, findings };
}
