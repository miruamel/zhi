# design/critic.md — Multi-Critic Plant

## Tujuan

Menilai hasil `generate` lewat kritikus konkret, lalu `aggregate` menghitung skor berbobot untuk memutus layak-commit atau tidak. Dijalankan di state `CRITIQUE`, sebelum `EVALUATE`.

## Komponen (implementasi aktual)

- `plant/<name>/critic.ts` — tiap kritikus = `(FileRecord[]) => Critique` (pure function, sync).
- `plant/compose.ts` — `composeCritiques(files)` menjalankan semua kritikus terdaftar → `Critique[]`.
- `aggregate.ts` — `aggregate(critiques, threshold)` → skor berbobot + gate `passed`.

## Kritikus terimplementasi (konkret)

| Kritikus | Cek | Berat | Sumber |
|---|---|---|---|
| architecture | circular dep, deep-relative, illegal layer edge (mirror CI guard `scripts/ci/architecture/check-circular.ts`) | 1.5 | `plant/architecture/critic.ts` |
| sloc | SLOC per file ≤200 (mandate §6.3) | 1 | `plant/sloc/critic.ts` |
| imports | deep-relative import >3 level (mandate §6.7, §6.11) | 1.5 | `plant/imports/critic.ts` |
| maintainability | duplikasi baris kode (mandate §6, DRY) | 1 | `plant/maintainability/critic.ts` |
| todo | marker TODO/FIXME/XXX (mandate §6 cleanliness) | 1 | `plant/todo/critic.ts` |
| privacy | kebocoran secret high-confidence (private key, AKIA, JWT, DB URL, hardcoded cred) | 1.5 | `plant/privacy/critic.ts` |
| doc | export publik tanpa `@brief` (AGENTS.Style.md) | 1 | `plant/doc/critic.ts` |
| accessibility | `<img>` tanpa `alt`, `onClick` tanpa keyboard handler (WCAG 2.1 AA) | 1 | `plant/accessibility/critic.ts` |

## Interface

```ts
/** @brief Jalankan semua kritikus plant pada kumpulan file.
 * @param {FileRecord[]} files
 * @return {Critique[]} hasil tiap critic (siap di-aggregate).
 * @since 0.1.0 */
export function composeCritiques(files: FileRecord[]): Critique[]

/** @brief Agregasi berbobot -> layak commit?
 * @param {Critique[]} critiques @param {number} [threshold=0.7]
 * @return {AggregateResult} pass + skor + findings.
 * @since 0.1.0 */
export function aggregate(critiques: Critique[], threshold?: number): AggregateResult
```

## Alur

1. `composeCritiques` jalan semua kritikus konkret (sync, pure function; `architecture` delegasi ke CI guard via `spawnSync`).
2. `aggregate` hitung rata-rata berbobot; `passed` bila `score >= threshold` (default 0.7).

## Threshold

- Rata-rata berbobot ≥ 0.7 → `pass` (default).
- Satu kritikus error (`architecture` guard gagal spawn) → skor 0 + finding `infra error`; kritikus lain tetap jalan.

## Edge cases

- `critiques` kosong → `aggregate` fail-closed (`passed: false`, `score: 0`).
- `architecture` guard error (spawn / signal / stderr) → `score: 0` + finding; agregasi lainnya tidak dibatalkan.
Kritikus konkret saat ini: 8 (architecture, sloc, imports, maintainability, todo, privacy, doc, accessibility). Sisa roadmap: DevOps, Legal, DX, Security, Perf, Testing, Style. Catatan scope: `composeCritiques` mengevaluasi **SATU file generated** (`src/cli.ts:57`), sehingga kritikus bersifat content-based per-artefak. DevOps/Legal/DX (LICENSE root, CI config, README) adalah repo-hygiene yang butuh scan repo-wide — butuh stage scan terpisah, bukan kritikus single-file ini. Security tumpang-tindih dengan privacy; Perf/Testing/Style butuh keputusan semantik per-kritikus (ADR singkat) sebelum naik konkret.
## Roadmap

Kritikus tambahan (Doc, DevOps, Legal, Privacy, DX, Accessibility, Security, Perf, Testing, Style) direncanakan naik stub→konkret bertahap di `docs/guides/roadmap.md` v0.2.0+. Setiap penambahan = direktori `plant/<name>/` baru + daftarkan di `composeCritiques` + test. Keputusan semantik per-kritikus (apa yang diukur, bobot, penalti) layak ADR singkat.

## Cross-link

`ARCHITECTURE.md` §3, §4; `design/eval.md`; `docs/adr/ADR-002-critic-pareto.md`; `docs/guides/roadmap.md`.
