# MHP Profile Image Strategy

**PR #106 — docs/spec + storage contract planning only (no upload UI, no image generation)**

Read first:

- [AGENTS.md](../AGENTS.md)
- [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [MHP_OWNER_HANDOFF_RUNBOOK.md](./MHP_OWNER_HANDOFF_RUNBOOK.md)
- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)
- [supabase-mhp-profile-license.sql](../supabase-mhp-profile-license.sql)
- [supabase-mhp-owner-publish-contract.sql](../supabase-mhp-owner-publish-contract.sql)

---

## 1. Purpose

Wayfinder needs a **safe Mental Health Professional (MHP) profile image strategy** before public profile or directory work expands.

Today, `mental_health_professional_profiles.photo_url` supports a simple **Photo URL** text field. That is **not** the production workflow:

- A **local drive path** (for example `C:\Users\...`) is never valid.
- A **random public URL** is not the preferred workflow.
- Raw photos should not become the default public identity asset.

This document defines the preferred **private upload → illustrated portrait → owner review → publish** model aligned with the existing MHP **draft → review → publish** publication contract (PR #104 / PR #105).

- **User-facing label:** Mental Health Professional / MHP
- **Internal role:** `counsellor` (unchanged)

**No App Version entry** — MHP/admin infrastructure only.

---

## 2. What this PR does not do

PR #106 does **not**:

- implement upload UI in the MHP portal
- generate or transform images
- change `app.js`, `supabase.js`, `api/*`, or admin runtime behaviour
- publish profiles or images automatically
- build a public MHP profile directory
- expose source photos or draft portraits to parents/clients

This PR is **strategy + SQL/storage contract planning** for owner review before runtime PRs.

---

## 3. Current limitation: Photo URL

| Aspect | Current state | Problem |
|--------|---------------|---------|
| `photo_url` on MHP profile | Optional text field; MHP may paste any HTTPS URL | No private upload, no owner image review, no consistent Wayfinder visual identity |
| Admin review page (PR #105) | Shows `photo_url` preview only when safe HTTPS URL | Encourages ad-hoc public URLs instead of governed assets |
| Parent/client visibility | Governed by `profile_status`, `profile_visible`, `membership_status` | Image can appear public via URL even when publication intent is unclear |
| Storage | None for profile images | Licence PDFs use a separate private bucket contract |

**Interim rule until image runtime ships:** treat `photo_url` as **legacy / transitional**. Do not instruct MHPs to use local paths or unreviewed public URLs as production identity.

---

## 4. Preferred future workflow

```mermaid
flowchart LR
  upload[MHPUploadsSourcePhotoPrivate]
  generate[WayfinderGeneratesIllustratedPortrait]
  select[MHPPreviewsAndSelectsPortrait]
  review[OwnerAdminReviewsImageWithProfile]
  publish[OwnerPublishesProfileAndPortrait]
  parent[ParentClientSeesApprovedPortraitOnly]

  upload --> generate --> select --> review --> publish --> parent
```

1. **MHP uploads source photo privately** — stored in a private bucket; never parent/client-visible.
2. **Wayfinder generates or allows a Wayfinder-style illustrated portrait** — warm, editorial, consistent palette; not raw photo as default public identity.
3. **MHP previews and selects preferred portrait** — selection is not publication.
4. **Owner/admin reviews image** as part of MHP publication review (alongside licence/profile fields).
5. **Parent/client UI** shows **only the owner-approved portrait** for **published + active** MHP profiles.

Uploading or generating an image **does not publish** the profile. MHP self-publish remains disallowed. Owner/admin publication RPC remains the authority ([supabase-mhp-owner-publish-contract.sql](../supabase-mhp-owner-publish-contract.sql)).

---

## 5. Style guidance

### Preferred

- Wayfinder pencil portrait
- Warm illustrated professional portrait
- Soft neutral editorial sketch
- Consistent Wayfinder palette (sage, warm neutrals, restrained line work)

### Avoid

- Raw photo as default public identity
- Cartoonish or childlike styles
- Named external studio styles as product standard
- Clinical or medical stock imagery
- Exaggerated beauty filters
- Misleading identity changes (portrait must remain recognizably the same professional)

Portraits support **trust and recognition**, not marketing glamour or clinical certification claims.

---

## 6. Privacy and publication rules

| Rule | Detail |
|------|--------|
| Source photo | **Private always** — MHP + owner/admin service paths only |
| Generated / uploaded portrait candidates | **Private** until owner/admin approval |
| Approved portrait | May be served to parent/client contexts **only** when profile is **published + visible + active membership** |
| Image upload / generation | Does **not** change `profile_status` or publish profile |
| MHP self-publish | **Disallowed** — unchanged from PR #104 |
| Owner approval | Required before any portrait becomes the public-facing asset |
| Parent selector / directory | No image display until future runtime + owner-approved asset path is wired |

Parent/client visibility still requires:

- `profile_status = 'published'`
- `profile_visible = true`
- `membership_status = 'active'`
- membership not expired (where applicable)

---

## 7. Storage architecture (proposal)

Owner-applied Supabase Storage buckets — **private by default**:

| Bucket | Purpose | Access |
|--------|---------|--------|
| `professional-profile-image-sources` | Original source photos uploaded by MHP | Private; authenticated MHP own-folder upload (future); owner/admin read for review |
| `professional-profile-portraits` | Generated, uploaded, and approved portrait files | Private until approved; future controlled serving for published MHPs |

**Suggested path convention (future):**

- Sources: `professional-profile-image-sources/{auth.uid()}/{image_id}.jpg`
- Portraits: `professional-profile-portraits/{auth.uid()}/{image_id}.png`

**Future approved/public serving path** — to be decided in a later PR (signed URL, CDN path, or copy to a public bucket). Do **not** make source or draft portrait buckets public in PR #106.

Storage **policies** are documented in [supabase-mhp-profile-image-storage.sql](../supabase-mhp-profile-image-storage.sql) as manual owner setup notes; full upload policies ship with the upload UI/API PR.

---

## 8. Data model (proposal)

Separate table recommended (not only `photo_url`):

- **Table:** `public.mental_health_professional_profile_images`
- **Contract file:** [supabase-mhp-profile-image-storage.sql](../supabase-mhp-profile-image-storage.sql)

| Field | Purpose |
|-------|---------|
| `id` | Primary key |
| `user_id` | MHP auth user |
| `image_kind` | `source_photo` / `generated_portrait` / `uploaded_portrait` / `approved_portrait` |
| `storage_bucket` | Supabase bucket name |
| `storage_path` | Object path (not a local filesystem path) |
| `mime_type` | Image MIME type |
| `file_size_bytes` | Size audit |
| `portrait_style` | e.g. `wayfinder_pencil_v1` (future generation) |
| `image_status` | `uploaded` / `generated` / `selected` / `approved` / `rejected` / `archived` |
| `created_at` | Insert time |
| `selected_at` | When MHP marked candidate as preferred (future) |
| `approved_by` | Owner admin user id (future RPC) |
| `approved_at` | Owner approval timestamp |

### Do not store in this table

- Local file paths (`C:\...`, `file://`)
- Parent/child data, journal/reflection text
- Licence PDF paths (separate licence document table)
- Emails, tokens, invite data
- Raw extraction JSON from licence documents

**Legacy `photo_url`:** may remain during transition; future runtime should set it only from an **approved_portrait** record when owner publishes, or replace with a resolved approved-image URL field via RPC.

---

## 9. RLS and access (SQL contract summary)

From [supabase-mhp-profile-image-storage.sql](../supabase-mhp-profile-image-storage.sql):

- MHP (`counsellor`) may **read** own image metadata rows.
- MHP may **insert** own rows for non-approved kinds only (`source_photo`, `generated_portrait`, `uploaded_portrait`) in non-approved statuses.
- MHP **cannot** set `image_status = 'approved'` or `approved_by` / `approved_at` via RLS.
- **No** authenticated SELECT for other users' images.
- **No** anon access.
- Owner approval / rejection updates deferred to a **future owner-admin RPC PR** (same pattern as publication RPC).

---

## 10. Future PR sequence (recommended)

| Phase | PR theme | Delivers |
|-------|----------|----------|
| **#106 (this)** | Strategy + storage SQL contract | This doc + table/bucket contract; owner-applied SQL only |
| **#107+ (planned)** | MHP private source upload UI + metadata insert | Upload to source bucket; no generation yet |
| **#108+ (planned)** | Portrait generation service + candidate rows | API/service-role generation; MHP preview/select |
| **#109+ (planned)** | Owner admin image review in `/admin.html` | Approve/reject portrait; link to publication |
| **#110+ (planned)** | Parent/client approved portrait display | Published directory or selector avatar; signed URL or public serve path |

Do not bundle upload, generation, admin review, and parent display in one PR.

---

## 11. Owner decisions (open)

1. **Approved portrait serve mechanism** — signed URL vs dedicated public bucket vs CDN.
2. **Generation provider** — internal pipeline vs approved vendor; must not send parent/child data.
3. **Whether MHP may upload their own illustrated portrait** (`uploaded_portrait`) without generation, still owner-approved.
4. **Rejection UX** — notify MHP to re-upload vs silent archive.
5. **Deprecation timeline for free-text `photo_url`** in MHP profile edit UI.

---

## 12. Manual verification (after SQL apply)

Owner applies [supabase-mhp-profile-image-storage.sql](../supabase-mhp-profile-image-storage.sql) in Supabase SQL Editor, then:

```sql
select to_regclass('public.mental_health_professional_profile_images');
```

**Expected:** table exists; zero rows until runtime PR.

**Must not exist yet:** public bucket read on sources; parent-visible image URLs; automatic profile publish on upload.

---

## Related docs

| Doc | Role |
|-----|------|
| [MHP_OWNER_HANDOFF_RUNBOOK.md](./MHP_OWNER_HANDOFF_RUNBOOK.md) | Owner operations |
| [supabase-mhp-profile-image-storage.sql](../supabase-mhp-profile-image-storage.sql) | SQL/storage contract |
| [supabase-mhp-owner-publish-contract.sql](../supabase-mhp-owner-publish-contract.sql) | Publication model |
