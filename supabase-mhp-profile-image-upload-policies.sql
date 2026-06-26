-- ============================================================
-- Wayfinder MHP profile image upload storage policies
-- PR #107 — Private source photo upload + signed preview
-- ============================================================
--
-- Owner-applied only. Run manually in Supabase SQL Editor.
--
-- Prerequisites:
--   supabase-mhp-profile-image-storage.sql (PR #106)
--   supabase-mhp-owner-publish-contract.sql (is_wayfinder_owner_admin)
--   public.is_wayfinder_counsellor()
--
-- Creates/updates private buckets and storage.objects policies for:
--   - MHP upload/read own source photos
--   - Owner admin read source photos (future review)
--
-- Does NOT:
--   - allow anon or parent/client storage access
--   - allow browser insert into professional-profile-portraits
--   - make buckets public

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regprocedure('public.is_wayfinder_counsellor()') is null then
    raise exception 'MHP profile image upload policies blocked: is_wayfinder_counsellor() does not exist.'
      using errcode = 'P0001';
  end if;

  if to_regclass('public.mental_health_professional_profile_images') is null then
    raise exception 'MHP profile image upload policies blocked: mental_health_professional_profile_images does not exist. Apply PR #106 SQL first.'
      using errcode = 'P0001';
  end if;

  if to_regprocedure('public.is_wayfinder_owner_admin()') is null then
    raise exception 'MHP profile image upload policies blocked: is_wayfinder_owner_admin() does not exist. Apply PR #104 SQL first.'
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Private buckets
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'professional-profile-image-sources',
  'professional-profile-image-sources',
  false,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
  set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

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
-- 2. MHP source photo policies — own folder only
-- ---------------------------------------------------------------------------
-- Path convention:
--   professional-profile-image-sources/{auth.uid()}/{timestamp-or-id}.{ext}

drop policy if exists "MHP upload own source photo" on storage.objects;
create policy "MHP upload own source photo"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'professional-profile-image-sources'
    and public.is_wayfinder_counsellor()
    and (storage.foldername(name))[1] = auth.uid()::text
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
  );

drop policy if exists "MHP read own source photo" on storage.objects;
create policy "MHP read own source photo"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'professional-profile-image-sources'
    and public.is_wayfinder_counsellor()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- 3. Owner admin read source photos (review — future UI may use signed URLs)
-- ---------------------------------------------------------------------------

drop policy if exists "Owner admin read MHP source photos" on storage.objects;
create policy "Owner admin read MHP source photos"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'professional-profile-image-sources'
    and public.is_wayfinder_owner_admin()
  );

-- No anon policies. No parent/client policies. No portrait bucket browser insert.

-- ============================================================
-- End of MHP profile image upload storage policies
-- ============================================================
