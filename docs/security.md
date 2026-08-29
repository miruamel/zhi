# security.md — Trust Boundaries & Hardening

Zhi mengeksekusi kode yang dihasilkan model dan memanggil API eksternal. Keamanan bukan fitur tambahan — bagian dari gate.

## Trust boundaries

| Batas | Trust | Perlakuan |
|---|---|---|
| Goal dari CLI/user | trusted | sanitasi ringan (whitespace, length). Bukan untrusted web. |
| Model output (tool call) | **untrusted** | validasi schema; path dibatasi ke repo; argumen divalidasi. |
| Generated code | semi-trusted | jalan di worktree; `eval/security` scan sebelum commit. |
| 9router / OMP API | trusted-but-limited | rate-limit via `orch/budget`; fallback via `resil/breaker`. |
| `gh` (PR/CI) | trusted | token scoped; hanya operasi repo target. |

## Secret handling

- `NINAROUTER_KEY`, `GITHUB_TOKEN` **hanya** dari env. Tidak pernah di-hardcode atau ditulis ke `zhi.config.ts` / repo.
- `eval/security.ts` jalankan **secret detection** (regex + detector) pada `FileChange.after`. Bila terdeteksi → `gatePass=false` + auto-fail keras (seperti Security critic floor).
- Ledger (`knowledge/store.ts`) **tidak** mencatat secret; `detail` di-redact.
- `.env` di-`.gitignore`; `zhi.config.ts` tidak boleh berisi nilai secret.

## Prompt injection

- Tool call dari model divalidasi terhadap schema tertutup (`ToolCall.name` harus ada di allowlist, `args` sesuai tipe).
- Path file dibatasi ke dalam repo target (tidak boleh `../`, `/etc`, `~`). `build/generate` tolak path di luar worktree.
- Tidak ada exec bebas; perintah shell (bila diperlukan) dari allowlist sempit (`build`, `test`, `lint`). Bukan `rm -rf`, bukan network egress tak-terkontrol.

## Sandbox

- **v1**: eksekusi di **git worktree lokal** terisolasi. Main repo aman (worktree terpisah).
- **Later**: `eval/sandbox.ts` container (read-only FS + seccomp + network egress deny) untuk jalan kode tak-terpercaya (bila Zhi kelak terima input web/untrusted).

## Supply chain

- Dep minimal: **hanya `ink`**. Tidak ada SDK model (pakai `fetch`). Zig WASM di-build lokal (`native/build.zig`), bukan di-unduh.
- `bun audit` + `npm audit` di CI gate.

## Failure mode

- Secret terdeteksi → loop `RECOVER` (patch) atau `abort` bila persisten; tidak pernah commit ber-secret.
- Model coba path di luar repo → `build` tolak + log ke DLQ (kategoriself: injection attempt).

## Cross-link

`design/eval.md` (security stage), `design/critic.md` (Security critic), `design/build.md` (path constraint), `design/resil.md` (DLQ), `configuration.md` (env vars), `AGENTS.md` §Security (ECC rule).
