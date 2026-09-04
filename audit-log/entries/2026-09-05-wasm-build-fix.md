# 2026-09-05 — WASM build fix (Issue #96)

## Problem

`engine/stream/zigBridge.ts:13` loads `../../native/out/stream.wasm` relative to
`import.meta.dir`. After `bun run build` (tsc → `dist/`), the WASM was never
copied into `dist/`, so:

- `readFileSync` always throws
- `parseSseWasm` returns `[]`
- Write-barrier detection disables WASM
- TS parser silently takes over

Result: WASM hot path was dead in every published npm package, despite the
fallback preventing a crash.

## Root cause

Two issues compounded:

1. `scripts/build.ts` only ran `tsc` — no WASM copy step.
2. `publish.yml` ran `bun run build` (tsc) **before** `bun run native:build`
   (zig), so even if build.ts tried to copy, the source didn't exist yet.

## Fix

Three files changed (commit `61dd731`):

| File | Change |
|---|---|
| `scripts/build.ts` | After tsc, copy `native/out/stream.wasm` → `dist/native/out/stream.wasm` via `mkdirSync` + `copyFileSync`. Warn (not fail) if source missing. |
| `.github/workflows/publish.yml` | Reorder: Zig setup → `native:build` → `build` (tsc + wasm copy). |
| `package.json` | `prepublishOnly`: `gate && native:build && build` (self-sufficient). |

## Verification

| Check | Result |
|---|---|
| `bun run build` | `dist/native/out/stream.wasm` exists (764 bytes) |
| `zigBridge.ts:13` path resolution | `dist/engine/stream` → `../../native/out/stream.wasm` = `dist/native/out/stream.wasm` ✓ |
| `bun test` | 367 pass / 0 fail / 730 expect() across 73 files |
| `tsc --noEmit` | clean |
| `bun run gate` | fast-path passed (docs-only) |
| CI: ci | success (59s) |
| CI: security | success (1m15s) |
| CI: architecture-guard | success (20s) |
| Issue #96 | closed |

## What changed

- `scripts/build.ts`: 10 insertions (wasm copy + imports)
- `package.json`: 1 line (prepublishOnly)
- `.github/workflows/publish.yml`: 2 lines (reorder steps)