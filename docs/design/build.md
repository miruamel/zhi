# design/build.md — Generator

## Tujuan

Hasilkan/ubah kode **multi-file** yang konsisten antar-file, verifikasi syntax sendiri, dan jaga konteks muat saat loop panjang. Dijalankan di state `EXECUTE`.

## Komponen

- `sanitize.ts` (Input Sanitizer: AST / PII / XSS) — **stub v1**.
- `generate.ts` (Multi-File Generator + Inter-File Dependency Mapper).
- `verify.ts` (Self-Verify Syntax Checker + Formatter).
- `context.ts` (Prompt Compression / Context Manager).

## Interface

```ts
/** @brief Generate/edit multi-file dari instruksi + konteks repo.
 * @param {GenReq} req - instruksi + file target + dep map.
 * @return {FileChange[]} perubahan per file.
 * @see engine/knowledge/git.ts (dep map dari history)
 * @since 0.1.0 */
export async function generate(req: GenReq): Promise<FileChange[]>

/** @brief Verifikasi syntax + format hasil generate.
 * @param {FileChange[]} changes
 * @return {VerifyResult} ok | errors.
 * @since 0.1.0 */
export function verify(changes: FileChange[]): VerifyResult

/** @brief Kompres konteks loop panjang agar muat context window.
 * @param {Context} ctx
 * @return {Context} ctx terkompresi.
 * @since 0.1.0 */
export function compress(ctx: Context): Context
```

## Alur

1. `generate` panggil `model/router.ts` (stream via `model/stream.ts`).
2. Inter-file dep mapper baca `knowledge/git.ts` (history) sebelum generate → konsistensi import/export antar-file.
3. `verify` cek syntax (`tsc --noEmit` / parser) + format (prettier/dprint).
4. `context.compress` jaga konteks bila step ke-N (mencegah overflow).

## Edge cases

- Generate gagal syntax → `verify` error → loop `RECOVER`.
- Dep map tidak lengkap → generate heuristik + `verify` ketat.
- Context overflow → `compress` sebelum step berikutnya.

## v1

Konkret: `generate` + `verify` + `context`. `sanitize` **stub** — input berasal dari user (trust boundary), bukan untrusted web, sehingga prioritas rendah. Bila kelak Zhi menerima input web, `sanitize` naik ke konkret (AST strip + PII redact + XSS escape).

## Cross-link

`ARCHITECTURE.md` §3, §5; `design/model.md`; `design/knowledge.md`; `design/loop.md`.
