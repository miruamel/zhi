/**
 * @fileoverview Stream hook — manages streaming text accumulation. @since 0.2.0
 */
import { useState, useCallback } from 'react';

export interface StreamState {
  text: string;
  tokens: number;
  status: 'idle' | 'streaming' | 'done' | 'error';
}

/** @brief Hook for accumulating streaming text chunks. @since 0.2.0 */
export function useStream(initial = '') {
  const [text, setText] = useState(initial);
  const [status, setStatus] = useState<StreamState['status']>('idle');
  const [tokens, setTokens] = useState(0);

  const push = useCallback((chunk: string) => {
    setText((t) => t + chunk);
    setTokens((n) => n + Math.ceil(chunk.length / 4));
    setStatus('streaming');
  }, []);

  const done = useCallback(() => setStatus('done'), []);
  const error = useCallback(() => setStatus('error'), []);
  const reset = useCallback(() => {
    setText('');
    setTokens(0);
    setStatus('idle');
  }, []);

  return { text, tokens, status, push, done, error, reset };
}
