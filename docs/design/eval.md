# design/eval.md — Evaluator Toolchain

## Tujuan

Verifikasi hasil lewat **toolchain nyata** (build, test, scan) — gate berbasis _kode_, bukan model judgment. Dijalankan di state `EVALUATE`, setelah `CRITIQUE`. Ini yang membedakan Zhi dari chat-wrapper: keputusan layak-commit didukung fakta tool, bukan vibes.

## Komponen

- `index.ts` (Pipeline Orchestrator): `evaluate(worktree)` jahit test + security → `gate` → `EvalOutput`.
- `test.ts` (Unit/Integration): `runTests(worktree)` jalankan `bun test` di worktree (regresi gate).
- `security.ts` (Secret Detection): `scanSecrets(worktree)` grep pola secret (fail-closed bila grep error).
- `gate.ts` (Quality Gate): `gate(input, threshold)` — lulus bila tanpa blocker DAN score >= threshold.
- `sandbox` = git worktree terpisah (`loop/wiring/git.ts` `gitIsolate`), bukan modul tersendiri.

## Interface

```ts
/** @brief Jalankan toolchain evaluasi: test + secret-scan -> gate.
 * @param {string} worktree - path worktree terisolasi.
 * @return {EvalOutput} passed + reasons (blocker bila test gagal / secret bocor).
 * @throw {never} kegagalan dikembalikan sebagai status, bukan lempar.
 * @since 0.1.0 */
export function evaluate(worktree: string): EvalOutput;
```

## Alur

1. `sandbox` (git worktree via `gitIsolate`) isolasi eksekusi.
2. `test` → `bun test` di worktree.
3. `security` → secret scan.
4. `gate` → quality gate (tanpa blocker + score >= threshold).
5. `index` gabung → `EvalOutput.passed`.

## Gate (v1)

`gatePass = paretoScore >= threshold ∧ qualityGateGreen` di `loop/states.ts`. `qualityGateGreen = eval.passed` (tanpa blocker: test hijau + secret bersih).

## Edge cases

- Test gagal → `eval.passed=false` → loop `RECOVER`.
- Secret terdeteksi → auto-fail keras (blocker).
- grep error → fail-closed (blocker).

## v1

Konkret: `evaluate(worktree)` = `runTests` (bun test di worktree) + `scanSecrets` (grep secret, fail-closed) → `gate`. Sandbox = git worktree (`gitIsolate`), bukan container. Loop panggil via `LoopDeps.eval?` di state EVALUATE; bila `ctx.worktree` ada, hasilnya jadi `qualityGateGreen` di `gatePass`.

## Cross-link

`ARCHITECTURE.md` §3; `design/critic.md`; `design/loop.md`; `design/resil.md`.
