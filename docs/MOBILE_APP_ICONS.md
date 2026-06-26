# Wayfinder mobile home-screen icons

Wayfinder has **two separate user-facing interfaces**. Each portal has its own home-screen name, manifest, and icon folder so Add to Home Screen installs the correct entry point.

## 1. Parent interface

| Item | Path / value |
|------|----------------|
| Entry page | `/index.html` |
| Home-screen name | **Wayfinder Parent** |
| Manifest | `/manifest-parent.webmanifest` |
| Icons folder | `/icons/parent/` |

Required PNG files:

| File | Size |
|------|------|
| `icons/parent/icon-512.png` | 512 × 512 |
| `icons/parent/icon-192.png` | 192 × 192 |
| `icons/parent/apple-touch-icon.png` | 180 × 180 |

Linked from `index.html` only.

## 2. Counsellor / Mental Health Professional interface

| Item | Path / value |
|------|----------------|
| Entry page | `/counsellor.html` |
| Home-screen name | **Wayfinder MHP** |
| Manifest | `/manifest-counsellor.webmanifest` |
| Icons folder | `/icons/counsellor/` |

Required PNG files:

| File | Size |
|------|------|
| `icons/counsellor/icon-512.png` | 512 × 512 |
| `icons/counsellor/icon-192.png` | 192 × 192 |
| `icons/counsellor/apple-touch-icon.png` | 180 × 180 |

Linked from `counsellor.html` only.

Internal Supabase role remains `counsellor`. **Wayfinder MHP** is the user-facing home-screen label only.

## 3. Verify page (shared utility)

`verify.html` is not a main install target. It may use generic root favicon and theme metadata only. It does **not** link a portal manifest or override either install identity.

Optional shared browser favicons at repo root:

| File | Size |
|------|------|
| `favicon-32.png` | 32 × 32 |
| `favicon-16.png` | 16 × 16 |

## Design notes

- PNG files only — no base64 in HTML, CSS, or JavaScript.
- No icon data in `app.js`, `content.js`, or `images.js`.
- Simple brand mark: soft cream background (`#F7F4EF`), sage/forest rounded shape, **W** motif.
- No parent/child photos, personal data, or clinical imagery.

## How to replace icons later

1. Export your new design at the sizes above for the portal you are updating (**parent** or **counsellor**).
2. Replace the PNG files using the **exact same filenames** in `icons/parent/` or `icons/counsellor/`.
3. Update the matching manifest only if filenames or sizes change.
4. Commit the replaced PNG files (and manifest if needed), redeploy, then hard refresh or remove and re-add the home-screen shortcut if the old icon is cached.

## Do not change for icon updates alone

Do not edit auth, Supabase, SQL, RLS, `app.js` journal/dashboard/profile/invite logic, Parent ID / Child ID generation, membership activation, or public profile publication just to change icons.
