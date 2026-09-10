/**
 * @fileoverview Build engine barrel. @since 0.1.10
 * @package zhi
 */
export { Pipeline, createPipeline, quickPipeline } from './pipeline';
export type { PipelineStage, StageResult, FullPipelineResult } from './pipeline';
export { BuildRegistry, createBuildRegistry } from './registry';
export type {
  PluginType,
  BuildPlugin,
  BuildContext,
  RegistryEntry,
  DependencyNode,
} from './registry';
export {
  Signer,
  createSigner,
  KeyManager,
  createKeyManager,
  signFile,
  verifyFile,
} from './crypto/signer';
export type { SignerAlgorithm, KeyType, Signature, KeyPair, SignerOptions } from './crypto/signer';
export { VerifyEngine, createVerifyEngine, verify } from './crypto/verify';
export type { VerifyResult, ArtifactVerifyResult, VerifyOptions } from './crypto/verify';
export { generate, generateStream } from './core/scaffold';
export type { GenerateInput, GenerateOutput, ScaffoldFile } from './core/scaffold';
export {
  DEFAULT_BUILD_CONFIG,
  createBuildConfig,
  validateBuildConfig,
  formatExtension,
  platformLabel,
  statusLabel,
} from './core/types';
export type {
  BuildConfig,
  BuildFormat,
  BuildTarget,
  BuildPlatform,
  BuildStatus,
  ArtifactMeta,
} from './core/types';
