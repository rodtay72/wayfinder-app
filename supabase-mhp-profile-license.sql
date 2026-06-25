-- ============================================================
-- Wayfinder Mental Health Professional profile + licence contract
-- Issue #71 - PR A (SQL / RLS / storage instructions only)
-- ============================================================
--
-- Purpose:
--   Add the data contract for invite-only Mental Health Professional (MHP)
--   onboarding, profile setup, licence document metadata/extraction review,
--   and membership expiry.
--
-- Important naming rule:
--   User-facing label: Mental Health Professional
--   Internal role value: counsellor
--
-- This SQL intentionally does NOT rename existing role values, RLS helper
-- names, route files, or counsellor portal internals.
--
-- Scope:
--   - SQL tables, constraints, indexes, RLS policies, safe read RPC.
--   - Storage bucket instructions only for professional licence PDFs.
--   - No UI, no API route, no app runtime changes.
--
-- Owner-applied only. Do not run from CI.
--
-- Expected upstream prerequisites:
--   - public.profiles exists
--   - public.is_wayfinder_counsellor() exists
--   - public.ensure_profile(...) remains unchanged
--
-- ============================================================

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'MHP profile contract blocked: public.profiles does not exist.'
      using errcode = 'P0001';
  end if;

  if to_regprocedure('public.is_wayfinder_counsellor()') is null then
    raise exception 'MHP profile contract blocked: public.is_wayfinder_counsellor() does not exist.'
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Professional invites
-- ---------------------------------------------------------------------------
-- Invite creation remains owner/admin/service-role controlled in this phase.
-- There is no authenticated INSERT/UPDATE policy for general users.
-- invite_token_hash stores a hash only, never a raw invite token.

create table if not exists public.professional_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  invite_token_hash text not null,
  invited_role text not null default 'counsellor',
  invite_status text not null default 'created',
  invited_by uuid references auth.users(id) on delete set null,
  accepted_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_invites_email_not_blank check (length(trim(email)) > 0),
  constraint professional_invites_token_hash_not_blank check (length(trim(invite_token_hash)) > 0),
  constraint professional_invites_invited_role_check check (invited_role in ('counsellor')),
  constraint professional_invites_status_check check (invite_status in ('created', 'sent', 'accepted', 'expired', 'revoked')),
  constraint professional_invites_acceptance_consistency check (
    (invite_status <> 'accepted') or (accepted_by is not null and accepted_at is not null)
  ),
  constraint professional_invites_revocation_consistency check (
    (invite_status <> 'revoked') or (revoked_at is not null)
  )
);

create unique index if not exists professional_invites_token_hash_key
  on public.professional_invites (invite_token_hash);

create index if not exists professional_invites_email_idx
  on public.professional_invites (lower(trim(email)));

create index if not exists professional_invites_status_idx
  on public.professional_invites (invite_status, expires_at);

alter table public.professional_invites enable row level security;

-- No direct authenticated access in PR A. Future invite acceptance should use
-- a SECURITY DEFINER RPC that verifies token hash, expiry, status, and email.
revoke all on public.professional_invites from public;
revoke all on public.professional_invites from authenticated;

-- ---------------------------------------------------------------------------
-- 2. Mental Health Professional profiles
-- ---------------------------------------------------------------------------
-- Professionals can create/update their own non-published draft/pending profile.
-- They cannot self-publish public profiles through RLS.
-- Public reads go through list_published_mental_health_professionals().

create table if not exists public.mental_health_professional_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile_slug text unique,
  photo_url text,
  full_name text,
  professional_title text,
  license_registration_number text,
  issuing_body text,
  short_bio text,
  country_of_origin text,
  ethnicity text,
  enquiry_email text not null default 'ask.anything@psytec.com.sg',
  enquiry_mobile text not null default '+65 91681166',
  profile_visible boolean not null default false,
  profile_status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mhp_profiles_status_check check (profile_status in ('hidden', 'draft', 'pending_review', 'published', 'suspended')),
  constraint mhp_profiles_slug_format_check check (
    profile_slug is null or profile_slug ~ '^[a-z0-9][a-z0-9-]{2,80}$'
  ),
  constraint mhp_profiles_enquiry_email_not_blank check (length(trim(enquiry_email)) > 0),
  constraint mhp_profiles_enquiry_mobile_not_blank check (length(trim(enquiry_mobile)) > 0)
);

create index if not exists mhp_profiles_status_visible_idx
  on public.mental_health_professional_profiles (profile_status, profile_visible);

create index if not exists mhp_profiles_slug_idx
  on public.mental_health_professional_profiles (profile_slug);

alter table public.mental_health_professional_profiles enable row level security;

revoke all on public.mental_health_professional_profiles from public;
grant select, insert, update on public.mental_health_professional_profiles to authenticated;

