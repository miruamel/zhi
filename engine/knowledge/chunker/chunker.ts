/**
 * @fileoverview Text chunker — splits text into overlapping chunks. @since 0.2.6
 * @package zhi
 */
/** @brief Chunk options. @since 0.2.6 */
export interface ChunkOpts {
  maxTokens?: number;
  overlap?: number;
  preserveCode?: boolean;
}

/** @brief A text chunk. @since 0.2.6 */
export interface Chunk {
  id: string;
  text: string;
  startLine: number;
  endLine: number;
  tokens: number;
}

/** @brief Estimate token count. @since 0.2.6 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** @brief Split text into chunks. @since 0.2.6 */
export function chunk(text: string, opts: ChunkOpts = {}): Chunk[] {
  const maxTokens = opts.maxTokens ?? 500;
  const overlap = opts.overlap ?? 50;
  const lines = text.split('\n');
  const chunks: Chunk[] = [];
  let start = 0;
  let counter = 0;

  while (start < lines.length) {
    let end = start;
    let tokens = 0;
    while (end < lines.length && tokens < maxTokens) {
      tokens += estimateTokens(lines[end]);
      end++;
    }
    const chunkText = lines.slice(start, end).join('\n');
    chunks.push({
      id: `chunk-${counter++}`,
      text: chunkText,
      startLine: start + 1,
      endLine: end,
      tokens,
    });
    if (end >= lines.length) break;
    start = Math.max(start + 1, end - overlap);
  }

  return chunks;
}
