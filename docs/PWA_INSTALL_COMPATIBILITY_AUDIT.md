# PWA Install Compatibility Audit

**PR #121 — Mobile PWA install compatibility hardening**

**Last updated:** 2026-06-29

Read first:

- [MOBILE_APP_ICONS.md](./MOBILE_APP_ICONS.md)
- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)

---

## 1. Observed concern

During Android mobile testing on **Google Pixel** and **Honor** devices, installing Wayfinder to the home screen through mobile browsers showed a warning suggesting the installed web app **may be outdated** or **compatible with an earlier version**.

This is treated as a **PWA / mobile install compatibility** issue — not a product-model, payment, or auth change.

Likely contributing factors (pre-PR #121):

- Stale home-screen shortcuts cached from an earlier broad `scope: "/"` manifest (pre-PR #112).
- `start_url` did not match manifest `id` query identity (`wayfinder-pwa=parent` / `wayfinder-pwa=mhp`).
- Manifest missing explicit `prefer_related_applications: false` and `display_override`.
- Combined icon `purpose: "any maskable"` instead of separate install/maskable entries.
- Manifest/HTML cache-bust version unchanged since PR #112.

---

## 2. Current parent / MHP manifest state (after PR #121)

| Field | Parent (`manifest-parent.webmanifest`) | MHP (`manifest-counsellor.webmanifest`) |
|-------|----------------------------------------|----------------------------------------|
| `id` | `/index.html?wayfinder-pwa=parent` | `/counsellor.html?wayfinder-pwa=mhp` |
| `name` / `short_name` | Wayfinder Parent | Wayfinder MHP |
| `start_url` | `/index.html?wayfinder-pwa=parent` | `/counsellor.html?wayfinder-pwa=mhp` |
| `scope` | `/index.html` | `/counsellor.html` |
| `display` | `standalone` | `standalone` |
| `display_override` | `standalone`, `minimal-ui`, `browser` | same |
| `prefer_related_applications` | `false` | `false` |
| `theme_color` / `background_color` | `#2f473d` / `#F7F4EF` | same |
| `lang` / `dir` | `en` / `ltr` | same |
| Icons (manifest) | 192 + 512, `any` + `maskable` (versioned PR #111 PNGs) | same (green MHP artwork) |
| Icons (HTML head) | stable `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` + `?v=20260629-pr121` | same |
| Service worker | **None** | **None** |

### Scope decision (not broadened in PR #121)

**Kept narrow:** `scope: "/index.html"` and `scope: "/counsellor.html"`.

**Why:** PR #112 separated parent and MHP install identities after a shared broad scope caused wrong icons and conflated shortcuts. Broadening scope to `/` would risk merging identities again on Android OEM browsers.

**Safe for this SPA:** Supabase email redirects use `window.location.pathname` (`/index.html` or `/counsellor.html`) — still within each manifest scope. In-app navigation does not leave the entry HTML file.

**Not changed:** Admin (`/admin.html`) remains a non-install target with root favicons only.

---

## 3. Changes made in PR #121

### Manifests (`manifest-parent.webmanifest`, `manifest-counsellor.webmanifest`)

- Aligned `start_url` with manifest `id` query (`?wayfinder-pwa=parent` / `?wayfinder-pwa=mhp`).
- Added `prefer_related_applications: false`.
- Added `display_override: ["standalone", "minimal-ui", "browser"]`.
- Added `lang`, `dir`, `orientation`.
- Split icons into separate `purpose: "any"` and `purpose: "maskable"` entries for 192 and 512.
- Preserved separate parent/MHP identities, versioned manifest icon paths, and narrow scopes.

### HTML entry pages (`index.html`, `counsellor.html`)

- Bumped manifest and icon cache-bust query to `?v=20260629-pr121`.
- No app runtime, auth, or routing logic changes.

### Icons

Verified on disk (no new icon files required):

- `icons/parent/icon-192-20260619-pr111.png`, `icon-512-20260619-pr111.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`
- `icons/counsellor/icon-192-20260619-pr111.png`, `icon-512-20260619-pr111.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`

---

## 4. Chromium installability checklist (post-PR #121)

| Requirement | Parent | MHP |
|-------------|--------|-----|
| `name` or `short_name` | Yes | Yes |
| Icons 192×192 and 512×512 | Yes | Yes |
| `start_url` | Yes | Yes |
| `scope` | Yes | Yes |
| `display` or `display_override` | Yes | Yes |
| `prefer_related_applications` false or absent | `false` | `false` |
| `theme_color` / `background_color` | Yes | Yes |
| HTTPS deploy | Required at runtime (Vercel) | Same |
| Service worker | Not required; none added | Same |

---

## 5. Remaining follow-up recommendations

| Item | Priority | Notes |
|------|----------|-------|
| **Physical Android re-test** | High | Pixel + Honor after deploy; remove old shortcuts first |
| **Service worker (future PR)** | Medium | **Not in PR #121.** If added later: cache static shell only; **never** cache Supabase auth/API, journal, or private reflection responses; network-first / no-store for auth and parent data |
| **Manifest scope review** | Low | Revisit only if SPA routing adds separate HTML entry points |
| **OEM browser matrix** | Medium | Samsung Internet, Honor browser — document pass/fail after owner test |
| **iOS Safari Add to Home Screen** | Low | Separate from Android warning; apple meta tags already present |
| **Update MOBILE_APP_ICONS.md** | Low | Optional doc sync for `start_url` + PR #121 cache version |

---

## 6. Mobile test checklist

Run after deploy. **Remove old Wayfinder home-screen icons first.** Clear site data/cache if a stale install persists.

### Install identity

- [ ] Android Chrome (latest): install **parent** from `/index.html` → name **Wayfinder Parent**, brown family icon
- [ ] Android Chrome (latest): install **MHP** from `/counsellor.html` → name **Wayfinder MHP**, green counselling icon
- [ ] Honor browser (if available): repeat parent + MHP install checks
- [ ] Samsung Internet (if available): repeat parent + MHP install checks
- [ ] No “outdated / earlier version” warning on fresh install (record device + browser if warning persists)

### Runtime regression (must still pass)

- [ ] Parent installed app opens parent portal (`/index.html`)
- [ ] MHP installed app opens counsellor/MHP portal (`/counsellor.html`)
- [ ] Sign-in still works (verified email gate unchanged)
- [ ] Verified parent dashboard loads
- [ ] Journal save/read still works
- [ ] Normal UI shows no parent email, Supabase UUID, child names, tokens, storage paths, or `photo_url`

### Manual tests if physical devices unavailable

- [ ] Chrome DevTools → Application → Manifest on `/index.html` and `/counsellor.html` — confirm fields above
- [ ] Lighthouse PWA audit (informational; not a merge gate)
- [ ] Confirm manifest/icon URLs return 200 on deployed Vercel URL
- [ ] Owner records pending physical device pass in PR or Issue #28 follow-up

---

## Related docs

| Doc | Role |
|-----|------|
| [MOBILE_APP_ICONS.md](./MOBILE_APP_ICONS.md) | Parent vs MHP icon separation (PR #111–#112) |
| [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) | Launch snapshot |