-- Professionals can read their own profile, regardless of public status.
drop policy if exists "MHPs read own profile" on public.mental_health_professional_profiles;
create policy "MHPs read own profile"
  on public.mental_health_professional_profiles
  for select
  to authenticated
  using (
    user_id = auth.uid()
    and public.is_wayfinder_counsellor()
  );

-- Professionals can create their own profile, but only in non-public states.
drop policy if exists "MHPs insert own draft profile" on public.mental_health_professional_profiles;
create policy "MHPs insert own draft profile"
  on public.mental_health_professional_profiles
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_wayfinder_counsellor()
    and profile_status in ('hidden', 'draft', 'pending_review')
    and profile_visible = false
  );

-- Professionals can update their own profile only while it is not published.
-- Owner/admin/service-role review is required to publish or suspend profiles.
drop policy if exists "MHPs update own nonpublished profile" on public.mental_health_professional_profiles;
create policy "MHPs update own nonpublished profile"
  on public.mental_health_professional_profiles
  for update
  to authenticated
  using (
    user_id = auth.uid()
    and public.is_wayfinder_counsellor()
    and profile_status in ('hidden', 'draft', 'pending_review')
  )
  with check (
    user_id = auth.uid()
    and public.is_wayfinder_counsellor()
    and profile_status in ('hidden', 'draft', 'pending_review')
    and profile_visible = false
  );

-- ---------------------------------------------------------------------------
-- 3. Licence document metadata + AI extraction review state
-- ---------------------------------------------------------------------------
-- Raw PDF files must remain in a private Supabase Storage bucket.
-- This table stores metadata and extracted draft fields only.
-- AI extraction is draft support. It does not verify or publish a profile.

create table if not exists public.mental_health_professional_license_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  original_filename text,
  mime_type text,
  file_size_bytes bigint,
  document_status text not null default 'uploaded',
  extraction_status text not null default 'pending',
  extracted_json jsonb,
  extraction_confidence jsonb,
  extraction_model text,
  extracted_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mhp_license_storage_bucket_not_blank check (length(trim(storage_bucket)) > 0),
  constraint mhp_license_storage_path_not_blank check (length(trim(storage_path)) > 0),
  constraint mhp_license_file_size_nonnegative check (file_size_bytes is null or file_size_bytes >= 0),
  constraint mhp_license_document_status_check check (document_status in ('uploaded', 'extracted', 'needs_review', 'accepted', 'rejected', 'expired')),
  constraint mhp_license_extraction_status_check check (extraction_status in ('pending', 'processing', 'completed', 'failed')),
  constraint mhp_license_pdf_mime_check check (mime_type is null or mime_type = 'application/pdf')
);

create index if not exists mhp_license_documents_user_idx
  on public.mental_health_professional_license_documents (user_id, created_at desc);

create index if not exists mhp_license_documents_status_idx
  on public.mental_health_professional_license_documents (document_status, extraction_status);

create unique index if not exists mhp_license_documents_storage_path_key
  on public.mental_health_professional_license_documents (storage_bucket, storage_path);

alter table public.mental_health_professional_license_documents enable row level security;

revoke all on public.mental_health_professional_license_documents from public;
grant select, insert on public.mental_health_professional_license_documents to authenticated;

-- Professionals can read their own document metadata and extraction results.
drop policy if exists "MHPs read own licence document metadata" on public.mental_health_professional_license_documents;
create policy "MHPs read own licence document metadata"
  on public.mental_health_professional_license_documents
  for select
  to authenticated
  using (
    user_id = auth.uid()
    and public.is_wayfinder_counsellor()
  );

-- Professionals can create uploaded document metadata for their own files.
-- They cannot mark documents accepted/rejected/expired or set review fields.
drop policy if exists "MHPs insert own uploaded licence document metadata" on public.mental_health_professional_license_documents;
create policy "MHPs insert own uploaded licence document metadata"
  on public.mental_health_professional_license_documents
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_wayfinder_counsellor()
    and storage_bucket = 'professional-license-documents'
    and document_status = 'uploaded'
    and extraction_status in ('pending', 'processing')
    and reviewed_by is null
    and reviewed_at is null
  );

-- No authenticated UPDATE policy in PR A. Extraction/review updates are done
-- later through server-side service role or explicit owner/admin RPCs.

-- ---------------------------------------------------------------------------
-- 4. Membership status / expiry
-- ---------------------------------------------------------------------------
-- Professionals can read their own membership state but cannot update it.
-- Owner/admin/service-role updates it after licence review.

create table if not exists public.mental_health_professional_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  institution_name text,
  membership_status text not null default 'pending_review',
  institutional_membership_expires_at timestamptz,
  source_license_document_id uuid references public.mental_health_professional_license_documents(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint mhp_memberships_status_check check (membership_status in ('pending_review', 'active', 'expired', 'suspended'))
);

