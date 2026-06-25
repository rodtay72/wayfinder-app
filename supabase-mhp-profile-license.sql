-- ============================================================
-- Wayfinder Mental Health Professional profile + licence contract
-- Issue #71 — PR A (SQL / RLS / storage instructions only)
-- ============================================================
--
-- Run in Supabase SQL Editor after:
--   supabase-profiles.sql
--   supabase-counsellor-rls.sql   (needs is_wayfinder_counsellor())
--
-- User-facing label: Mental Health Professional
-- Internal role value remains: counsellor
--
-- Scope (PR A only):
--   Tables, constraints, RLS, safe public profile RPCs, storage instructions.
--   Does NOT modify auth, ensure_profile, email verification, Parent/Child ID logic,
--   journal save/read runtime, dashboard protected reads, app.js, supabase.js, or API routes.
--
-- Privacy:
--   Licence PDF rows and storage paths are never public.
--   Public profile output uses profile_slug — not raw auth UUIDs.
--   extracted_json and extraction_confidence remain owner/admin only.
--
-- Admin / service role:
--   Supabase service_role bypasses RLS for owner-applied admin operations.
--   Authenticated admin uses profiles.role = 'admin' via is_wayfinder_mhp_admin().

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_wayfinder_mhp_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  );
$$;

comment on function public.is_wayfinder_mhp_admin() is
  'Authenticated Wayfinder admin check for MHP onboarding review. service_role bypasses RLS natively.';

revoke all on function public.is_wayfinder_mhp_admin() from public;
grant execute on function public.is_wayfinder_mhp_admin() to authenticated;

create or replace function public.mhp_membership_is_active(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.mental_health_professional_memberships m
    where m.user_id = p_user_id
      and m.membership_status = 'active'
      and (
        m.institutional_membership_expires_at is null
        or m.institutional_membership_expires_at > now()
      )
  );
$$;

revoke all on function public.mhp_membership_is_active(uuid) from public;
grant execute on function public.mhp_membership_is_active(uuid) to authenticated;

create or replace function public.set_mhp_row_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. professional_invites
-- ---------------------------------------------------------------------------

create table if not exists public.professional_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  invite_token_hash text not null,
  invited_role text not null default 'counsellor',
  invite_status text not null default 'created',
  invited_by uuid references auth.users(id),
  accepted_by uuid references auth.users(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_invites_invited_role_check
    check (invited_role = 'counsellor'),
  constraint professional_invites_invite_status_check
    check (invite_status in ('created', 'sent', 'accepted', 'expired', 'revoked'))
);

create unique index if not exists professional_invites_token_hash_unique_idx
  on public.professional_invites (invite_token_hash);

create index if not exists professional_invites_email_idx
  on public.professional_invites (lower(email));

create index if not exists professional_invites_status_idx
  on public.professional_invites (invite_status, expires_at);

comment on table public.professional_invites is
  'Invite-only onboarding for Mental Health Professionals (internal role counsellor). Stores hashed invite tokens only.';

drop trigger if exists professional_invites_set_updated_at on public.professional_invites;
create trigger professional_invites_set_updated_at
  before update on public.professional_invites
  for each row execute function public.set_mhp_row_updated_at();

alter table public.professional_invites enable row level security;

-- ---------------------------------------------------------------------------
-- 2. mental_health_professional_profiles
-- ---------------------------------------------------------------------------

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
  enquiry_email text default 'ask.anything@psytec.com.sg',
  enquiry_mobile text default '+65 91681166',
  profile_visible boolean not null default false,
  profile_status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mental_health_professional_profiles_status_check
    check (profile_status in ('hidden', 'draft', 'pending_review', 'published', 'suspended'))
);

create unique index if not exists mental_health_professional_profiles_slug_unique_idx
  on public.mental_health_professional_profiles (profile_slug)
  where profile_slug is not null;

