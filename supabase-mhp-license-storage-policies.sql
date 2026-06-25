-- ============================================================
-- Wayfinder MHP licence PDF storage policies (Issue #71 PR C2)
-- ============================================================
--
-- Run in Supabase SQL Editor after:
--   supabase-profiles.sql
--   supabase-counsellor-rls.sql
--   supabase-mhp-profile-license.sql
--
-- Purpose:
--   Private Storage bucket + RLS policies for Mental Health Professional
--   licence/registration PDF uploads.
--
-- User-facing label: Mental Health Professional
-- Internal role gate: public.is_wayfinder_counsellor()
--
-- Path convention (browser upload):
--   professional-license-documents/{auth.uid()}/{document_id}.pdf
--
-- Owner-applied only. Do not run from CI.

-- ---------------------------------------------------------------------------
-- Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regprocedure('public.is_wayfinder_counsellor()') is null then
    raise exception 'MHP licence storage policies blocked: public.is_wayfinder_counsellor() does not exist.'
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Private bucket
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'professional-license-documents',
  'professional-license-documents',
  false,
  10485760,
  array['application/pdf']::text[]
)
on conflict (id) do update
  set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- storage.objects policies — own-folder only, counsellor/MHP gate
-- ---------------------------------------------------------------------------

drop policy if exists "MHP owner upload own licence PDF" on storage.objects;
create policy "MHP owner upload own licence PDF"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'professional-license-documents'
    and public.is_wayfinder_counsellor()
    and (storage.foldername(name))[1] = auth.uid()::text
    and lower(storage.extension(name)) = 'pdf'
  );

drop policy if exists "MHP owner read own licence PDF" on storage.objects;
create policy "MHP owner read own licence PDF"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'professional-license-documents'
    and public.is_wayfinder_counsellor()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- No public/anon storage policies. No broad authenticated read/write.

-- ============================================================
-- Notes:
--   - Metadata rows live in mental_health_professional_license_documents.
--   - Browser uploads use anon key + user JWT only — never service role.
--   - AI extraction/review uses later server-side flows (not this PR).
-- ============================================================
