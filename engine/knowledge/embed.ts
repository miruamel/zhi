/**
 * @fileoverview Text embedding — deterministic hash-based vectors. @since 0.2.6
 * @package zhi
 */
/** @brief Embed text into a vector. @since 0.2.6 */
export function embed(text: string, dims: number = 64): number[] {
  const vec = new Array<number>(dims).fill(0);
  for (let i = 0; i < text.length; i++) {
    const idx = (text.charCodeAt(i) * (i + 1)) % dims;
    vec[idx] += 1 / (1 + i);
  }
  const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  return mag > 0 ? vec.map((v) => v / mag) : vec;
}

/** @brief Cosine similarity between two vectors. @since 0.2.6 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom > 0 ? dot / denom : 0;
}