comment on table public.mental_health_professional_profiles is
  'Mental Health Professional public-facing profile metadata. Internal auth role remains counsellor.';

drop trigger if exists mental_health_professional_profiles_set_updated_at
  on public.mental_health_professional_profiles;
create trigger mental_health_professional_profiles_set_updated_at
  before update on public.mental_health_professional_profiles
  for each row execute function public.set_mhp_row_updated_at();

alter table public.mental_health_professional_profiles enable row level security;

-- ---------------------------------------------------------------------------
-- 3. mental_health_professional_license_documents
-- ---------------------------------------------------------------------------

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
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mental_health_professional_license_documents_document_status_check
    check (document_status in ('uploaded', 'extracted', 'needs_review', 'accepted', 'rejected', 'expired')),
  constraint mental_health_professional_license_documents_extraction_status_check
    check (extraction_status in ('pending', 'processing', 'completed', 'failed'))
);

create index if not exists mental_health_professional_license_documents_user_idx
  on public.mental_health_professional_license_documents (user_id, created_at desc);

create unique index if not exists mental_health_professional_license_documents_storage_unique_idx
  on public.mental_health_professional_license_documents (storage_bucket, storage_path);

comment on table public.mental_health_professional_license_documents is
  'Private licence PDF metadata and AI extraction results. PDF bytes live in private storage only.';

drop trigger if exists mental_health_professional_license_documents_set_updated_at
  on public.mental_health_professional_license_documents;
create trigger mental_health_professional_license_documents_set_updated_at
  before update on public.mental_health_professional_license_documents
  for each row execute function public.set_mhp_row_updated_at();

alter table public.mental_health_professional_license_documents enable row level security;

-- ---------------------------------------------------------------------------
-- 4. mental_health_professional_memberships
-- ---------------------------------------------------------------------------

create table if not exists public.mental_health_professional_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  institution_name text,
  membership_status text not null default 'pending_review',
  institutional_membership_expires_at timestamptz,
  source_license_document_id uuid references public.mental_health_professional_license_documents(id),
  updated_at timestamptz not null default now(),
  constraint mental_health_professional_memberships_status_check
    check (membership_status in ('pending_review', 'active', 'expired', 'suspended'))
);

comment on table public.mental_health_professional_memberships is
  'Institutional membership expiry and activation. Professionals cannot self-approve or extend membership.';

drop trigger if exists mental_health_professional_memberships_set_updated_at
  on public.mental_health_professional_memberships;
create trigger mental_health_professional_memberships_set_updated_at
  before update on public.mental_health_professional_memberships
  for each row execute function public.set_mhp_row_updated_at();

alter table public.mental_health_professional_memberships enable row level security;

-- ---------------------------------------------------------------------------
-- Grants (RLS still applies)
-- ---------------------------------------------------------------------------

grant select, insert, update on public.professional_invites to authenticated;
grant select, insert, update on public.mental_health_professional_profiles to authenticated;
grant select, insert, update on public.mental_health_professional_license_documents to authenticated;
grant select on public.mental_health_professional_memberships to authenticated;
grant insert, update, delete on public.mental_health_professional_memberships to authenticated;

