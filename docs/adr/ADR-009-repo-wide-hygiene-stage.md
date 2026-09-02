# ADR-009 — Repo-Wide Hygiene Critic Stage

- Date: 2026-08-30
- Status: Accepted
- Author: miruamel-autonomous

## Context

Roadmap v0.2.0 menaikkan 8 kritikus dari stub → konkret: Architecture, Doc, DevOps, Privacy, DX, Accessibility, Maintainability, Legal. Delapan sudah selesai sebagai kritikus single-file (`composeCritiques(files: FileRecord[])`) yang mengevaluasi SATU artefak generated (`src/cli.ts:57`). Tiga sisanya — DevOps, Legal, DX — adalah repo-hygiene (LICENSE root, CI config, README, AGENTS.md) yang butuh visibilitas root repo, bukan per-file. Memaksanya ke `composeCritiques` tidak mungkin tanpa mechanism change (kritikus single-file tidak menerima root).

## Decision

Tambah stage terpisah `composeHygiene(root: string): Critique[]` di `engine/critic/plant/compose.ts` yang menjalankan tiga kritikus repo-wide (`plant/hygiene/{devops,legal,dx}/critic.ts`). Setiap kritikus membaca file root via `node:fs` (existsSync/readFileSync). CLI dapat perintah `critique:repo` yang menjalankan stage pada `process.cwd()` dan mencetak aggregate. Loop tetap menggunakan `composeCritiques` (per-artefak di worktree); hygiene repo-wide sengaja di luar loop karena loop berjalan di git worktree terisolasi, bukan root repo nyata.

## Alternatives

- **Paksa ke `composeCritiques`**: ditolak — kritikus single-file tidak punya root, butuh refactor antarmuka `FileRecord` yang memecah kontrak ada.
- **Semantic ADR per kritikus (Security/Perf/Testing/Style)**: ditunda — butuh definisi semantik; di luar scope arc ini.
- **Integrasikan hygiene ke state CRITIQUE loop**: ditolak — loop di worktree, bukan root; salah sasaran.

## Consequences

- Kritikus konkret kini 11 (8 single-file + 3 repo-wide).
- `critique:repo` dapat dijalankan mandiri untuk audit higienitas repo.
- Security/Perf/Testing/Style tetap stub — butuh ADR semantik sebelum konkret.
- Arch guard: hygiene critics import `../../../aggregate` (3 naik) — di bawah ambang >3, bersih.

## Review-date

2026-09-30
