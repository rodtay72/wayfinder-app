-- ============================================================
-- Wayfinder MHP owner admin review RPC
-- PR #105 — Owner Admin MHP Review and Publish Page
-- ============================================================
--
-- Owner-applied only. Run manually in Supabase SQL Editor.
--
-- Purpose:
--   Add owner-only list RPC for the admin review page at /admin.html.
--
-- Prerequisites:
--   - supabase-mhp-profile-license.sql
--   - supabase-mhp-owner-publish-contract.sql (owner_admin_users,
--     is_wayfinder_owner_admin, owner_set_mhp_publication)
--   - supabase-mhp-profile-accreditation-number.sql (accreditation_number column)
--
-- This PR does NOT:
--   - expose anon access
--   - add public table read policies
--   - return licence PDF paths, extracted JSON, invite tokens, or auth emails
--   - change app runtime (apply SQL before using admin page)
--
-- After apply, verify (as owner admin):
--   select * from public.owner_list_mhp_profiles();

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regprocedure('public.is_wayfinder_owner_admin()') is null then
    raise exception 'MHP owner admin review RPC blocked: is_wayfinder_owner_admin() does not exist. Apply supabase-mhp-owner-publish-contract.sql first.'
      using errcode = 'P0001';
  end if;

  if to_regclass('public.mental_health_professional_profiles') is null then
    raise exception 'MHP owner admin review RPC blocked: mental_health_professional_profiles does not exist.'
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Owner MHP review list RPC
-- ---------------------------------------------------------------------------

create or replace function public.owner_list_mhp_profiles()
returns table(
  mhp_user_id uuid,
  wayfinder_id text,
  full_name text,
  professional_title text,
  license_registration_number text,
  accreditation_number text,
  issuing_body text,
  short_bio text,
  country_of_origin text,
  ethnicity text,
  enquiry_email text,
  enquiry_mobile text,
  photo_url text,
  profile_status text,
  profile_visible boolean,
  profile_updated_at timestamptz,
  membership_status text,
  institution_name text,
  membership_expires_at timestamptz,
  latest_document_status text,
  latest_extraction_status text,
  latest_original_filename text,
  latest_extracted_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_wayfinder_owner_admin() then
    raise exception 'Owner admin required.'
      using errcode = '42501';
  end if;

  return query
  select
    p.user_id as mhp_user_id,
    p.parent_id as wayfinder_id,
    nullif(trim(mhp.full_name), '') as full_name,
    nullif(trim(mhp.professional_title), '') as professional_title,
    nullif(trim(mhp.license_registration_number), '') as license_registration_number,
    nullif(trim(mhp.accreditation_number), '') as accreditation_number,
    nullif(trim(mhp.issuing_body), '') as issuing_body,
    nullif(trim(mhp.short_bio), '') as short_bio,
    nullif(trim(mhp.country_of_origin), '') as country_of_origin,
    nullif(trim(mhp.ethnicity), '') as ethnicity,
    nullif(trim(mhp.enquiry_email), '') as enquiry_email,
    nullif(trim(mhp.enquiry_mobile), '') as enquiry_mobile,
    nullif(trim(mhp.photo_url), '') as photo_url,
    mhp.profile_status,
    mhp.profile_visible,
    mhp.updated_at as profile_updated_at,
    coalesce(m.membership_status, 'pending_review') as membership_status,
    nullif(trim(m.institution_name), '') as institution_name,
    m.institutional_membership_expires_at as membership_expires_at,
    ld.document_status as latest_document_status,
    ld.extraction_status as latest_extraction_status,
    ld.original_filename as latest_original_filename,
    ld.extracted_at as latest_extracted_at
  from public.profiles p
  inner join public.mental_health_professional_profiles mhp
    on mhp.user_id = p.user_id
  left join public.mental_health_professional_memberships m
    on m.user_id = p.user_id
  left join lateral (
    select
      d.document_status,
      d.extraction_status,
      d.original_filename,
      d.extracted_at
    from public.mental_health_professional_license_documents d
    where d.user_id = p.user_id
    order by d.created_at desc
    limit 1
  ) ld on true
  where p.role = 'counsellor'
  order by
    case mhp.profile_status
      when 'pending_review' then 1
      when 'draft' then 2
      when 'published' then 3
      when 'hidden' then 4
      when 'suspended' then 5
      else 6
    end,
    mhp.updated_at desc nulls last,
    p.parent_id asc nulls last;
end;
$$;

revoke all on function public.owner_list_mhp_profiles() from public;
grant execute on function public.owner_list_mhp_profiles() to authenticated;

-- ============================================================
-- End of MHP owner admin review RPC
-- ============================================================
