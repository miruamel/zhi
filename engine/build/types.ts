/**
 * @fileoverview Build types. @since 0.2.6
 * @package zhi
 */

/** @brief Build format. @since 0.2.6 */
export type BuildFormat = 'esm' | 'cjs' | 'iife';
/** @brief Build target. @since 0.2.6 */
export type BuildTarget =
  | 'esnext'
  | 'es2022'
  | 'es2021'
  | 'es2020'
  | 'es2019'
  | 'es2018'
  | 'es2017'
  | 'es2016'
  | 'es2015'
  | 'es5';
/** @brief Build platform. @since 0.2.6 */
export type BuildPlatform = 'browser' | 'node' | 'neutral';
/** @brief Build status. @since 0.2.6 */
export type BuildStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';

/** @brief Artifact metadata. @since 0.2.6 */
export interface ArtifactMeta {
  path: string;
  hash: string;
  size: number;
  format: BuildFormat;
  platform: BuildPlatform;
  target: BuildTarget;
  status: BuildStatus;
  timestamp: number;
}

/** @brief Build config. @since 0.2.6 */
export interface BuildConfig {
  format: BuildFormat;
  target: BuildTarget;
  platform: BuildPlatform;
  outDir: string;
  minify: boolean;
  sourceMap: boolean;
  external: string[];
  entry: string;
  platformLabel?: string;
}

/** @brief Default build config. @since 0.2.6 */
export const DEFAULT_BUILD_CONFIG: BuildConfig = {
  format: 'esm',
  target: 'es2022',
  platform: 'node',
  outDir: 'dist',
  minify: false,
  sourceMap: false,
  external: [],
  entry: 'src/index.ts',
};

/** @brief Create build config with overrides. @since 0.2.6 */
export function createBuildConfig(overrides: Partial<BuildConfig> = {}): BuildConfig {
  return { ...DEFAULT_BUILD_CONFIG, ...overrides };
}

/** @brief Validate build config. @since 0.2.6 */
export function validateBuildConfig(config: BuildConfig): string[] {
  const errors: string[] = [];
  if (!config.entry) errors.push('entry is required');
  if (!config.outDir) errors.push('outDir is required');
  return errors;
}

/** @brief Format extension. @since 0.2.6 */
export function formatExtension(format: BuildFormat): string {
  return format === 'esm' ? '.mjs' : format === 'cjs' ? '.cjs' : '.js';
}

/** @brief Platform label. @since 0.2.6 */
export function platformLabel(platform: BuildPlatform): string {
  return platform;
}

/** @brief Status label. @since 0.2.6 */
export function statusLabel(status: BuildStatus): string {
  return status;
}
