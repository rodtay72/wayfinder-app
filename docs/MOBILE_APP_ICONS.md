# Wayfinder mobile home-screen icons

This document explains how Wayfinder mobile home-screen and PWA icon assets work, and how to replace them later without touching app logic.

## Files that control the mobile home-screen icon

Root-level PNG files (stable filenames):

| File | Purpose |
|------|---------|
| `icon-512.png` | PWA manifest large icon |
| `icon-192.png` | PWA manifest standard icon |
| `apple-touch-icon.png` | iOS / Apple Add to Home Screen |
| `favicon-32.png` | Browser tab icon (32 px), optional |
| `favicon-16.png` | Browser tab icon (16 px), optional |

Related static metadata:

| File | Purpose |
|------|---------|
| `site.webmanifest` | Web app manifest (`name`, `theme_color`, icon list) |
| `index.html` | Parent portal `<head>` links |
| `counsellor.html` | Mental Health Professional workspace `<head>` links |
| `verify.html` | Email verification page `<head>` links |

Icons are **not** embedded in `app.js`, `content.js`, `images.js`, CSS, or HTML as base64. They are ordinary PNG files at the repo root.

## Required dimensions

- `icon-512.png` — **512 × 512** px
- `icon-192.png` — **192 × 192** px
- `apple-touch-icon.png` — **180 × 180** px
- `favicon-32.png` — **32 × 32** px (if used)
- `favicon-16.png` — **16 × 16** px (if used)

Current design uses Wayfinder brand colours: soft cream background (`#F7F4EF`) and sage/forest mark (`#2f473d`) with a simple **W** motif. No photos, personal data, or clinical imagery.

## How to change the icon later

1. Export your new design at the sizes above.
2. Replace the PNG files using the **exact same filenames** in the repository root.
3. Commit only the replaced PNG files (and update `site.webmanifest` only if filenames or sizes change).
4. Redeploy the app.
5. On devices that already have a home-screen shortcut, hard refresh the site or remove and re-add the shortcut if the old icon is cached.

## Do not change for icon updates alone

Do **not** edit these areas just to change icons:

- Auth, Supabase, SQL, or RLS
- `app.js` journal, dashboard, profile, invite, or role logic
- Parent ID / Child ID generation
- Membership activation or public profile publication
- ALIGN/CAB product flows

Icon updates should remain static asset replacements plus optional manifest/HTML metadata if paths change.
