# 2026-09-05 — WASM hot path rebuild (PR #97, closes #96)

## Problem

The published npm package shipped a **corrupt WASM binary** that `WebAssembly.instantiate`
refused to load. Two compounding failures:

1. **Binary corruption**: `zig build-lib parse.zig -target wasm32-freestanding` produces an
   `ar` archive (magic `!<arch>`) wrapping `stream.wasm.o` (521 bytes, valid `\0asm` WASM).
   `build.sh`'s magic detection used `$'\0asm'` as a grep pattern — null bytes don't survive
   grep, so the pattern expanded to an empty string, `grep -q ''` matched everything, and the
   script copied the ar archive instead of the extracted `.o` member.

2. **Packaging gap**: `scripts/build.ts` only ran `tsc` — never copied `native/out/stream.wasm`
   into `dist/`. Since `native/out/` is gitignored and excluded by `.npmignore`, the published
   package had no WASM at all. `readFileSync` threw → `parseSseWasm` returned `[]` →
   write-barrier detection disabled WASM → TS parser fallback. Silent degradation.

## Root cause

The Zig build itself was fine — `build-lib` produces a valid WASM object. The failures were
in the extraction script (grep null-byte bug) and the build pipeline (missing copy step).
The `build-exe` approach tried in PR #97 was a dead end: `-fno-entry` still dead-code-eliminated
`parse_sse`, and the resulting binary needed a `_start` entry point that broke the freestanding
target. Reverted to `build-lib` + `ar x` extraction, which works correctly.

## Fix

| File | Change |
|---|---|
| `native/stream/build.sh` | Replace `$'\0asm'` grep with `od -A n -t x1 \| grep -q '00 61 73 6d'` for magic verification. Extract `.o` member via `ar x` in temp dir. |
| `native/stream/parse.zig` | Reverted to clean `export fn parse_sse` (no `_start`, no broken `@export` comptime). |
| `engine/stream/zigBridge.ts` | Import name `env.memory` → `env:__linear_memory:memory` to match WASM module's import section. |
| `engine/stream/test/index.test.ts` | Write-barrier test assumed `parseSseWasm` returned `[]` (broken-WASM symptom). Updated to use `disableWasm()` deterministically now that WASM works. |
| `scripts/build.ts` | Copy `native/out/stream.wasm` → `dist/native/out/stream.wasm` after tsc. |
| `package.json` | `prepublishOnly`: `gate && native:build && build` (self-sufficient). |
| `.github/workflows/publish.yml` | Reorder: Zig setup → `native:build` → `build`. |

## Verification

| Check | Result |
|---|---|
| `parseSseWasm('data: hello\ndata: world\n')` | `["hello","world"]` ✓ |
| WASM binary magic | `\0asm` (373 bytes, valid) |
| `bun test` | 367 pass / 0 fail / 730 expect() across 73 files |
| `bun run gate` | fast-path passed, lint clean, format clean |
| CI: ci | success |
| CI: security | success |
| CI: architecture-guard | success |
| Issue #96 | closed by PR #97 merge |
| PR #97 | merged via `--admin --squash` |

## What changed

- `native/stream/build.sh`: 1-line grep fix + temp-dir extraction
- `native/stream/parse.zig`: reverted to clean state
- `engine/stream/zigBridge.ts`: import name fix
- `engine/stream/test/index.test.ts`: 14-line test update
- `scripts/build.ts`: 10 insertions (wasm copy + imports)
- `package.json`: 1 line (prepublishOnly)
- `.github/workflows/publish.yml`: 2 lines (reorder steps)