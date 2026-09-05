# 2026-09-05-toPatch-empty-findings-fix

## Summary

Fixed `toPatch` crash when `Critique.findings` is empty. Root cause: `c.findings[0]` accessed without array-length guard, producing `reason: undefined` for critics with zero findings. Also removed redundant `aborted` parameter from `toPatch` — `ctx.aborted` is now the single source of truth, set in `loopCommandTui`'s `onAbort` callback.

## Changes

| File | Change |
|---|---|
| `src/cli/commands/loop/loop.ts` | `c.findings[0]` → `c.findings[0] ?? 'passes without issues'`; removed `aborted` param; `ctx.aborted` read directly; `onAbort` sets `ctx.aborted = true` |
| `engine/loop/wiring/context.ts` | Added `aborted?: boolean` to `LoopContext` |
| `src/cli/commands/loop/loop-topatch.test.ts` | Updated all call sites to 3-arg signature; `ctx({ aborted: true })` instead of positional `true` |

## Verification

- `bun run gate`: 370 pass / 0 fail / 742 expect(), all checks passed
- Test `toPatch > maps critics` now asserts `reason: 'passes without issues'` for empty findings
- Prettier format check clean on all 3 changed files

## Root Cause

`Critique.findings: string[]` is a required field on the `Critique` interface (`engine/critic/aggregate.ts:12`). The `aggregate()` function (`engine/critic/aggregate.ts:33`) pushes findings from all critics — an empty findings array is valid (e.g., `dxCritic` returns `{ name: 'dx', score: 1, weight: 0.8, findings: [] }` when no issues found). `toPatch` mapped `c.findings[0]` directly to `CriticLine.reason`, which is `string | undefined` (`src/tui/core/state.ts:11`). While TypeScript accepts `undefined` for the optional field, the TUI consumers in `critics.tsx:103` only render `c.reason` when `expanded && c.reason` — so `undefined` is silently dropped. Not a crash, but a silent data loss: critics with no findings show no reason text even in expanded mode.

## Commit

`c4c0a7d`