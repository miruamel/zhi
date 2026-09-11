# ADR-018: Tahan upgrade ink 4→7 dan react 18→19

## Status

Accepted (deferred — re-evaluate per milestone)

## Context

Zhi package.json mengunci `ink@4.4.1` dan `react@18.3.1`. Ink 7.0 dan React 19.3.0 tersedia. Upgrade ini menawarkan performa input yang lebih baik (useEffectEvent, no re-subscribe per render) dan alignment dengan React 19 concurrent model, tapi mengandung risiko breaking change.

## Decision

**Tahan upgrade.** Tunggu milestone v0.1.13+ sebelum mengevaluasi. Alasan:

1. **Bun 1.4.2 compatibility unknown.** Ink 7.0 membutuhkan Node.js 22+. Kompatibilitas Bun dengan React 19 + Ink 7 tidak teruji. Bun sendiri masih 1.x. Upgrade sekarang berisiko break runtime yang tidak terdeteksi oleh CI (CI menggunakan Bun, tapi Ink 7.0 di-desain untuk Node 22+).

2. **Codebase migration surface kecil.** Audit menunjukkan:
   - Tidak ada `forwardRef` usage → React 19 ref-as-prop deprecation tidak berdampak.
   - Tidak ada `key.delete` usage → Ink 7.0 `key.delete`→`key.backspace` breaking change tidak berdampak.
   - Key prop yang digunakan (`return`, `escape`, `up`, `down`, `tab`, `ctrl`) semuanya stabil di Ink 7.0.

3. **Prioritas.** TUI expansion (target 50k-120k SLOC) adalah milestone v0.1.13. Upgrade ink/react di tengah expansion berisiko memperlambat pengembangan dengan debugging compatibility yang tidak terduga. Lebih baik lakukan upgrade setelah TUI stabil, di milestone berikutnya, sebagai "modernisasi stack" terencana.

## Alternatives Considered

- **Upgrade sekarang (PR besar):** Tinggi risiko — Bun compat unknown, React 19 migration di 17k+ SLOC. Tunda.
- **Upgrade di branch terpisah, tanpa merge:** Evaluasi teknis tapi tidak ada nilai produksi. Dilakukan di milestone v0.1.13 sebagai proof-of-concept.
- **Tahan selamanya:** Tidak masuk akal — Ink 4 usang, React 18 tidak menerima fitur baru. Upgrade harus dilakukan, hanya waktunya.

## Consequences

- **Positif:** TUI tetap stabil di ink 4 + react 18 yang terbukti. Tidak ada regression risiko selama TUI expansion.
- **Negatif:** Tetap pada stack yang tidak mendapatkan improvement input handling (useEffectEvent). Teknis debt bertambah jika ink 4 di-deprec.
- **Mitigasi:** Re-evaluate di awal milestone v0.1.13. Buat branch `chore/ink-react-upgrade` untuk evaluasi teknis. Jika Bun sudah support React 19 + Ink 7, upgrade sebagai PR terpisah dengan migration guide.

## Justifikasi Kebutuhan

Tidak ada kebutuhan bisnis langsung untuk upgrade. Upgrade adalah perbaikan teknis (performance + maintainability). Prioritasnya di bawah TUI expansion yang memiliki nilai pengguna langsung.

## Date: 2026-09-11

## Author: miruamel

## Review Date: 2026-09-18 (awal milestone v0.1.13)

## Reviewed By: miruamel