-- ---------------------------------------------------------------------------
-- RLS — professional_invites (admin / service role only)
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'professional_invites'
      and policyname = 'MHP admin manages professional invites'
  ) then
    create policy "MHP admin manages professional invites"
      on public.professional_invites
      for all
      to authenticated
      using (public.is_wayfinder_mhp_admin())
      with check (public.is_wayfinder_mhp_admin());
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS — mental_health_professional_profiles
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mental_health_professional_profiles'
      and policyname = 'Counsellors read own MHP profile'
  ) then
    create policy "Counsellors read own MHP profile"
      on public.mental_health_professional_profiles
      for select
      to authenticated
      using (
        user_id = auth.uid()
        and public.is_wayfinder_counsellor()
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mental_health_professional_profiles'
      and policyname = 'Counsellors insert own MHP profile'
  ) then
    create policy "Counsellors insert own MHP profile"
      on public.mental_health_professional_profiles
      for insert
      to authenticated
      with check (
        user_id = auth.uid()
        and public.is_wayfinder_counsellor()
        and profile_status in ('hidden', 'draft')
        and profile_visible = false
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mental_health_professional_profiles'
      and policyname = 'Counsellors update own draft MHP profile'
  ) then
    create policy "Counsellors update own draft MHP profile"
      on public.mental_health_professional_profiles
      for update
      to authenticated
      using (
        user_id = auth.uid()
        and public.is_wayfinder_counsellor()
        and profile_status in ('hidden', 'draft')
      )
      with check (
        user_id = auth.uid()
        and public.is_wayfinder_counsellor()
        and profile_status in ('hidden', 'draft')
        and profile_visible = false
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mental_health_professional_profiles'
      and policyname = 'MHP admin manages MHP profiles'
  ) then
    create policy "MHP admin manages MHP profiles"
      on public.mental_health_professional_profiles
      for all
      to authenticated
      using (public.is_wayfinder_mhp_admin())
      with check (public.is_wayfinder_mhp_admin());
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS — mental_health_professional_license_documents
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mental_health_professional_license_documents'
      and policyname = 'Counsellors read own licence documents'
  ) then
    create policy "Counsellors read own licence documents"
      on public.mental_health_professional_license_documents
      for select
      to authenticated
      using (
        user_id = auth.uid()
        and public.is_wayfinder_counsellor()
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mental_health_professional_license_documents'
      and policyname = 'Counsellors insert own licence documents'
  ) then
    create policy "Counsellors insert own licence documents"
      on public.mental_health_professional_license_documents
      for insert
      to authenticated
      with check (
        user_id = auth.uid()
        and public.is_wayfinder_counsellor()
        and document_status = 'uploaded'
        and extraction_status = 'pending'
        and reviewed_by is null
        and reviewed_at is null
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mental_health_professional_license_documents'
      and policyname = 'Counsellors update own unreviewed licence documents'
  ) then
    create policy "Counsellors update own unreviewed licence documents"
      on public.mental_health_professional_license_documents
      for update
      to authenticated
      using (
        user_id = auth.uid()
        and public.is_wayfinder_counsellor()
        and document_status not in ('accepted', 'rejected', 'expired')
        and reviewed_by is null
      )
      with check (
        user_id = auth.uid()
        and public.is_wayfinder_counsellor()
        and document_status not in ('accepted', 'rejected', 'expired')
        and reviewed_by is null
        and reviewed_at is null
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mental_health_professional_license_documents'
      and policyname = 'MHP admin manages licence documents'
  ) then
    create policy "MHP admin manages licence documents"
      on public.mental_health_professional_license_documents
      for all
      to authenticated
      using (public.is_wayfinder_mhp_admin())
      with check (public.is_wayfinder_mhp_admin());
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS — mental_health_professional_memberships
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mental_health_professional_memberships'
      and policyname = 'Counsellors read own membership'
  ) then
    create policy "Counsellors read own membership"
      on public.mental_health_professional_memberships
      for select
      to authenticated
      using (
        user_id = auth.uid()
        and public.is_wayfinder_counsellor()
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mental_health_professional_memberships'
      and policyname = 'MHP admin manages memberships'
  ) then
    create policy "MHP admin manages memberships"
      on public.mental_health_professional_memberships
      for all
      to authenticated
      using (public.is_wayfinder_mhp_admin())
      with check (public.is_wayfinder_mhp_admin());
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Safe public profile RPCs (no raw auth UUIDs)
-- ---------------------------------------------------------------------------