create index if not exists mhp_memberships_status_expiry_idx
  on public.mental_health_professional_memberships (membership_status, institutional_membership_expires_at);

alter table public.mental_health_professional_memberships enable row level security;

revoke all on public.mental_health_professional_memberships from public;
grant select on public.mental_health_professional_memberships to authenticated;

-- Professionals can read own membership status/expiry.
drop policy if exists "MHPs read own membership" on public.mental_health_professional_memberships;
create policy "MHPs read own membership"
  on public.mental_health_professional_memberships
  for select
  to authenticated
  using (
    user_id = auth.uid()
    and public.is_wayfinder_counsellor()
  );

-- No authenticated INSERT/UPDATE/DELETE policy in PR A. Membership is owner/
-- admin/service-role controlled because it gates public visibility and access.

-- ---------------------------------------------------------------------------
-- 5. Safe parent/public read RPC for published MHP directory
-- ---------------------------------------------------------------------------
-- This returns only parent-safe public profile fields. It does not expose raw
-- auth UUIDs, document storage paths, PDF files, invite data, extraction JSON,
-- review notes, or hidden/private profile states.

create or replace function public.list_published_mental_health_professionals()
returns table(
  profile_slug text,
  photo_url text,
  full_name text,
  professional_title text,
  license_registration_number text,
  issuing_body text,
  short_bio text,
  country_of_origin text,
  ethnicity text,
  enquiry_email text,
  enquiry_mobile text,
  institution_name text,
  membership_expires_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.profile_slug,
    p.photo_url,
    p.full_name,
    p.professional_title,
    p.license_registration_number,
    p.issuing_body,
    p.short_bio,
    p.country_of_origin,
    p.ethnicity,
    p.enquiry_email,
    p.enquiry_mobile,
    m.institution_name,
    m.institutional_membership_expires_at as membership_expires_at
  from public.mental_health_professional_profiles p
  join public.mental_health_professional_memberships m on m.user_id = p.user_id
  where p.profile_visible = true
    and p.profile_status = 'published'
    and m.membership_status = 'active'
    and (
      m.institutional_membership_expires_at is null
      or m.institutional_membership_expires_at > now()
    )
  order by p.full_name asc nulls last, p.profile_slug asc nulls last;
$$;

revoke all on function public.list_published_mental_health_professionals() from public;
grant execute on function public.list_published_mental_health_professionals() to anon;
grant execute on function public.list_published_mental_health_professionals() to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Own status RPC for professional onboarding header
-- ---------------------------------------------------------------------------
-- This is for the logged-in professional to see own profile/membership state.
-- It does not expose other professionals' data.

create or replace function public.get_my_mental_health_professional_status()
returns table(
  profile_status text,
  profile_visible boolean,
  full_name text,
  professional_title text,
  photo_url text,
  membership_status text,
  institution_name text,
  membership_expires_at timestamptz,
  latest_document_status text,
  latest_extraction_status text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.profile_status,
    p.profile_visible,
    p.full_name,
    p.professional_title,
    p.photo_url,
    m.membership_status,
    m.institution_name,
    m.institutional_membership_expires_at as membership_expires_at,
    d.document_status as latest_document_status,
    d.extraction_status as latest_extraction_status
  from public.profiles base
  left join public.mental_health_professional_profiles p on p.user_id = base.user_id
  left join public.mental_health_professional_memberships m on m.user_id = base.user_id
  left join lateral (
    select ld.document_status, ld.extraction_status
    from public.mental_health_professional_license_documents ld
    where ld.user_id = base.user_id
    order by ld.created_at desc
    limit 1
  ) d on true
  where base.user_id = auth.uid()
    and base.role = 'counsellor';
$$;

revoke all on function public.get_my_mental_health_professional_status() from public;
grant execute on function public.get_my_mental_health_professional_status() to authenticated;

-- ---------------------------------------------------------------------------
-- 7. Storage bucket instructions (manual owner setup)
-- ---------------------------------------------------------------------------
-- Create a private Supabase Storage bucket named:
--   professional-license-documents
--
-- Required behaviour:
--   - The bucket must be private.
--   - Licence PDFs must not be publicly readable by default.
--   - Browser upload policy should restrict authenticated professionals to
--     their own folder/path convention once upload UI is built.
--   - Server-side extraction/review should use service role only in API code.
--   - Never put service role keys or AI API keys in browser code.
--
-- Suggested future storage path convention:
--   professional-license-documents/{auth.uid()}/{document_id}.pdf
--
-- Storage policies are intentionally not created in PR A because upload UI and
-- path convention are not implemented yet. Add storage policies with the UI/API
-- slice that performs authenticated uploads.

-- ============================================================
-- End of MHP profile + licence data contract
-- ============================================================
