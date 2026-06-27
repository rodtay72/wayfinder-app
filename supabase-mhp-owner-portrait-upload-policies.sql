-- ============================================================
-- Wayfinder MHP owner approved portrait upload policies
-- PR #113 — Owner approved portrait upload workflow
-- ============================================================
--
-- Owner-applied only. Run manually in Supabase SQL Editor.
--
-- Purpose:
--   Allow owner/admin to upload and read approved MHP portrait files
--   in the private professional-profile-portraits bucket, and insert
--   approved_portrait metadata rows.
--
-- Prerequisites:
--   - supabase-mhp-profile-image-storage.sql (PR #106)
--   - supabase-mhp-profile-image-upload-policies.sql (PR #107 buckets)
--   - supabase-mhp-owner-publish-contract.sql (is_wayfinder_owner_admin)
--
-- Path convention (no email, names, or Wayfinder ID in path):
--   professional-profile-portraits/mhp/{mhp_user_id}/approved/{timestamp}.{ext}
--
-- Does NOT:
--   - make buckets public
--   - grant anon access
--   - allow MHP self-upload of approved portraits
--   - write photo_url or publish to parents/clients
--   - grant storage delete policies

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regprocedure('public.is_wayfinder_owner_admin()') is null then
    raise exception 'PR113 owner portrait upload blocked: is_wayfinder_owner_admin() does not exist. Apply supabase-mhp-owner-publish-contract.sql first.'
      using errcode = 'P0001';
  end if;

  if to_regclass('public.mental_health_professional_profile_images') is null then
    raise exception 'PR113 owner portrait upload blocked: mental_health_professional_profile_images does not exist. Apply PR #106 SQL first.'
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
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
  set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- 2. Owner admin storage policies — approved portrait bucket
-- ---------------------------------------------------------------------------

drop policy if exists "PR113 owner admin upload approved portrait" on storage.objects;
create policy "PR113 owner admin upload approved portrait"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'professional-profile-portraits'
    and public.is_wayfinder_owner_admin()
    and (storage.foldername(name))[1] = 'mhp'
    and (storage.foldername(name))[3] = 'approved'
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
  );

drop policy if exists "PR113 owner admin read approved portrait" on storage.objects;
create policy "PR113 owner admin read approved portrait"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'professional-profile-portraits'
    and public.is_wayfinder_owner_admin()
  );

-- ---------------------------------------------------------------------------
-- 3. Owner admin metadata insert — approved_portrait rows only
-- ---------------------------------------------------------------------------

drop policy if exists "PR113 owner admin insert approved portrait metadata" on public.mental_health_professional_profile_images;
create policy "PR113 owner admin insert approved portrait metadata"
  on public.mental_health_professional_profile_images
  for insert
  to authenticated
  with check (
    public.is_wayfinder_owner_admin()
    and image_kind = 'approved_portrait'
    and image_status = 'approved'
    and storage_bucket = 'professional-profile-portraits'
    and approved_by = auth.uid()
    and approved_at is not null
    and exists (
      select 1
      from public.profiles p
      where p.user_id = user_id
        and p.role = 'counsellor'
    )
  );

-- No anon policies. No parent/client storage or metadata access.
-- MHP read of own approved portrait deferred to a future PR if needed.

-- ============================================================
-- End of MHP owner approved portrait upload policies
-- ============================================================