create or replace function public.list_published_mental_health_professionals()
returns table(
  profile_slug text,
  full_name text,
  professional_title text,
  short_bio text,
  photo_url text,
  country_of_origin text,
  ethnicity text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.profile_slug,
    p.full_name,
    p.professional_title,
    p.short_bio,
    p.photo_url,
    p.country_of_origin,
    p.ethnicity
  from public.mental_health_professional_profiles p
  inner join public.mental_health_professional_memberships m
    on m.user_id = p.user_id
  where p.profile_status = 'published'
    and p.profile_visible = true
    and p.profile_slug is not null
    and m.membership_status = 'active'
    and (
      m.institutional_membership_expires_at is null
      or m.institutional_membership_expires_at > now()
    )
  order by p.full_name nulls last, p.profile_slug;
$$;

comment on function public.list_published_mental_health_professionals() is
  'Parent-safe directory of active, published Mental Health Professional profiles. No auth UUIDs or licence paths.';

revoke all on function public.list_published_mental_health_professionals() from public;
grant execute on function public.list_published_mental_health_professionals() to authenticated;
grant execute on function public.list_published_mental_health_professionals() to anon;

create or replace function public.get_published_mental_health_professional_profile(p_profile_slug text)
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
  enquiry_mobile text
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
    p.enquiry_mobile
  from public.mental_health_professional_profiles p
  inner join public.mental_health_professional_memberships m
    on m.user_id = p.user_id
  where p.profile_slug = trim(p_profile_slug)
    and p.profile_status = 'published'
    and p.profile_visible = true
    and m.membership_status = 'active'
    and (
      m.institutional_membership_expires_at is null
      or m.institutional_membership_expires_at > now()
    )
  limit 1;
$$;

comment on function public.get_published_mental_health_professional_profile(text) is
  'Parent-safe published Mental Health Professional profile by slug. No auth UUIDs, licence PDF paths, or extraction JSON.';

revoke all on function public.get_published_mental_health_professional_profile(text) from public;
grant execute on function public.get_published_mental_health_professional_profile(text) to authenticated;
grant execute on function public.get_published_mental_health_professional_profile(text) to anon;

-- ---------------------------------------------------------------------------
-- Private storage bucket instructions (owner-applied in Supabase Dashboard)
-- ---------------------------------------------------------------------------
--
-- Bucket name: professional-license-documents
-- Public bucket: OFF (private by default)
--
-- Do NOT create public storage policies for licence PDFs.
-- Recommended object path convention: {user_id}/{document_id}.pdf
--
-- Example owner-applied storage policies (run separately after bucket creation):
--
--   -- Professionals upload/read only their own folder
--   create policy "MHP owner read own licence objects"
--     on storage.objects for select to authenticated
--     using (
--       bucket_id = 'professional-license-documents'
--       and (storage.foldername(name))[1] = auth.uid()::text
--       and public.is_wayfinder_counsellor()
--     );
--
--   create policy "MHP owner insert own licence objects"
--     on storage.objects for insert to authenticated
--     with check (
--       bucket_id = 'professional-license-documents'
--       and (storage.foldername(name))[1] = auth.uid()::text
--       and public.is_wayfinder_counsellor()
--     );
--
--   create policy "MHP owner update own licence objects"
--     on storage.objects for update to authenticated
--     using (
--       bucket_id = 'professional-license-documents'
--       and (storage.foldername(name))[1] = auth.uid()::text
--       and public.is_wayfinder_counsellor()
--     )
--     with check (
--       bucket_id = 'professional-license-documents'
--       and (storage.foldername(name))[1] = auth.uid()::text
--       and public.is_wayfinder_counsellor()
--     );
--
-- Admin review downloads should use service_role or a future admin RPC — not public URLs.
--
-- ============================================================
-- Notes:
--   - Internal role remains counsellor; do not rename counsellor.html or helpers.
--   - Invite acceptance, upload runtime, AI extraction, and admin UI are later PRs.
--   - Owner must apply this SQL manually after merge.
-- ============================================================
