# assets/

Visual + brand assets for Zhi.

| File             | Purpose                                            | Format     |
| ---------------- | -------------------------------------------------- | ---------- |
| `favicon.svg`    | Tab favicon (X glyph + accent dot, dark background) | SVG 64×64  |
| `logo.svg`       | Wordmark for README and docs                       | SVG 360×96 |
| `og-banner.svg`  | Open Graph social preview (Twitter/GH/LinkedIn)    | SVG 1200×630 |
| `banner.txt`     | ASCII banner for TUI / terminal splash             | text       |

## Favicon / OG dimensions

- `favicon.svg` — used as GitHub repo icon, 64×64 viewBox.
- `og-banner.svg` — renders well at 1200×630 (Twitter card, LinkedIn share, GitHub social preview).
- `logo.svg` — 360×96 viewBox; resizes cleanly down to ~120px wide.

## ASCII banner

`banner.txt` is plain text (UTF-8 no-BOM), usable from `src/tui/viewer.ts` at boot.
See `src/tui/viewer.ts` for the rendering hook.
