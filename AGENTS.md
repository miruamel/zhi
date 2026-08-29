# AGENTS.md — Zhi (志)

Engineering standards untuk Zhi. Dua-tier: core (file ini, selalu dimuat) + detail digest di `agents/dXX-*.md` (diport dari yuxi bila diperlukan). Core cukup untuk keputusan harian; detail on-demand.

## Architecture — Layer-first root

Split root by **layer**, bukan domain. Domain nests INSIDE layer-nya. Engine sebagai **sibling folder di luar `src/`** (zero framework-dep, alias-importable).

```
<root>/
  src/            # app layer (Bun CLI + ink TUI)
    cli.ts        # argv -> boot loop
    tui/          # ink viewer
  engine/         # SIBLING src/ — alias 'engine', 0 framework-dep
    loop/ orch/ build/ critic/ eval/ resil/ knowledge/ model/
  native/         # Zig sources -> zig build -> out/*.wasm (gitignored)
    stream/ diff/ embed/  build.zig per area
  docs/           # ARCHITECTURE, design/, adr/, standards/
  AGENTS.Style.md # doc standard (Doxygen Universal)
```

- Domain adalah **subfolder layer**, bukan top-level `features/`. Contoh: `engine/build/generate.ts`, `engine/critic/critics.ts`.
- Concern-folders **fractal**: `handlers/ services/ utils/ constants/` berulang di dalam tiap domain bila perlu.
- `engine/` TIDAK boleh import framework (Elysia/Next). TS/JS polos, dikonsumsi via alias `engine`.

## Atomic nesting rules (HARD)

- **≤4 file per folder** (barrel `index` dihitung). Rekomendasi: **3**.
- **≤200 SLOC per file**. Rekomendasi: **140**.
- **Vertikal over horizontal**: >3 sibling → tambah layer menengah, JANGAN melebar. Kedalaman **10+ layer** diharapkan.
- Folder maksimal ~3-4 child node; melebihi kapasitas memaksa split lebih dalam.

Contoh kedalaman generik:
```
engine/critic/critics/security/static/analyzer/index.ts
```

## Languages — JS / TS / Zig, dipisah per keuntungan

TS dijalankan native oleh Bun (TIDAK dikompilasi ke JS).

| Layer | Bahasa | Why |
|---|---|---|
| `engine/*` types/edge | TS | tipe di protocol edge |
| `engine/*` glue self-register | JS | side-effect import, dynamic |
| `engine/*` hot (stream parse, diff, embed) | Zig → WASM | CPU-bound |
| `src/cli.ts` | TS (Bun) | native TS, typed entry |
| `src/tui/*` | TSX (ink) | TUI deklaratif |

- Ekstensi menandai bahasa; satu folder boleh mix `.ts` + `.js` per file.
- **Runtime adalah Bun**: eksekusi `.ts`/`.js` langsung (tanpa `tsc` emit). App layer pakai **Bun-native** (`Bun.serve` bila perlu HTTP side-channel; CLI utama tidak butuh server).

## Native boundary — Zig → WASM first

- `native/<area>/build.zig` build ke `native/out/<name>.wasm` (gitignored).
- Satu thin TS wrapper per modul native (`engine/<area>/zigBridge.ts`) panggil `WebAssembly.instantiate`, ekspos typed API. Konsumer import wrapper, bukan `.wasm` mentah.
- **Mulai dengan WASM.** Pindah ke N-API hanya bila profiler buktikan FFI overhead berarti.

Hot path di Zhi:
- `native/stream/parse.zig` — SSE/token stream → tokens + tool-call extract.
- `native/diff/diff.zig` — unified diff compute.
- `native/embed/embed.zig` — code embedding (vector DB di `knowledge/`).

## Doc standard — `@AGENTS.Style.md` (Doxygen Universal)

Satu-satunya standar dokumentasi. Delimiter tetap native bahasa; isi pakai Doxygen tag (`@brief`, `@param`, `@return`, `@throw`, `@example`, `@see`, `@since`).

```ts
/** @brief Kompres payload in-place. @param {string} raw @return {string} */
```

Enforced via pre-commit + CI (lihat `docs/standards/commit.md` §commit rule).

## How to add

- **Modul domain engine**: `engine/<layer>/<domain>/` dengan fractal `handlers/ services/ utils/ constants/`; tiap folder ≤4 file, split lebih dalam bila perlu.
- **Self-registering module**: `engine/<layer>/<domain>/index.js` daftarkan saat import; import di `engine/<layer>/index.ts`. Pakai `config/` + `schema/` constants — jangan hardcode.
- **Native hot path**: `native/<area>/<name>.zig`, wiring `build.zig` emit `out/<name>.wasm`, ekspos via `engine/<area>/zigBridge.ts`.

## Verification Protocol

Sebelum claim selesai:
1. Setiap perubahan behavioral punya test (unit/integration) yang gagal tanpa fix.
2. `gate.ts` (eval) hijau: build ∧ test ∧ lint ∧ secret-scan ∧ quality-gate.
3. Cross-callsite terupdate (pakai `lsp` rename, bukan text replace).
4. Docs relevan terupdate (`docs/design/*.md`, `EXPLAIN-CHANGES.md`).

## Maturity & Version Velocity

Root `package.json` deklarasikan `"maturity": experimental|stable|mature`. Zhi mulai **experimental** (`0.y.z`). Minor = batch per milestone, bukan 1-fitur-1-minor. Major butuh RFC + migration guide. PATCH = zero behavior change. (Detail: lihat `docs/adr/`.)
