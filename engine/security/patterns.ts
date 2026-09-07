/**
 * @fileoverview Security secret patterns. @since 0.1.9
 * @package zhi
 */

/** @brief Severity level. @since 0.1.9 */
export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/** @brief Secret pattern definition. @since 0.1.9 */
export interface SecretPattern {
  name: string;
  pattern: RegExp;
  severity: SecuritySeverity;
}

/** @brief Default secret detection patterns. @since 0.1.9 */
export const DEFAULT_SECRET_PATTERNS: SecretPattern[] = [
  {
    name: 'api-key',
    pattern: /(?:api[_-]?key|apikey|API_KEY)\s*[:=]\s*['"]?[\w-]{20,}['"]?/gi,
    severity: 'critical',
  },
  {
    name: 'password',
    pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"]?[\w-]{8,}['"]?/gi,
    severity: 'high',
  },
  {
    name: 'token',
    pattern: /(?:token|secret|auth)\s*[:=]\s*['"]?[\w-]{20,}['"]?/gi,
    severity: 'high',
  },
  {
    name: 'private-key',
    pattern: /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/g,
    severity: 'critical',
  },
  { name: 'aws-key', pattern: /AKIA[0-9A-Z]{16}/g, severity: 'critical' },
  { name: 'github-token', pattern: /gh[pousr]_[0-9A-Za-z]{36}/g, severity: 'critical' },
];
