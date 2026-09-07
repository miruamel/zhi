/**
 * @fileoverview Critic plant shared types. @since 0.2.6
 * @package zhi
 */
/** @brief Severity levels for critic findings. @since 0.2.6 */
export type CriticSeverity = 'info' | 'warn' | 'error';

/** @brief A single critic finding. @since 0.2.6 */
export interface CriticFinding {
  file: string;
  line: number;
  message: string;
  severity: CriticSeverity;
  rule?: string;
}

/** @brief Input to a critic. @since 0.2.6 */
export interface CriticInput {
  files: Array<{ path: string; content: string }>;
  config?: Record<string, unknown>;
}

/** @brief Output from a critic. @since 0.2.6 */
export interface CriticOutput {
  findings: CriticFinding[];
  score: number;
  durationMs: number;
}

/** @brief A registered critic descriptor. @since 0.2.6 */
export interface CriticDescriptor {
  id: string;
  name: string;
  severity: CriticSeverity;
  check: (input: CriticInput) => CriticOutput;
}
