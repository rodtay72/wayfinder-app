-- ============================================================
-- Wayfinder MHP profile image storage contract
-- PR #106 — Profile image strategy + metadata table (planning)
-- ============================================================
--
-- Owner-applied only. Run manually in Supabase SQL Editor.
--
-- Purpose:
--   Data contract for private MHP source photos and illustrated
--   portrait metadata — before upload UI or image generation.
--
-- Based on:
--   docs/MHP_PROFILE_IMAGE_STRATEGY.md
--   supabase-mhp-profile-license.sql
--   supabase-mhp-owner-publish-contract.sql
--
-- Prerequisites:
--   - public.profiles
--   - public.is_wayfinder_counsellor()
--   - public.mental_health_professional_profiles
--
-- This PR does NOT:
--   - create storage upload policies (manual bucket setup notes only)
--   - implement upload UI, generation API, or admin review runtime
--   - publish images or profiles automatically
--   - expose source photos or draft portraits to anon/parent roles
--   - replace photo_url runtime wiring (future PR)
--
-- User-facing label: Mental Health Professional / MHP
-- Internal role value: counsellor
--
-- After apply, verify (expect zero rows until runtime PR):
--   select count(*) from public.mental_health_professional_profile_images;

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'MHP profile image contract blocked: public.profiles does not exist.'
      using errcode = 'P0001';
  end if;

  if to_regprocedure('public.is_wayfinder_counsellor()') is null then
    raise exception 'MHP profile image contract blocked: is_wayfinder_counsellor() does not exist.'
      using errcode = 'P0001';
  end if;

  if to_regclass('public.mental_health_professional_profiles') is null then
    raise exception 'MHP profile image contract blocked: mental_health_professional_profiles does not exist.'
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Profile image metadata table
-- ---------------------------------------------------------------------------
-- Stores storage references and review lifecycle only — not file bytes,
-- local paths, emails, tokens, journal data, or licence PDF paths.

create table if not exists public.mental_health_professional_profile_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_kind text not null,
  storage_bucket text not null,
  storage_path text not null,
  mime_type text,
  file_size_bytes bigint,
  portrait_style text,
  image_status text not null default 'uploaded',
  created_at timestamptz not null default now(),
  selected_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  constraint mhp_profile_images_kind_check check (
    image_kind in (
      'source_photo',
      'generated_portrait',
      'uploaded_portrait',
      'approved_portrait'
    )
  ),
  constraint mhp_profile_images_status_check check (
    image_status in (
      'uploaded',
      'generated',
      'selected',
      'approved',
      'rejected',
      'archived'
    )
  ),
  constraint mhp_profile_images_bucket_not_blank check (
    length(trim(storage_bucket)) > 0
  ),
  constraint mhp_profile_images_path_not_blank check (
    length(trim(storage_path)) > 0
  ),
  constraint mhp_profile_images_no_local_path check (
    storage_path !~ '^[A-Za-z]:\\'
    and storage_path !~ '^file://'
    and storage_path !~ '^\\\\'
  ),
  constraint mhp_profile_images_file_size_nonnegative check (
    file_size_bytes is null or file_size_bytes >= 0
  ),
  constraint mhp_profile_images_approved_fields check (
    image_status <> 'approved'
    or (approved_by is not null and approved_at is not null)
  ),
  constraint mhp_profile_images_approved_kind check (
    image_status <> 'approved' or image_kind = 'approved_portrait'
  )
);

create index if not exists mhp_profile_images_user_created_idx
  on public.mental_health_professional_profile_images (user_id, created_at desc);

create index if not exists mhp_profile_images_user_status_idx
  on public.mental_health_professional_profile_images (user_id, image_status, created_at desc);

create index if not exists mhp_profile_images_user_kind_idx
  on public.mental_health_professional_profile_images (user_id, image_kind, created_at desc);

create unique index if not exists mhp_profile_images_storage_object_key
  on public.mental_health_professional_profile_images (storage_bucket, storage_path);

-- ---------------------------------------------------------------------------
-- 2. RLS
-- ---------------------------------------------------------------------------
-- MHPs read own metadata. MHPs insert non-approved candidate rows only.
-- Approval/rejection updates deferred to future owner-admin RPC PR.
-- No parent/anon access.

alter table public.mental_health_professional_profile_images enable row level security;

revoke all on public.mental_health_professional_profile_images from public;
grant select, insert on public.mental_health_professional_profile_images to authenticated;

drop policy if exists "MHPs read own profile image metadata" on public.mental_health_professional_profile_images;
create policy "MHPs read own profile image metadata"
  on public.mental_health_professional_profile_images
  for select
  to authenticated
  using (
    user_id = auth.uid()
    and public.is_wayfinder_counsellor()
  );

drop policy if exists "MHPs insert own profile image candidates" on public.mental_health_professional_profile_images;
create policy "MHPs insert own profile image candidates"
  on public.mental_health_professional_profile_images
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_wayfinder_counsellor()
    and image_kind in ('source_photo', 'generated_portrait', 'uploaded_portrait')
    and image_status in ('uploaded', 'generated', 'selected')
    and approved_by is null
    and approved_at is null
    and storage_bucket in (
      'professional-profile-image-sources',
      'professional-profile-portraits'
    )
  );

-- No authenticated UPDATE/DELETE in PR #106.
-- Owner approval, rejection, and approved_portrait promotion require a
-- future SECURITY DEFINER owner-admin RPC (same pattern as publication).

-- ---------------------------------------------------------------------------
-- 3. Storage bucket instructions (manual owner setup)
-- ---------------------------------------------------------------------------
-- Create two PRIVATE Supabase Storage buckets:
--
--   professional-profile-image-sources
--     - Original photos uploaded by MHP (never public)
--
--   professional-profile-portraits
--     - Generated/uploaded portrait candidates and approved portraits
--     - Remains private until future controlled serving path is approved
--
-- Required behaviour:
--   - Both buckets must be private (no public read).
--   - Do not expose bucket URLs in parent/client UI in this phase.
--   - Future upload UI should use authenticated path convention:
--       professional-profile-image-sources/{auth.uid()}/{image_id}.jpg
--       professional-profile-portraits/{auth.uid()}/{image_id}.png
--   - Image generation/review APIs must use service role only.
--   - Never put service role keys in browser code.
--
-- Storage RLS policies are intentionally NOT created in PR #106.
-- Add policies with the upload UI / API slice that performs authenticated
-- uploads (future PR after owner review of this contract).

-- ---------------------------------------------------------------------------
-- 4. Future integration notes (not implemented here)
-- ---------------------------------------------------------------------------
-- - owner_list_mhp_profiles() may later expose approved portrait preview
--   metadata only (no source paths).
-- - owner_set_mhp_publication() does not approve images in PR #106.
-- - mental_health_professional_profiles.photo_url remains legacy/transitional
--   until runtime sets it from approved_portrait via owner RPC.
-- - list_published_mental_health_professionals() should serve approved
--   portrait URL only after future PR — not raw source photos.

-- ============================================================
-- End of MHP profile image storage contract
-- ============================================================
