# 2026-08-29 — Skipped-Layer / Illegal Layer-Edge Guard (mandate §6.11, AGENTS.md)

## Problem

`audit-log/entries/2026-08-29-circular-import-guard.md` menunda cek skipped-layer (§6.11)
karena engine belum Clean/Hexagonal split. Mandat §6.11 butuh deteksi import yang melompati
lapisan arsitektur. Repo `AGENTS.md` (layer-first root) mendefinisikan arah layer eksplisit:
`src` (app) → `engine` (framework-free, sibling) → `native` (zig→wasm). Maka invarian
arah dependensi:

- `engine` TIDAK boleh impor `src` (engine framework-free, tak boleh bergantung app).
- `src` TIDAK boleh impor `native` langsung (wajib lewat wrapper `engine/model/stream.ts`).
- `native` TIDAK boleh impor `engine`/`src` (standalone zig, tak bisa impor TS).

## Evidence (pre-change grep)

- `grep engine/ from '.*(/|\.\./)src(/|')` → 0 match.
- `grep src/ from '.*(/|\.\./)native(/|')` → 0 match.
- `grep native/ import` → hanya `@import("std")` (zig stdlib). 0 TS import.

Invarian sudah terpenuhi di tree saat ini; cek meng-encode untuk mencegah regresi.

## Change

Extended `scripts/ci/architecture/check-circular.ts` (depth 5, 0-dep):

- Tambah `layerOf(abs)` + tabel `ILLEGAL` (`engine:['src']`, `src:['native']`,
  `native:['engine','src']`).
- Iterasi edge graph; flag edge `fl->tl` jika masuk `ILLEGAL[fl]`.
- Print `SKIPPED/ILLEGAL LAYER EDGE:` lalu `process.exit(1)` bila ada.

SLOC sesudah: ~98 (≤200). CI (`architecture.yml` step "Circular + deep-relative import
check") sudah menjalankan script ini → layer check otomatis ikut.

## Verification

```
bun scripts/ci/architecture/check-circular.ts
ok: 0 circular dependency
ok: 0 deep relative import
ok: 0 illegal layer edge
exit=0
```

## Status

Resolved (local). Menutup item deferred dari `2026-08-29-circular-import-guard.md`.
Push deferred per §2.11 network stall.
