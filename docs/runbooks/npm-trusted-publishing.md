# Runbook — npm Trusted Publishing (OIDC)

**Goal**: publish `@miruamel/zhi` ke npm registry tanpa long-lived secret. Token npm TIDAK pernah disimpan di GitHub Secrets, .env, atau repo mana pun.

**Why**: long-lived automation tokens = blast radius lebar kalau bocor (1 token compromise = publish/delete ke package manapun di akun). Trusted Publishing (OIDC federation) gantikan dengan short-lived tokens yang diterbitkan GitHub Actions per-run, scoped ke workflow tertentu saja.

**Status**: target. Saat ini `release.yml` masih pakai `NPM_TOKEN` secret. PR terpisah akan migrasi.

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
| Workflow filename | `release.yml`         |
| Environment name  | _kosongkan_ (default) |

npm akan generate unique `id-token` subject identifier, contoh:
`repo:miruamel/zhi:ref:refs/tags/v*:environment:`

Simpan identifier untuk verifikasi di step 4.

## 3. Konfigurasi GitHub workflow

`release.yml` line 45-54 saat ini:

```yaml
- name: Publish to npm (@miruamel/zhi)
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
  run: |
    if [ -z "$NODE_AUTH_TOKEN" ]; then
      echo "::error::NPM_TOKEN secret not configured"
      exit 1
    fi
    npm publish --provenance --access public
```

Ganti jadi:

```yaml
- name: Publish to npm (@miruamel/zhi)
  run: |
    npm publish --provenance --access public
    echo "[release] published to npm registry"
```

**Penting**:

- `id-token: write` permission SUDAH ada di line 16 → tidak perlu tambah.
- `NODE_AUTH_TOKEN` env **dihapus total** — npm CLI otomatis pakai OIDC token via `actions/github-token`.
- `secrets.NPM_TOKEN` di GitHub repo **dihapus** setelah migrasi verified (jaga hygiene).

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
4. Revert PR release.yml ke versi lama.
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

**Versioning**: doc ini `1.0.0`, last reviewed 2026-09-03.
