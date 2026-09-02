# ADR-007: Kedalaman nesting `engine/`, `src/`, `native/`

- **Tanggal**: 2026-08-29
- **Status**: Accepted
- **Penulis**: miruamel (autonomous executor)
- **Review-date**: 2026-11-27

## Konteks

Mandat §6.4 menetapkan kedalaman MINIMUM 4 tingkat dari root kode ke file produksi. Zhi menetapkan `engine/`, `src/`, `native/` sebagai code-root bersaudara (AGENTS.md, layer-first). Modul seperti `engine/loop/states.ts` hanya 2 tingkat dari code-root (`engine/loop/file`). Desain per-modul (`docs/design/*.md`) secara eksplisit menspesifikasikan struktur 2-3 tingkat ini (mis. `engine/loop/{index,states,pipeline}.ts`).

## Keputusan

Terima kedalaman 2-3 tingkat untuk `engine/`, `src/`, `native/` sebagai penyimpangan terdokumentasi dari §6.4. Alasan: modul kohesif & atomik (≤200 SLOC, 1 tanggung jawab per file); penambahan level buatan (`engine/loop/state/states.ts`) hanya memperpanjang path tanpa nilai arsitektur. Review 90 hari (2026-11-27).

## Alternatif

1. **Dalamkan ke 4 tingkat** (`engine/loop/state/states.ts`) — memenuhi §6.4 tetapi kontradiktif dengan `docs/design/*.md` dan menambah path panjang tanpa manfaat.
2. **ADR exception (dipilih)** — transparan, sesuai §6.9.

## Konsekuensi

- Struktur mengikuti `docs/design/*.md` (2-3 tingkat dari code-root).
- Wajib review 2026-11-27: evaluasi apakah perlu penyesuaian.
- CI guard saat ini tidak memeriksa kedalaman; bila ditambahkan, allowlist `engine/`, `src/`, `native/`.

## Catatan

Bila suatu modul tumbuh >5 file atau butuh sub-domain, dalamkan sesuai §6.2/§6.4 (vertical over horizontal).
