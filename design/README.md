# AssetFlow — Design System

**Asset management platform for manufacturing SMEs.** Register, scan, maintain, and monitor every physical asset on the floor — from a desktop HQ or a phone in-hand. This design system defines how AssetFlow looks, feels, and reads across the web app, PWA, and marketing surfaces.

## Product context

AssetFlow helps manufacturing SMEs (10–500 employees) replace spreadsheet-based asset tracking with a single SaaS platform. It combines:

- **Asset Registry** — inventory of every machine, vehicle, tool, with full profile and edit history
- **QR/Barcode Scanning** — browser-based PWA scanning, printable Avery-compatible labels
- **GPS Tracking** — last-known location on an embedded map (Pro+)
- **Maintenance Scheduling** — time- or usage-based, auto-generates work orders
- **Work Orders** — Open → In Progress → Completed flow, with photo attachments
- **Alerts** — email + in-app, threshold-configurable
- **Dashboard & Reports** — live asset health, exportable PDF/CSV

**Three personas:**
1. **Admin** (Sarah, Operations Manager) — registers assets, configures schedules, manages users. Desktop-first.
2. **Technician** (Marcus, Field Worker) — scans, logs maintenance, reports issues. Mobile PWA only.
3. **Manager** (David, Plant Manager) — dashboards, approvals, reports. Desktop-first.

Source: `uploads/AssetFlow_MVP_PRD.pdf` → extracted to `uploads/PRD_extracted.txt`.

---

## Visual foundations

**Aesthetic direction:** *Industrial-operational.* Dense, technical, schematic. Light-primary with deep-ink UI chrome. Reads like a factory HMI crossed with a modern SaaS.

**Color.** Warm-white paper (`#FAFAF9`) as the bg, deep ink (`#0E1116`) for text and solid chrome, **orange `#FF6B35`** as the single brand accent (CTAs, logo dot, highlights), **blue `#3B82F6`** as the info/focus color. Status colors are operational: **OK green**, **warn amber**, **crit red**. No gradients. No purple. No tints below Ink-150.

**Type.** **Inter Tight** (sans, workhorse — 400/500/600/700) + **JetBrains Mono** (technical — 400/500/600). Mono is used *everywhere* IDs, codes, counters, tabular data, and eyebrow labels appear. Body defaults to 13px; tables go as tight as 11–12px. Letter-spacing is slightly negative on headings (`-0.02em`) for density.

**Spacing.** 4px base. Dense by default — Linear/Airtable territory. 8px / 12px / 16px are the most common gaps.

**Radius.** Hard-ish — 5px default, 3px for small chips, 8px for cards. Never pill-shaped on containers; pills only on status tags.

**Shadows.** Minimal. Hairline `shadow-0` (1px border) is the default elevation. `shadow-1` on raised cards. `shadow-3` only on popovers/modals. No glowy/soft shadows.

**Background motif.** Blueprint grid — 8px minor + 64px major double-layer grid at very low opacity, reserved for empty states, marketing hero, printable assets. Not a default page bg.

**Motion.** Fast and functional. 120ms for hover/press, 180ms for panel open, 260ms for route change. `cubic-bezier(.2, .7, .2, 1)`. No bounces.

**Hover states.** Secondary buttons: bg darkens to Ink-100. Table rows: bg → Ink-050. Links: color → Ink-900.

**Press states.** `translateY(0)` + bg one step darker. No shrink.

**Borders.** 1px solid `--af-border` (`#E2E5EA`) is the dominant separator. Dashed 1px Ink-150 for internal/secondary divisions (e.g. form field groups). Double-lines reserved for table section breaks.

**Imagery.** Product has none in MVP — placeholders only. Illustrations, when needed, are *schematic line drawings* (1.5px strokes, orange accent dot). No photography, no gradients.

---

## Content fundamentals

**Tone:** Confident & modern. Plainspoken, operational, light personality. *"Keep every asset accounted for"* not *"Revolutionary asset intelligence."*

- **Voice:** Second person ("you"), present tense. Active verbs. Short.
- **Casing:** Sentence case for UI copy and buttons. ALL CAPS *only* in eyebrow labels (and monospaced).
- **No emoji.** Ever. Icons (Phosphor) do that job.
- **Dates & numbers:** Relative when helpful (`in 3d`, `2d overdue`), absolute when precise (`Apr 27`). Tabular numerals on all counts, costs, durations.
- **IDs:** Mono, uppercase, hyphenated. `AF-0042-PRESS-H4`, `WO-2174`, `LOC·B3·Z2`.
- **Empty states:** One sentence what + one button how. *"No assets yet. Import a CSV or add one manually."*
- **Error messages:** Direct, say what happened + what to do. *"Cost must be positive"* not *"Invalid input"*.

---

## Iconography

**Phosphor Icons** — via CDN `@phosphor-icons/web@2.1.1`. Regular weight at 16/20/22px; Bold weight at 24px+ for prominent places. Orange fill only when indicating brand/active state. Never colored by status (status is signaled by pill, not icon).

Common icons: `qr-code`, `wrench`, `gauge`, `map-pin`, `factory`, `clipboard-text`, `bell`, `calendar-dots`, `package`, `warning`, `check-circle`, `camera`, `user`, `gear`, `magnifying-glass`.

No emoji. No Unicode glyphs as icons. No hand-rolled SVGs beyond simple shapes and the logo mark.

---

## Index

| File | What |
|---|---|
| `colors_and_type.css` | All design tokens — colors, type, spacing, radius, shadows, motion |
| `assets/logo-mark.svg` | Square brand mark (isometric cube + orange dot) |
| `assets/logo-wordmark.svg` | Mark + "AssetFlow" wordmark |
| `preview/*.html` | Design system preview cards — visible in the Design System tab |
| `ui_kits/desktop/` | Admin + Manager web app kit |
| `ui_kits/mobile/` | Technician PWA kit |
| `SKILL.md` | Claude skill definition — so this system can be reused |
| `uploads/PRD_extracted.txt` | Source of truth for product scope |

---

## Caveats & open questions

- **Fonts are Google-hosted.** If you'd like custom typefaces (e.g. Söhne, Geist), swap in the `--af-font-sans` / `--af-font-mono` tokens and add the `@font-face` declarations.
- **Logo is a first-pass mark.** The isometric cube + orange dot reads as "stacked asset" — happy to iterate.
- **Dark mode is not yet defined.** Tokens are structured to support it, but only the light theme is built.
- **No marketing surfaces yet** — pricing page, landing, emails. Said "desktop + mobile first" per your selection.
