# ADR-001: Layer-First Root Convention

## Status

Accepted — 2026-08-29

## Context

Zhi adalah project TS/Bun/JS/Zig dengan surface luas (loop, orch, build, critic, eval, resil, knowledge, model, native, src). Tanpa konvensi struktur, file akan melebar dan coupling meningkat seiring growth. Kita butuh aturan yang skalabel ke kedalaman 10+ layer tanpa refactoring besar.

## Decision

1. **Root berbasis layer**, bukan domain. `engine/`, `src/`, `native/` sebagai sibling di root. Domain nests di dalam layer-nya (`engine/build/generate.ts`, bukan `features/build/`).
2. **`engine/` adalah sibling `src/`**, zero framework-dep, alias-importable (`engine`). Tidak import Elysia/Next.
3. **Atomic nesting HARD**: ≤4 file per folder (barrel dihitung), ≤200 SLOC per file, vertikal over horizontal. >3 sibling → tambah layer menengah.
4. **Bahasa dipisah per keuntungan**: TS (types/edge), JS (glue self-register), Zig→WASM (hot path). Runtime Bun (eksekusi `.ts`/`.js` native, tanpa `tsc` emit).
5. **Native boundary**: Zig→WASM first; N-API hanya bila profiler buktikan FFI overhead berarti.

## Consequences

- **+** Struktur konsisten di semua project (sama dengan yuxi/xingyu/xuan/shiyu), mudah navigasi.
- **+** Kedalaman vertikal mencegah file raksasa; setiap folder fokus.
- **+** `engine` ter-testable terisolasi (tanpa framework).
- **-** Butuh disiplin: pelanggaran ≤4 file butuh split segera, bukan ditunda.
- **-** Alias `engine` butuh config Bun (tsconfig paths / bundler resolve).

## References

- `AGENTS.md` §Architecture, §Atomic nesting, §Languages, §Native boundary
- `docs/ARCHITECTURE.md` §2, §5
- `README.md` §Konvensi singkat
