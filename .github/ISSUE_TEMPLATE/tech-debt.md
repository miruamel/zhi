---
name: Tech debt / hygiene gap
about: Lacak hygiene gap atau debt teknis yang butuh fixing.
title: '[debt] <deskripsi singkat>'
labels: ['debt', 'ops']
assignees: []
---

## Problem

<1-3 kalimat: apa yang broken / missing / suboptimal, dampaknya ke engineer atau CI.>

## Evidence

- File / path / line:
- Output CI / test:
- Skenario reproduksi (kalau applicable):

## Proposed fix

<pendekatan yang disarankan; tetap terbuka untuk alternatif.>

## Priority

- [ ] P0 — data loss / security / CI merah di main
- [ ] P1 — nge-block kerja harian / eksposur tinggi ke bugs
- [ ] P2 — nge-noise tapi recoverable
- [ ] P3 — nice-to-have, jangka panjang

## Definition of done

- [ ] Fix ter-implement
- [ ] Test menambah/memperbarui
- [ ] `bun run gate` hijau
- [ ] `CHANGES.md` `[Unreleased]` ter-update (kalau behavior change)
- [ ] PR merged ke main
- [ ] Issue di-close dengan referensi commit

## Out of scope

<apa yang TIDAK dilakukan di issue ini — biar tidak melebar.>

## References

<ADR, design doc, atau issue terkait.>
