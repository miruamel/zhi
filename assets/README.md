# assets/

Visual + brand assets for Zhi.

| File             | Purpose                                               | Format | Size     |
| ---------------- | ----------------------------------------------------- | ------ | -------- |
| `favicon.svg`    | Tab favicon (X glyph + accent dot, dark background)   | SVG    | 64×64    |
| `logo.svg`       | Wordmark for README and docs                          | SVG    | 360×96   |
| `og-banner.svg`  | Open Graph social preview (Twitter/GH/LinkedIn)       | SVG    | 1200×630 |
| `doc-header.svg` | Shared header banner for all docs (top-of-file hero)  | SVG    | 1200×120 |
| `glyphs.svg`     | Section glyphs (PLAN/BUILD/CRITIQUE/EVAL/COMMIT/DONE) | SVG    | 800×96   |
| `banner.txt`     | ASCII banner for TUI / terminal splash                | text   | —        |

## Usage

### In Markdown

GitHub renders SVG when embedded via `![]()`:

```markdown
![Zhi header](assets/doc-header.svg)
```

### In `src/tui/viewer.ts`

```ts
import banner from '../../assets/banner.txt' with { type: 'text' };
```

## Favicon / OG dimensions

- `favicon.svg` — used as GitHub repo icon, 64×64 viewBox.
- `og-banner.svg` — renders well at 1200×630 (Twitter card, LinkedIn share, GitHub social preview).
- `logo.svg` — 360×96 viewBox; resizes cleanly down to ~120px wide.
- `doc-header.svg` — 1200×120; resizes cleanly for any doc width.

## Color palette

| Token      | Hex       | Use                      |
| ---------- | --------- | ------------------------ |
| `bg`       | `#0b0d12` | Backgrounds (dark theme) |
| `bg-2`     | `#11151c` | Gradient end             |
| `accent-1` | `#7cf3a4` | Primary (Zhi green)      |
| `accent-2` | `#5fb3ff` | Secondary (blue)         |
| `accent-3` | `#f59e0b` | Warning / CRITIQUE       |
| `accent-4` | `#a78bfa` | EVAL                     |
| `accent-5` | `#22d3ee` | COMMIT                   |
| `accent-6` | `#34d399` | DONE / success           |
| `text-1`   | `#e6edf3` | Primary text             |
| `text-2`   | `#9aa6b2` | Secondary text           |
