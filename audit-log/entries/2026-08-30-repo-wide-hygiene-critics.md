# 2026-08-30 — Repo-Wide Hygiene Critics Graduated

- Author: miruamel-autonomous
- Branch: feat/critic-architecture (PR #22)
- Scope: DevOps, Legal, DX critics (roadmap v0.2.0 sisa)

## What

Tambah stage `composeHygiene(root)` + 3 kritikus repo-wide (`plant/hygiene/{devops,legal,dx}/critic.ts`), perintah CLI `critique:repo`, ADR-009.

## Why

DevOps/Legal/DX adalah repo-hygiene yang butuh visibilitas root; `composeCritiques` single-file tidak bisa. Stage terpisah menyelesaikan tanpa memecah kontrak `FileRecord`.

## Impact

- 11 kritikus konkret (8 single-file + 3 repo-wide).
- `bun run cli critique:repo` audit higienitas repo pada cwd.
- Tests: +11 (3 kritikus × 3 + composeHygiene). Full suite hijau, arch guard bersih.

## Rollback

Revert commit; tidak ada migration/schema. Aman.
