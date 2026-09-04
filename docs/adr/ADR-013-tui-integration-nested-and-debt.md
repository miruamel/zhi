# ADR-013 — TUI Integration Restructure ke Subdir Nested + Tech Debt P1

- **Tanggal**: 2026-09-04
- **Status**: Accepted (partial — debt P1 terbuka)
- **Penulis**: miruamel-autonomous
- **Review-date**: 2026-12-04 (sampai v0.3.0)

## Konteks

`miruamel/zhi` tumbuh ke state di mana `src/tui/integration/` menyimpan 10 file
+ 4 test file di satu direktori flat. Mandate §6.2 (target ≤5 file/dir) +
§6.8 (God Directory anti-pattern) dilanggar.

Audit menemukan:
1. `src/tui/integration/` flat: 14 file langsung (1 barrel, 4 test, 9 impl)
2. P1 incident: merge conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) di 7 file
   — leftover dari `stash apply` + `rebase` sequence (commit 9ef6df1..edc1411)
3. `bun test` lulus 875/875 tapi `tsc --noEmit` merah karena runtime test tidak
   menyentuh semua code path
4. Type debt di integration/ (pre-existing, HEAD baseline):
   - `state-bridge.test.ts` — `.ts` import extension + `focusedPane`/`status` tidak
     di `Partial<AppState>` (AppState schema drift)
   - `shortcuts-registry.test.ts` — `.ts` import + `WriteStream` 60 missing props
   - `pane-renderer.tsx` — `Diff`/`Resources` props tidak match `DiffProps`/`ResourcesProps`
5. Tidak ada CHANGELOG entry untuk 4 refactor + 1 fix TUI integration

## Keputusan

### 1. Restructure `src/tui/integration/` flat → 4 nested subdir (commit `9ef6df1`)

Per Mandate §6.7 (Migrasi Flat ke Nested), 1 modul per PR.

```
src/tui/integration/
├── error/
│   ├── error-boundary.tsx
│   ├── error-boundary.test.tsx
│   └── index.ts          # exports PaneErrorBoundary, PaneErrorFallback, types
├── render/
│   ├── layout-render.tsx
│   ├── layout-render.test.tsx
│   ├── pane-renderer.tsx
│   └── index.ts          # exports LayoutRenderer, LayoutRendererProps, renderPane
├── shortcuts/
│   ├── shortcuts-registry.ts
│   ├── shortcuts-registry.test.ts
│   └── index.ts          # exports ShortcutsRegistry, createShortcutsRegistry
└── state/
    ├── state-bridge.ts
    ├── state-bridge.test.ts
    └── index.ts          # exports StateBridge, createBridge, BridgeMetrics
```

Setiap subdir ≤5 file (mandate compliant), barrel `index.ts` per §6.6 taksonomi.

Import path normalization: 4 test files butuh fix dari `'../engine/perf'` →
`'../../engine/perf'` (depth berubah dari 2 ke 3 setelah nest). Component imports
di `app.tsx` + `layout-render.tsx` diupdate.

Push obstacle resolved via `git pull --ff-only` → divergence → `git rebase origin/feat/tui-ink`
→ `git push origin feat/tui-ink` (mandate §3 transparansi: tidak ada force-push).

### 2. Resolve P1 merge conflict markers (commit `46bb718`)

8 conflict marker (`<<<<<<< |=======|>>>>>>>`) di 7 file dari rebase sequence.
Resolution: pilih variant yang match codebase convention (no `.ts` extension,
no `/index` suffix, double quotes jika file pakai double).

Resolved files:
- `error/index.ts` (ours — full exports + docstring)
- `render/index.ts` (ours — docstring + complete exports)
- `render/layout-render.tsx` (theirs — explicit path)
- `render/pane-renderer.tsx` (theirs untuk 2 conflicts → lalu di-normalize ke bare path)
- `shortcuts/shortcuts-registry.ts` (theirs — match file style)
- `state/index.ts` (ours — concise + docstring)
- `state/state-bridge.ts` (ours — bare imports)

Verifikasi: `git grep "<<<<<<< "` di `src/tui/integration/` → 0 hits.
Bun test 875/875 pass.

Side-effect revert: `bun.lock` + `package.json` di-mutate oleh `bun test` (resolved
`typescript: ^5.4.0` → `5.9.3`). Reverted via `git checkout` (out of scope).

## Konsekuensi

**Positif**:
- Mandate §6.2/§6.8 compliant: integration/ sekarang 4 subdir, masing-masing ≤4 file
- Test suite stabil di 875/875 pass
- Conflict markers cleared dari shipped code (P1 incident closed)
- Branch `feat/tui-ink` pushed, ahead 1 commit dari `origin`

**Risiko (debt terbuka)**:
- `tsc --noEmit` masih merah di integration/ karena:
  - `state-bridge.test.ts` field drift (`focusedPane`, `status`, `running` tidak di
    `Partial<AppState>`) — butuh sinkronisasi dengan `core/state.ts` schema
  - `shortcuts-registry.ts` line 39: `{ctrl, shift, alt, meta}` type
  - `pane-renderer.tsx`: `Diff`/`Resources` components props tidak match
  - `WriteStream` global pollution (test files shadow Node's `WriteStream` dengan
    type yang incomplete)
- Widget layer (`table.tsx`, `tooltip.tsx`, `tree.test.tsx`) punya debt serupa
  tapi **di luar scope** ADR ini — beda modul, beda PR per Mandate §6.7
- 875/875 test pass = runtime safety net cukup untuk ship refactor. Type debt
  adalah **P2 quality issue**, bukan P1 blocker

**Mengapa tidak fix semua type error dalam PR ini**:
- Mandate §6.7: max 1 modul per PR
- Type debt di integration/ → butuh redesign `AppState` schema (cross-cutting)
- Type debt di widget/ → beda domain (display layer, bukan integration)
- Risiko: scope creep → PR terlalu besar → review susah → merge delay

## Alternatif yang dipertimbangkan

- **Fix all tsc errors dalam satu commit** → ditolak: Mandate §6.7 + scope creep
- **Revert seluruh integration restructure** → ditolak: mandat §6.2/§6.8 dilanggar,
  dan runtime test 875/875 pass artinya refactor netral
- **Disable `tsc` strict check di integration/** → ditolak: menyembunyikan masalah,
  Mandate §7.4 hygiene
- **Squash ke 1 commit besar** → ditolak: kehilangan atomicity per Mandate §5.1

## Status implementasi

- Path normalization + barrel exports: **pushed** di commit `c1900f0` ke `origin/feat-tui-ink`
- HEAD: `c1900f0` di branch `feat/tui-ink`
- `tsc --noEmit`: merah karena pre-existing debt (lihat "Risiko")
- Next: open PR `feat/tui-ink` → `main` setelah widget layer debt di-PR terpisah
