# design/critic.md — Multi-Critic Plant

## Tujuan

Menilai hasil `generate` lewat **12 kritikus**, lalu meta-aggregator menghitung *weighted Pareto frontier* untuk memutus layak-commit atau tidak. Dijalankan di state `CRITIQUE`, sebelum `EVALUATE`.

## Komponen

- `cache.ts` (Semantic Cache): similarity embedding dari `knowledge/vectors.ts`.
- `critics.ts` (12 Critics registry): tiap kritikus = `(FileChange[], Ctx) => CriticScore`.
- `aggregate.ts` (Meta-Critic Weighted Pareto): gabung skor → keputusan.

## 12 Kritikus

| # | Kritikus | Cek | v1 |
|---|---|---|---|
| 1 | Security | kerentanan (injeksi, secret, unsafe API) | konkret |
| 2 | Perf | regresi perf, algoritma mahal, N+1 | konkret |
| 3 | Architecture | batas layer, coupling, SRP | stub |
| 4 | Testing | cakupan test, assertion bermakna | konkret |
| 5 | Doc | docstring publik, `EXPLAIN-CHANGES.md` | stub |
| 6 | DevOps | CI, Dockerfile, script deploy | stub |
| 7 | Legal | lisensi, kode copyleft/third-party | stub |
| 8 | Privacy | PII, logging sensitif | stub |
| 9 | Style | lint, konvensi (`AGENTS.md`) | konkret |
| 10 | DX | ergonomi API publik | stub |
| 11 | Accessibility | ARIA, kontras (bila UI) | stub |
| 12 | Maintainability | duplikasi, kompleksitas siklomatik | stub |

## Interface

```ts
/** @brief Jalankan semua kritikus (cache-aware).
 * @param {FileChange[]} changes @param {Ctx} ctx
 * @return {CriticScore[]} skor per kritikus (0..1) + alasan.
 * @since 0.1.0 */
export async function runCritics(changes: FileChange[], ctx: Ctx): Promise<CriticScore[]>

/** @brief Agregasi Pareto berbobot -> layak commit?
 * @param {CriticScore[]} scores
 * @return {Aggregate} pass + alasan + skor gabungan.
 * @since 0.1.0 */
export function aggregate(scores: CriticScore[]): Aggregate
```

## Alur

1. `cache.ts` cek similarity; bila mirip hasil lama → pakai skor cache (hindari eksekusi mahal).
2. `critics.ts` jalan (konkret via tool; stub via rule ringan / `abstain`).
3. `aggregate.ts` hitung Pareto: tidak ada kritikus di bawah **floor** DAN mayoritas di atas **target** → `pass`.

## Threshold (v1)

- Security < floor → **auto-fail** (tidak peduli Pareto).
- Rata-rata berbobot ≥ 0.7 → `pass`.
- Detail bobot + floor di `ADR-002`.

## Edge cases

- Semua stub (belum diimplementasi) → `aggregate` abstain → fallback ke eval gate (`eval/gate.ts`).
- Cache hit → skip eksekusi mahal.
- Satu kritikus error → skor `abstain`, tidak membatalkan agregasi.

## v1

Konkret: `cache` + Security/Perf/Testing/Style + `aggregate`. 8 sisanya **stub** di registry (impl `not-implemented`, return `abstain` + `upgrade path`).

## Cross-link

`ARCHITECTURE.md` §3, §4; `design/eval.md`; `design/knowledge.md`; `docs/adr/ADR-002-critic-pareto.md`.
