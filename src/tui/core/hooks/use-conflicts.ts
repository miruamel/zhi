/**
 * @brief Conflict resolution hook — marks cycles resolved in AppState.
 * @param setState React state setter for AppState
 * @param setSelectedConflictId setter for the selected conflict id
 * @return resolveConflict callback
 * @since 0.1.12
 * @package zhi
 */
import { useCallback } from 'react';
import { AppState } from '../state';

export interface UseConflictResolverResult {
  resolveConflict: (id: string) => void;
}

export function useConflictResolver(
  setState: React.Dispatch<React.SetStateAction<AppState>>,
  setSelectedConflictId: React.Dispatch<React.SetStateAction<string | undefined>>,
): UseConflictResolverResult {
  const resolveConflict = useCallback(
    (id: string) => {
      setState((s: AppState) => ({
        ...s,
        conflicts: s.conflicts.map((c) =>
          c.id === id ? { ...c, resolved: true, reason: 'resolved by user' } : c,
        ),
        selectedConflictId: undefined,
      }));
      setSelectedConflictId(undefined);
    },
    [setState],
  );

  return { resolveConflict };
}
