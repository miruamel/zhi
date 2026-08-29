# design/eval.md — Evaluator Toolchain

## Tujuan

Verifikasi hasil lewat **toolchain nyata** (build, test, scan) — gate berbasis *kode*, bukan model judgment. Dijalankan di state `EVALUATE`, setelah `CRITIQUE`. Ini yang membedakan Zhi dari chat-wrapper: keputusan layak-commit didukung fakta tool, bukan vibes.

## Komponen

- `index.ts` (Pipeline Orchestrator + Quality Gate): jahit tahapan → `EvalReport`.
- `sandbox.ts` (Container Sandbox) — **stub v1** (pakai worktree lokal).
- `test.ts` (Build/Compile + Unit + Integration Test).
- `security.ts` (SAST/DAST + Secret Detection).
- `gate.ts` (Perf Benchmark + Compliance + Quality Gate).

## Interface

```ts
/** @brief Jalankan toolchain evaluasi penuh.
 * @param {FileChange[]} changes
 * @return {EvalReport} per-tahap status + gatePass.
 * @throw {never} kegagalan dikembalikan sebagai status, bukan lempar.
 * @since 0.1.0 */
export async function runEval(changes: FileChange[]): Promise<EvalReport>
```

## Alur

1. `sandbox` (v1: worktree lokal) isolasi eksekusi.
2. `test` → build + unit + integration.
3. `security` → SAST/DAST + secret scan.
4. `gate` → perf bench + compliance + quality gate (coverage ≥80%, lint bersih, secret bersih).
5. `index` gabung → `EvalReport.gatePass`.

## Gate (v1)

`gatePass = buildOk ∧ testOk ∧ secretClean ∧ lintClean ∧ coverage≥0.8`.

## Edge cases

- Build gagal → `gatePass=false` → loop `RECOVER`.
- Secret terdeteksi → auto-fail keras (seperti Security critic).
- Test flaky → `test.ts` retry 1x sebelum gagal.

## v1

Konkret: `test` + `security` + `gate`. `sandbox` **stub** (worktree lokal cukup; container bila kelak jalan kode tak-terpercaya).

## Cross-link

`ARCHITECTURE.md` §3; `design/critic.md`; `design/loop.md`; `design/resil.md`.
