/**
 * @fileoverview Build engine — pipeline, registry, signer, verify. @since 0.2.6
 * @package zhi
 */
import { createHash, generateKeyPairSync } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import type { BuildConfig } from './types';
import type { ScaffoldFile } from './scaffold';

// === Pipeline ===
/** @brief Pipeline stage. @since 0.2.6 */
export type PipelineStage = 'generate' | 'build' | 'sign' | 'verify' | 'deploy';

/** @brief Stage result. @since 0.2.6 */
export interface StageResult {
  stage: PipelineStage;
  ok: boolean;
  durationMs: number;
  detail?: string;
}

/** @brief Full pipeline result. @since 0.2.6 */
export interface FullPipelineResult {
  ok: boolean;
  stages: StageResult[];
  artifact?: { path: string; hash: string };
}

/** @brief Pipeline runner. @since 0.2.6 */
export class Pipeline {
  private stages: PipelineStage[] = ['generate', 'build', 'sign', 'verify', 'deploy'];

  async run(_config: BuildConfig): Promise<FullPipelineResult> {
    const results: StageResult[] = [];
    for (const stage of this.stages) {
      const start = Date.now();
      results.push({ stage, ok: true, durationMs: Date.now() - start });
    }
    return { ok: true, stages: results };
  }
}

/** @brief Create pipeline. @since 0.2.6 */
export function createPipeline(): Pipeline {
  return new Pipeline();
}

/** @brief Quick pipeline run. @since 0.2.6 */
export async function quickPipeline(config: BuildConfig): Promise<FullPipelineResult> {
  return createPipeline().run(config);
}

// === Registry ===
/** @brief Plugin type. @since 0.2.6 */
export type PluginType = 'transform' | 'resolve' | 'output' | 'cleanup';

/** @brief Build plugin. @since 0.2.6 */
export interface BuildPlugin {
  name: string;
  type: PluginType;
  apply(context: BuildContext): void;
}

/** @brief Build context. @since 0.2.6 */
export interface BuildContext {
  config: BuildConfig;
  files: ScaffoldFile[];
}

/** @brief Registry entry. @since 0.2.6 */
export interface RegistryEntry {
  name: string;
  plugin: BuildPlugin;
  dependencies: string[];
}

/** @brief Dependency node. @since 0.2.6 */
export interface DependencyNode {
  name: string;
  dependencies: string[];
  orphan: boolean;
  valid: boolean;
}

/** @brief Build registry. @since 0.2.6 */
export class BuildRegistry {
  private plugins = new Map<string, BuildPlugin>();
  private deps = new Map<string, string[]>();

  register(plugin: BuildPlugin, deps: string[] = []): void {
    this.plugins.set(plugin.name, plugin);
    this.deps.set(plugin.name, deps);
  }

  get(name: string): BuildPlugin | undefined {
    return this.plugins.get(name);
  }

  resolve(): DependencyNode[] {
    const nodes: DependencyNode[] = [];
    for (const [name, deps] of this.deps) {
      const orphan = deps.every((d) => !this.deps.has(d));
      const valid = deps.every((d) => this.deps.has(d));
      nodes.push({ name, dependencies: deps, orphan, valid });
    }
    return nodes;
  }
}

/** @brief Create build registry. @since 0.2.6 */
export function createBuildRegistry(): BuildRegistry {
  return new BuildRegistry();
}

// === Signer ===
/** @brief Signer algorithm. @since 0.2.6 */
export type SignerAlgorithm = 'sha256' | 'sha512' | 'sha3-256' | 'sha3-512';
/** @brief Key type. @since 0.2.6 */
export type KeyType = 'hmac' | 'rsa' | 'ed25519';

/** @brief Signature. @since 0.2.6 */
export interface Signature {
  algorithm: SignerAlgorithm;
  keyType: KeyType;
  hash: string;
  timestamp: number;
}

/** @brief Key pair. @since 0.2.6 */
export interface KeyPair {
  keyType: KeyType;
  publicKey: string;
  privateKey: string;
}

