---
name: assetflow-design
description: Use this skill to generate well-branded interfaces and assets for AssetFlow, an asset management platform for manufacturing SMEs. Contains essential design guidelines, colors, type, logo assets, and UI kit components for prototyping both the Admin/Manager desktop web app and the Technician mobile PWA.
user-invocable: true
---

Read `README.md` first for product context, visual foundations, content tone, and iconography rules. Then explore:

- `colors_and_type.css` — all design tokens (colors, type, spacing, radius, shadows, motion)
- `assets/logo-mark.svg`, `assets/logo-wordmark.svg` — brand marks
- `ui_kits/desktop/index.html` — Admin dashboard (reference for admin/manager web surfaces)
- `ui_kits/mobile/index.html` — Technician PWA (reference for mobile field surfaces)
- `preview/*.html` — individual component/token preview cards
- `uploads/PRD_extracted.txt` — product scope and feature list

**When designing:**
- Copy tokens and patterns from `colors_and_type.css`; don't invent new colors.
- Phosphor Icons via CDN (`@phosphor-icons/web@2.1.1`). Regular for 16–22px; Bold for 24px+. Never emoji.
- Mono (JetBrains Mono) for IDs, codes, counters, tabular numbers, eyebrow labels. Sans (Inter Tight) everywhere else.
- Dense-first UI. 13px body default. Hard-ish corners (5/8px). Minimal shadows.
- Status via pill, never via colored icon. OK/Warn/Crit/Info each have 100/500/600 tokens.
- Tone: confident & modern, plainspoken. Sentence case. Second person. Short.

**If invoked without context**, ask what surface (desktop admin, mobile tech PWA, marketing, email), what feature area (assets, work orders, maintenance, dashboard, reports), and what fidelity (mock, clickable prototype, production code).
