# ADR-010 — Complete Critic Graduation (Security/Perf/Testing/Style)

- Date: 2026-08-30
- Status: Accepted
- Author: miruamel-autonomous

## Context
v0.1.0 meninggalkan 4 stub kritikus: Security, Perf, Testing, Style. Roadmap v0.2.0 menargetkan konkretisasi. DevOps/Legal/DX sudah lulus via stage repo-wide (ADR-009). Sisa 4 butuh semantik konkret low-false-positive agar tidak cargo-cult.

## Decision
- **Security** (single-file, `composeCritiques`): deteksi sink injeksi eksplisit (eval, new Function, innerHTML=, dangerouslySetInnerHTML, child_process.exec/execSync). Bobot 1.5, penalti 0.3/finding. Melengkapi privacy (secret) — tidak tumpang-tindih.
- **Perf** (single-file): deteksi debug-noise (debugger;, console.log/debug/warn/error/info). Bobot 1.0, penalti 0.15/finding.
- **Style** (single-file): deteksi weak-type (`: any`, `as any`, `@ts-ignore`, `@ts-nocheck`). Bobot 1.0, penalti 0.15/finding. Selaras ts-no-any project rule.
- **Testing** (repo-wide, `composeHygiene`): tiap source di src/ + engine/ tanpa test sibling = finding. Bobot 1.0, penalti 0.2/finding.

Generator (`engine/build/generate.ts`) tidak emit pola tersebut (terverifikasi grep), sehingga kritikus tidak false-positive pada artefak generated di loop.

## Alternatives
- Security sebagai subset privacy: ditolak — privacy = secret, security = injection sink; domain beda.
- Perf cek N+1/loop tak-terbatas statis: ditolak — false-positive tinggi, butuh profiler.
- Testing wajib 100% coverage: ditolak — kritikus hanya laporkan, bukan gate repo.

## Consequences
- 15 kritikus konkret (11 single-file + 4 repo-wide). Arc kritik selesai.
- `critique:repo` laporkan higienitas repo termasuk kekurangan test (visibility, bukan gate).
- Arch guard bersih (import ≤3 naik).

## Review-date
2026-09-30
