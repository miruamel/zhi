---
name: Security incident (rotasi credential)
about: Lapor credential bocor atau kerentanan. Private — JANGAN post detail exploit.
title: '[SECURITY] rotasi <credential-type>'
labels: ['P0', 'security']
assignees: []
---

## ⚠️ Jangan paste secret, token, atau credential value di issue ini.

Issue ini untuk **tracking rotasi**, bukan diskusi insiden. Diskusi detail (jika perlu) → maintainer DM atau security advisory privat.

## Credential yang bocor

- **Tipe**: [ ] npm token | [ ] GitHub PAT | [ ] SSH key | [ ] API key | [ ] Lainnya: ___
- **Scope**: package(s) / repo(s) / service yang terekspos: ___
- **Identifier** (prefix only, 4 char pertama cukup, contoh `npm_5xKx…`): `_____`
- **Tanggal/waktu exposure**: ___
- **Surface bocor**: [ ] chat transcript | [ ] screenshot | [ ] commit history | [ ] issue publik | [ ] Lainnya: ___

## Dampak yang mungkin

- [ ] Bisa publish ke package npm tanpa izin
- [ ] Bisa push ke repo tanpa izin
- [ ] Bisa akses data user
- [ ] Bisa akses infrastructure
- [ ] Lainnya: ___

## Tindakan segera (urutan eksekusi)

- [ ] **Step 1**: Revoke credential di source-of-truth (npmjs.com / github.com / dsb).
- [ ] **Step 2**: Generate credential baru (kalau perlu; prefer pivot ke OIDC / Trusted Publishing).
- [ ] **Step 3**: Audit log penggunaan antara waktu exposure → revocation. Tandai anomali.
- [ ] **Step 4**: Update secret store (GitHub Secrets / 1Password / dsb). Jangan commit.
- [ ] **Step 5**: Verifikasi pipeline jalan dengan credential baru.
- [ ] **Step 6**: Tutup issue ini. Tambah entry di `CHANGES.md` `[Unreleased]` → `Security` section.

## Pencegahan (post-mortem)

- [ ] Migrasi ke short-lived credential (OIDC federation / workload identity)?
- [ ] Tambah pre-commit hook: detect secret pattern (gitleaks, trufflehog)?
- [ ] Tambah CI scan: secret detection di PR?
- [ ] Update docs/runbooks/ untuk prosedur rotasi?
- [ ] Lainnya: ___

## Referensi

- `docs/runbooks/npm-trusted-publishing.md` — npm OIDC migration
- `AGENTS.md` §Security
- Mandat §7 (Keamanan, Kepatuhan, & Higiene)
