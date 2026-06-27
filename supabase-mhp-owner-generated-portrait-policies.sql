-- ============================================================
-- Wayfinder MHP owner generated portrait policies
-- PR #114 — Owner AI sketch generation + generated portrait metadata
-- ============================================================
--
-- Owner-applied only. Run manually in Supabase SQL Editor.
--
-- Purpose:
--   Allow owner/admin storage upload/read for generated portrait files
--   under professional-profile-portraits and insert generated_portrait
--   metadata rows (server API also uses service role).
--
-- Prerequisites:
--   - supabase-mhp-profile-image-storage.sql (PR #106)
--   - supabase-mhp-profile-image-upload-policies.sql (PR #107)
--   - supabase-mhp-owner-portrait-upload-policies.sql (PR #113)
--   - supabase-mhp-owner-publish-contract.sql (is_wayfinder_owner_admin)
--
-- Path convention:
--   professional-profile-portraits/mhp/{mhp_user_id}/generated/{timestamp}.png
--
-- Does NOT:
--   - make buckets public
--   - grant anon access
--   - allow MHP self-generation or self-approval
--   - write photo_url or publish to parents/clients
--   - grant storage delete policies

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regprocedure('public.is_wayfinder_owner_admin()') is null then
    raise exception 'PR114 generated portrait policies blocked: is_wayfinder_owner_admin() does not exist. Apply supabase-mhp-owner-publish-contract.sql first.'
      using errcode = 'P0001';
  end if;

  if to_regclass('public.mental_health_professional_profile_images') is null then
    raise exception 'PR114 generated portrait policies blocked: mental_health_professional_profile_images does not exist. Apply PR #106 SQL first.'
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Ensure private portrait bucket (unchanged public flag)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'professional-profile-portraits',
  'professional-profile-portraits',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
  set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- 2. Owner admin storage — generated portrait path (PR #113 approved path unchanged)
-- ---------------------------------------------------------------------------

drop policy if exists "PR114 owner admin upload generated portrait" on storage.objects;
create policy "PR114 owner admin upload generated portrait"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'professional-profile-portraits'
    and public.is_wayfinder_owner_admin()
    and (storage.foldername(name))[1] = 'mhp'
    and (storage.foldername(name))[3] = 'generated'
    and lower(storage.extension(name)) = 'png'
  );

-- PR113 read policy already covers entire professional-profile-portraits bucket for owner admin.

-- ---------------------------------------------------------------------------
-- 3. Owner admin metadata insert — generated_portrait rows only
-- ---------------------------------------------------------------------------

drop policy if exists "PR114 owner admin insert generated portrait metadata" on public.mental_health_professional_profile_images;
create policy "PR114 owner admin insert generated portrait metadata"
  on public.mental_health_professional_profile_images
  for insert
  to authenticated
  with check (
    public.is_wayfinder_owner_admin()
    and image_kind = 'generated_portrait'
    and image_status = 'generated'
    and storage_bucket = 'professional-profile-portraits'
    and approved_by is null
    and approved_at is null
    and exists (
      select 1
      from public.profiles p
      where p.user_id = user_id
        and p.role = 'counsellor'
    )
  );

-- No anon policies. No parent/client access. No MHP self-generation in this PR.

-- ============================================================
-- End of MHP owner generated portrait policies
-- ============================================================
