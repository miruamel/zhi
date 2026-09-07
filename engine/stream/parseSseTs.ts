/**
 * @fileoverview Stream parser — SSE text parser (TS fallback). @since 0.1.1
 * @package zhi
 */

/**
 * @brief Parse SSE text into data payloads (TS fallback).
 * @param {string} sse - raw SSE text.
 * @return {Promise<string[]>} data payloads.
 * @since 0.1.1
 */
export async function parseSseTs(sse: string): Promise<string[]> {
  const results: string[] = [];
  const lines = sse.split('\n');
  let currentData: string[] = [];

  for (const line of lines) {
    if (line === '' || line === '\r') {
      if (currentData.length > 0) {
        results.push(...currentData);
      }
      currentData = [];
    }
    if (line.startsWith('data:')) {
      let data = line.slice(5);
      data = data.replace(/^ +/, '');
      currentData.push(data);
    }
  }
  if (currentData.length > 0) {
    results.push(...currentData);
  }
  return results;
}
