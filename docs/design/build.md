# design/build.md — Generator

## Purpose

Generate / modify **multi-file** code that is consistent across files, self-verifies syntax, and keeps context within budget over a long loop. Runs in the `EXECUTE` state.

## Components

- `sanitize.ts` (Input Sanitiser: AST / PII / XSS) — **stub in v1**.
- `generate.ts` (Multi-File Generator + Inter-File Dependency Mapper).
- `verify.ts` (Self-Verify Syntax Checker + Formatter).
- `context.ts` (Prompt Compression / Context Manager).

## Interface

```ts
/** @brief Generate / edit multi-file from instructions + repo context.
 * @param {GenReq} req - instructions + target files + dep map.
 * @return {FileChange[]} per-file changes.
 * @see engine/knowledge/git.ts (dep map from history)
 * @since 0.1.0 */
export async function generate(req: GenReq): Promise<FileChange[]>;

/** @brief Verify syntax + format the generated output.
 * @param {FileChange[]} changes
 * @return {VerifyResult} ok | errors.
 * @since 0.1.0 */
export function verify(changes: FileChange[]): VerifyResult;

/** @brief Compress long-loop context to fit the context window.
 * @param {Context} ctx
 * @return {Context} compressed ctx.
 * @since 0.1.0 */
export function compress(ctx: Context): Context;
```

## Flow

1. `generate` calls `model/router.ts` (stream via `model/stream.ts`).
2. Inter-file dep mapper reads `knowledge/git.ts` (history) before generate → import/export consistency across files.
3. `verify` checks syntax (`tsc --noEmit` / parser) + format (prettier/dprint).
4. `context.compress` keeps context in budget for step N (prevents overflow).

## Edge cases

- Generate produces invalid syntax → `verify` error → loop `RECOVER`.
- Incomplete dep map → generate heuristics + `verify` strict.
- Context overflow → `compress` before next step.

## v1

Concrete: `generate` + `verify` + `context`. `sanitize` is a **stub** — input is from the user (trust boundary), not untrusted web, so it is low priority. When Zhi eventually takes web input, `sanitize` becomes concrete (AST strip + PII redact + XSS escape).

## Cross-link

`ARCHITECTURE.md` §3, §5; `design/model.md`; `design/knowledge.md`; `design/loop.md`.
