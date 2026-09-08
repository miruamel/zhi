/**
 * @fileoverview Build signer. @since 0.1.10
 * @package zhi
 */
import { createHash, generateKeyPairSync } from 'node:crypto';
import { readFile } from 'node:fs/promises';

/** @brief Signer algorithm. @since 0.1.10 */
export type SignerAlgorithm = 'sha256' | 'sha512' | 'sha3-256' | 'sha3-512';
/** @brief Key type. @since 0.1.10 */
export type KeyType = 'hmac' | 'rsa' | 'ed25519';

/** @brief Signature. @since 0.1.10 */
export interface Signature {
  algorithm: SignerAlgorithm;
  keyType: KeyType;
  hash: string;
  timestamp: number;
}

/** @brief Key pair. @since 0.1.10 */
export interface KeyPair {
  keyType: KeyType;
  publicKey: string;
  privateKey: string;
}

/** @brief Signer options. @since 0.1.10 */
export interface SignerOptions {
  algorithm?: SignerAlgorithm;
  keyType?: KeyType;
  secret?: string;
}

/** @brief Signer. @since 0.1.10 */
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
    const hash = createHash(signature.algorithm).update(data).digest('hex');
    return hash === signature.hash;
  }
}

/** @brief Key manager. @since 0.1.10 */
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

/** @brief Create signer. @since 0.1.10 */
export function createSigner(options?: SignerOptions): Signer {
  return new Signer(options);
}

/** @brief Create key manager. @since 0.1.10 */
export function createKeyManager(): KeyManager {
  return new KeyManager();
}

/** @brief Sign file. @since 0.1.10 */
export async function signFile(path: string, signer: Signer): Promise<Signature> {
  const data = await readFile(path);
  return signer.sign(data);
}

/** @brief Verify file. @since 0.1.10 */
export async function verifyFile(
  path: string,
  signature: Signature,
  signer: Signer,
): Promise<boolean> {
  const data = await readFile(path);
  return signer.verify(data, signature);
}
