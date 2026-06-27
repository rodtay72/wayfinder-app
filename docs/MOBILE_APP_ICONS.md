# Wayfinder mobile home-screen icons

Wayfinder has **two separate user-facing interfaces**. Each portal has its own home-screen name, manifest, and icon folder so Add to Home Screen installs the correct entry point.

## Login branding (PR #111)

All auth/login screens (parent, MHP/counsellor, owner admin) show the Wayfinder logo above the sign-in form.

| Item | Path / value |
|------|----------------|
| Login logo (served URL) | `/assets/brand/wayfinder-logo.png` |
| Repo path | `assets/brand/wayfinder-logo.png` |
| Source asset | `design-assets/pr-111/wayfinder-logo-source.jpeg` |
| Alt text | `Wayfinder` |

Admin (`/admin.html`) has **no separate PWA manifest** — it uses root favicons only and is not an install target.

## Separate PWA install identities (PR #112)

Parent and MHP must **not** share the same install identity. Each manifest has its own `id`, `scope`, and versioned icon paths so mobile browsers do not conflate the two home-screen apps.

| Portal | Manifest `id` | `start_url` | `scope` | Manifest icon `src` |
|--------|---------------|-------------|---------|---------------------|
| Parent | `/index.html?wayfinder-pwa=parent` | `/index.html` | `/index.html` | `/icons/parent/icon-*-20260619-pr111.png` |
| MHP | `/counsellor.html?wayfinder-pwa=mhp` | `/counsellor.html` | `/counsellor.html` | `/icons/counsellor/icon-*-20260619-pr111.png` |

HTML head links (`index.html` / `counsellor.html`) use stable icon filenames with cache-bust query `?v=20260627-pr112`. Manifest JSON references **versioned** icon filenames directly (no query string).

After deploy, if the wrong icon still appears:

1. **Remove both** old home-screen shortcuts (Wayfinder Parent and Wayfinder MHP).
2. Clear Chrome/Safari site install cache if needed.
3. Open `/index.html` and add to home screen — expect **brown family** icon.
4. Open `/counsellor.html` and add to home screen — expect **green counselling** icon.

Android may cache the previous broad `scope: "/"` manifest identity until both shortcuts are removed and reinstalled.

## 1. Parent interface

| Item | Path / value |
|------|----------------|
| Entry page | `/index.html` |
| Home-screen name | **Wayfinder Parent** |
| Manifest | `/manifest-parent.webmanifest` |
| Icons folder | `/icons/parent/` |
| Install artwork | **Brown family icon** (parent portal only) |
| Source asset | `design-assets/pr-111/parent-brown-install-icon-source.png` |

Required PNG files:

| File | Size |
|------|------|
| `icons/parent/icon-512.png` | 512 × 512 |
| `icons/parent/icon-192.png` | 192 × 192 |
| `icons/parent/apple-touch-icon.png` | 180 × 180 |

**Stable filenames** (`icon-512.png`, `icon-192.png`, `apple-touch-icon.png`) are the normal replacement targets when updating artwork.

**Versioned install filenames** (cache-bust copies such as `*-20260619-pr111.png`) are referenced by **manifest JSON** `icons[].src`. HTML head links use **stable filenames** with query-string cache version such as `?v=20260627-pr112`.

Linked from `index.html` only.

## 2. Counsellor / Mental Health Professional interface

| Item | Path / value |
|------|----------------|
| Entry page | `/counsellor.html` |
| Home-screen name | **Wayfinder MHP** |
| Manifest | `/manifest-counsellor.webmanifest` |
| Icons folder | `/icons/counsellor/` |
| Install artwork | **Green counselling icon** (MHP portal only — do not use on parent) |
| Source asset | `design-assets/pr-111/mhp-green-install-icon-source.png` |

Required PNG files:

| File | Size |
|------|------|
| `icons/counsellor/icon-512.png` | 512 × 512 |
| `icons/counsellor/icon-192.png` | 192 × 192 |
| `icons/counsellor/apple-touch-icon.png` | 180 × 180 |

**Stable filenames** are the normal replacement targets for HTML `rel="icon"` links. **Manifest JSON** references versioned install filenames (for example `icon-512-20260619-pr111.png`). HTML uses stable filenames with cache-busting query strings.

Linked from `counsellor.html` only.

Internal Supabase role remains `counsellor`. **Wayfinder MHP** is the user-facing home-screen label only.

## 3. Verify page (shared utility)

`verify.html` is not a main install target. It may use generic root favicon and theme metadata only. It does **not** link a portal manifest or override either install identity.

Optional shared browser favicons at repo root (parent brown icon; Android may fall back here):

| File | Size |
|------|------|
| `favicon.ico` | multi-size ICO (16, 32, 48) |
| `favicon-32.png` | 32 × 32 |
| `favicon-16.png` | 16 × 16 |

## Android Add to Home Screen

Android/Chrome relies on **manifest icons** and normal `rel="icon"` favicons more than `apple-touch-icon`.

Each portal HTML head should include explicit 192×192 and 512×512 `rel="icon"` links for the matching portal folder, plus the portal manifest.

Manifest icon PNGs use an **opaque** cream background (`#F7F4EF`) when flattening source artwork for install reliability.

If Android still shows an old icon after deploy:

- replace or check `favicon.ico`, `favicon-32.png`, `favicon-16.png`, and the portal manifest icon PNGs
- delete the old home-screen shortcut
- Chrome → Settings → Site settings → your site → **Clear & reset**
- clear Chrome cache if needed
- reopen the correct portal URL and add to home screen again

Android launcher and Chrome may cache old shortcut icons aggressively. **Removing and re-adding** the installed app is often required after an icon refresh.

## Design notes

- PNG files only — no base64 in HTML, CSS, or JavaScript.
- No icon data in `app.js`, `content.js`, or `images.js`.
- **Parent install icon:** brown family artwork — never use on counsellor/MHP manifest.
- **Counsellor/MHP install icon:** green counselling artwork — never use on parent manifest.
- **Login logo:** pink Wayfinder logo with tagline — all portals, not used as PWA install icon.
- No parent/child photos, personal data, or clinical imagery in login branding beyond supplied brand assets.

## How to replace icons later

1. Place updated source files in `design-assets/` (or replace the PR #111 sources).
2. Export your new design at the sizes above for the portal you are updating (**parent** or **counsellor**).
3. Replace the **stable** PNG files using the exact same filenames in `icons/parent/` or `icons/counsellor/`.
4. Also replace the **current versioned install** PNG files (same pixel dimensions, versioned filenames such as `icon-512-20260619-pr111.png`) so stable and install assets stay in sync.
5. Bump the `?v=` cache query on `index.html` / `counsellor.html` icon and manifest links.
6. Commit the replaced PNG files, redeploy, then hard refresh or remove and re-add the home-screen shortcut if the old icon is cached.

If icon cache gets stuck again after deploy, create a **new** versioned filename suffix (for example `-20260701`), copy the PNGs to those names, and update only `index.html` / `counsellor.html` plus the matching manifest icon `src` paths. Stable filenames do not need to change for that cache-bust step.

If the old/no icon continues to appear on mobile:

- remove the existing home-screen shortcut
- hard refresh the page
- clear site data/cache if needed
- reopen the correct portal URL
- add to home screen again

Mobile browsers may cache manifest and apple-touch-icon metadata aggressively.

## Do not change for icon updates alone

Do not edit auth, Supabase, SQL, RLS, `app.js` journal/dashboard/profile/invite logic, Parent ID / Child ID generation, membership activation, or public profile publication just to change icons.
