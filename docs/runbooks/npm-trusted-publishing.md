# Runbook — npm Trusted Publishing (OIDC)

**Goal**: publish `@miruamel/zhi` ke npm registry tanpa long-lived secret. Token npm TIDAK pernah disimpan di GitHub Secrets, .env, atau repo mana pun.

**Why**: long-lived automation tokens = blast radius lebar kalau bocor (1 token compromise = publish/delete ke package manapun di akun). Trusted Publishing (OIDC federation) gantikan dengan short-lived tokens yang diterbitkan GitHub Actions per-run, scoped ke workflow tertentu saja.

**Status**: selesai. Migrasi OIDC di PR #38 (`861320d`). Workflow lama `release.yml` sudah di-rename ke `publish.yml`, secret `NPM_TOKEN` sudah dihapus dari repo.

---

## 1. Prasyarat

- Akses ke `https://www.npmjs.com/settings/<your-namespace>/publish` (perlu maintainer @miruamel).
- Akses ke GitHub repo settings (perlu admin).
- npm CLI terinstall lokal untuk verifikasi (`bunx npm@latest` cukup).

## 2. Setup satu kali (npm side)

Di https://www.npmjs.com/package/@miruamel/zhi/access → "Publishing access" → "Add a Trusted Publisher":

| Field             | Value                 |
| ----------------- | --------------------- |
| Provider          | GitHub Actions        |
| Repository owner  | `miruamel`            |
| Repository name   | `zhi`                 |
| Workflow filename | `publish.yml`         |
| Environment name  | _kosongkan_ (default) |

npm akan generate unique `id-token` subject identifier, contoh:
`repo:miruamel/zhi:ref:refs/tags/v*:environment:`

Simpan identifier untuk verifikasi di step 4.

## 3. Konfigurasi GitHub workflow (saat ini)

Workflow final `.github/workflows/publish.yml` (setelah PR #38, `861320d`):

```yaml
name: release

on:
  push:
    tags: [ "v*.*.*" ]
  workflow_dispatch:
    inputs:
      tag:
        description: "Tag to release (e.g. v0.1.1). Leave blank to use latest tag."
        required: false
        default: ""

permissions:
  contents: write
  id-token: write # Required for npm provenance (sigstore)

jobs:
  release:
    name: Build + Publish
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with: { bun-version: 1.4.0 }
      - run: bun install --frozen-lockfile
      - name: Gate (lint + format + typecheck + test)
        run: bun run gate
      - run: bun run build
      - run: bun run native:build
        continue-on-error: true # WASM write barrier di runner mungkin beda
      - name: Publish to npm (@miruamel/zhi) via OIDC Trusted Publisher
        run: |
          npm publish --provenance --access public
          echo "[release] published to npm registry via OIDC"
      - name: Create GitHub Release
        env: { GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}}
        run: |
          TAG="${GITHUB_REF_NAME}"
          # tag validation + awk-extract CHANGES.md notes omitted; lihat file
          gh release create "$TAG" --title "$TAG" --notes "$NOTES" --target main --verify-tag
```

(Lihat `.github/workflows/publish.yml` untuk step GitHub Release lengkap — `awk` parsing CHANGES.md + tag validation.)

**Catatan penting**:

- `id-token: write` (line 16) wajib. Tanpa permission ini, OIDC `npm publish` gagal.
- `NODE_AUTH_TOKEN` env TIDAK ada — npm CLI otomatis pakai OIDC token via `actions/github-token`.
- `secrets.NPM_TOKEN` di GitHub repo sudah dihapus (PR #38 + verif `gh api repos/.../actions/secrets` → `total_count: 0`).
- Workflow di-rename `release.yml` → `publish.yml` agar match npmjs.com Trusted Publisher entry filename.

## 4. Verifikasi

```bash
# A. Cek npm side: trusted publisher ada
gh api https://api.npmjs.org/-/npm/v1/user 2>&1 | head
# Expected: response berisi setting "trusted-publisher"

# B. Cek GitHub side: secret NPM_TOKEN sudah tidak ada
gh secret list --repo miruamel/zhi | grep NPM_TOKEN || echo "OK: NPM_TOKEN absent"

# C. Dry-run publish (tidak push ke registry)
bunx npm@latest publish --dry-run --provenance --access public
# Expected: tarball built, OIDC token fetched, "publish would have happened"

# D. Trigger release via tag, amati log
git tag v0.2.0-rc.1 && git push origin v0.2.0-rc.1
gh run watch
# Expected: step "Publish to npm" jalan tanpa NODE_AUTH_TOKEN env
```

## 5. Rollback plan

Jika migrasi bermasalah dan harus revert ke `NPM_TOKEN` secret:

1. Buka issue dengan label `ops` `P1` (publish pipeline broken).
2. Generate npm token baru di https://www.npmjs.com/settings/tokens (Granular Access Token, scope publish ke @miruamel/zhi only).
3. Set `NPM_TOKEN` di GitHub repo secrets.
4. Revert PR publish.yml ke versi lama (atau `git revert` PR #38 + rename file kembali ke `release.yml`).
5. Re-tag, force-push tag _tidak_ dilakukan (sesuai mandat §3 transparansi); instead, release baru di-version `v0.2.1` (atau major bump) dengan changelog entry menjelaskan rollback.

## 6. Pemeliharaan

- Trusted Publisher entries di npm **tidak expire** selama repo+workflow tidak berubah.
- Jika workflow file di-rename → update entry di npm.
- Jika repo di-transfer ke owner lain → re-add entry.
- Review annually per AGENTS.md §13 refleksi berkala.

## 7. Referensi

- npm docs: https://docs.npmjs.com/generating-provenance-statements
- GitHub OIDC: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect
- Mandat §7.1 (Secret & Data Sensitif), §8.1 (CI/CD & Deploy)

---

**Versioning**: doc ini `1.1.0`, last reviewed 2026-09-03 (post-PR #38 OIDC migration).