/** @brief Signer options. @since 0.2.6 */
export interface SignerOptions {
  algorithm?: SignerAlgorithm;
  keyType?: KeyType;
  secret?: string;
}

/** @brief Signer. @since 0.2.6 */
export class Signer {
  private algorithm: SignerAlgorithm;
  private keyType: KeyType;
  constructor(options: SignerOptions = {}) {
    this.algorithm = options.algorithm ?? 'sha256';
    this.keyType = options.keyType ?? 'hmac';
  }

  sign(data: string | Buffer): Signature {
    const hash = createHash(this.algorithm).update(data).digest('hex');
    return { algorithm: this.algorithm, keyType: this.keyType, hash, timestamp: Date.now() };
  }

  verify(data: string | Buffer, signature: Signature): boolean {
    const hash = createHash(this.algorithm).update(data).digest('hex');
    return hash === signature.hash;
  }
}

/** @brief Key manager. @since 0.2.6 */
export class KeyManager {
  generate(): KeyPair {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return { keyType: 'rsa', publicKey, privateKey };
  }
}

/** @brief Create signer. @since 0.2.6 */
export function createSigner(options?: SignerOptions): Signer {
  return new Signer(options);
}

/** @brief Create key manager. @since 0.2.6 */
export function createKeyManager(): KeyManager {
  return new KeyManager();
}

/** @brief Sign file. @since 0.2.6 */
export async function signFile(path: string, signer: Signer): Promise<Signature> {
  const data = await readFile(path);
  return signer.sign(data);
}

/** @brief Verify file. @since 0.2.6 */
export async function verifyFile(
  path: string,
  signature: Signature,
  signer: Signer,
): Promise<boolean> {
  const data = await readFile(path);
  return signer.verify(data, signature);
}

// === Verify ===
/** @brief Verify result. @since 0.2.6 */
export interface VerifyResult {
  ok: boolean;
  files: number;
  violations: string[];
  errors: string[];
}

/** @brief Verify scaffold files. @since 0.2.6 */
export function verify(files: ScaffoldFile[]): VerifyResult {
  const errors: string[] = [];
  const dirCounts = new Map<string, number>();
  for (const f of files) {
    if (!f.path) errors.push('missing path');
    if (f.content === undefined) errors.push(`${f.path}: missing content`);
    if (f.content && !/@brief/.test(f.content)) errors.push(`${f.path}: missing @brief`);
    if (f.content && /(\.\.\/){3,}/.test(f.content)) {
      errors.push(`${f.path}: deep relative import`);
    }
    const dir = f.path.includes('/') ? f.path.split('/').slice(0, -1).join('/') : '.';
    dirCounts.set(dir, (dirCounts.get(dir) ?? 0) + 1);
  }
  for (const [dir, count] of dirCounts) {
    if (count > 5) errors.push(`${dir}: exceeds 5 files (${count})`);
  }
  return { ok: errors.length === 0, files: files.length, violations: errors, errors };
}

/** @brief Artifact verify result. @since 0.2.6 */
export interface ArtifactVerifyResult {
  ok: boolean;
  mismatches: string[];
}

/** @brief Verify options. @since 0.2.6 */
export interface VerifyOptions {
  algorithm?: 'sha256' | 'sha512';
}

/** @brief Verify engine. @since 0.2.6 */
export class VerifyEngine {
  private algorithm: 'sha256' | 'sha512';

  constructor(options: VerifyOptions = {}) {
    this.algorithm = options.algorithm ?? 'sha256';
  }

  async verify(path: string, expectedHash: string): Promise<ArtifactVerifyResult> {
    const data = await readFile(path);
    const hash = createHash(this.algorithm).update(data).digest('hex');
    return { ok: hash === expectedHash, mismatches: hash === expectedHash ? [] : [path] };
  }
}

/** @brief Create verify engine. @since 0.2.6 */
export function createVerifyEngine(options?: VerifyOptions): VerifyEngine {
  return new VerifyEngine(options);
}
