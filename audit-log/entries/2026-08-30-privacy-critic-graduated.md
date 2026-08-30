# 2026-08-30 — privacy critic graduated from stub

- **Type**: feat(critic) — graduation dari roadmap v0.2.0
- **Action**: implement `engine/critic/plant/privacy/critic.ts` + `critic.test.ts`; wire ke `composeCritiques` (compose.ts); update `compose.test.ts` + `src/cli.test.ts` assertions (5 → 6 critic).
- **What**: `privacyCritic` deteksi kebocoran secret high-confidence: private-key block, AWS access key id (`AKIA…`), JWT, DB URL dengan kredensial embedded, hardcoded credential assignment. Setiap temuan −0.5 (floor 0), bobot 1.5 (sama dengan architecture — severity keamanan). PII umum (email/NIK) disengaja dikecualikan untuk hindari false-positive; nilai credential diawali `/` (path URL) diabaikan.
- **Why**: mandate §7.1 (secret tidak pernah bocor; deteksi kebocoran adalah prioritas keamanan) + roadmap v0.2.0 (Privacy #8). Pola murni (seperti sloc/todo), tanpa network, tanpa invensi semantik — bounded & low-risk.
- **Test impact**: `compose.test.ts` fixture diperkuat (todo 4 marker, imports 2 deep) agar skor tetap < gate 0.9 meski privacy (perfect, w1.5) menaikkan weighted average; severe fixture +1 deep import agar skor < 0.7. `cli.test.ts` `toHaveLength(5)` → `6`. Tidak ada pelemahan kontrak (bad code tetap gagal gate).
- **Verification**: privacy test 8/0; full suite 144/0 (naik dari 141/3); `bun run scripts/ci/architecture/check-circular.ts` → exit 0.
- **Rollback**: `git revert <sha>`.
- **Status**: resolved (lokal, branch `feat/critic-architecture` belum push — network stall).
- **Next critic stub**: Doc, DevOps, Legal, DX, Accessibility (butuh arah semantik dari user).
