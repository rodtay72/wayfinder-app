-- ============================================================
-- Wayfinder MHP owner publication contract
-- PR #104 — Owner-admin publication model + published-only parent selector
-- ============================================================
--
-- Owner-applied only. Run manually in Supabase SQL Editor.
--
-- Purpose:
--   Fix the MHP publication model before building the owner admin review page.
--   MHP draft/profile completion is not publication. Only Wayfinder owner/admin
--   can approve/publish. Parent journal-sharing dropdown lists only published
--   + active Mental Health Professional profiles.
--
-- Based on:
--   supabase-mhp-profile-license.sql
--   supabase-list-available-counsellors-mhp-complete-only.sql
--   docs/MHP_OWNER_HANDOFF_RUNBOOK.md
--
-- Prerequisites:
--   - public.profiles
--   - public.is_wayfinder_counsellor()
--   - public.mental_health_professional_profiles
--   - public.mental_health_professional_memberships
--
-- This PR does NOT:
--   - change app.js, supabase.js, api/*, auth, or ensure_profile
--   - allow browser/MHP self-publish
--   - activate membership automatically
--   - build owner admin UI or public profile directory UI
--   - expose licence PDFs, storage paths, or extraction JSON
--   - change profiles.parent_id or auth role values
--
-- User-facing label: Mental Health Professional / MHP
-- Internal role value: counsellor
--
-- After apply, verify:
--   select public.is_wayfinder_owner_admin();
--   select * from public.list_available_counsellors();
--   -- Expect only published + active MHP rows with non-blank full_name

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'MHP owner publish contract blocked: public.profiles does not exist.'
      using errcode = 'P0001';
  end if;

  if to_regclass('public.mental_health_professional_profiles') is null then
    raise exception 'MHP owner publish contract blocked: mental_health_professional_profiles does not exist.'
      using errcode = 'P0001';
  end if;

  if to_regclass('public.mental_health_professional_memberships') is null then
    raise exception 'MHP owner publish contract blocked: mental_health_professional_memberships does not exist.'
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Owner admin registry
-- ---------------------------------------------------------------------------
-- Owner manually inserts admin user_id rows in Supabase SQL Editor.
-- No authenticated INSERT/UPDATE/DELETE policy on this table.

create table if not exists public.owner_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  admin_status text not null default 'active',
  created_at timestamptz not null default now(),
  constraint owner_admin_users_status_check check (admin_status in ('active', 'suspended'))
);

alter table public.owner_admin_users enable row level security;

revoke all on public.owner_admin_users from public;
-- No grant to authenticated — admin checks use SECURITY DEFINER helper only.

-- ---------------------------------------------------------------------------
-- 2. Owner admin helper
-- ---------------------------------------------------------------------------

create or replace function public.is_wayfinder_owner_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.owner_admin_users oa
    where oa.user_id = auth.uid()
      and oa.admin_status = 'active'
  );
$$;

revoke all on function public.is_wayfinder_owner_admin() from public;
grant execute on function public.is_wayfinder_owner_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Owner-controlled MHP publication RPC
-- ---------------------------------------------------------------------------
-- The only supported publication path until owner admin UI is built.
-- Does not change auth role, profiles.parent_id, or licence document records.

create or replace function public.owner_set_mhp_publication(
  p_mhp_user_id uuid,
  p_profile_status text,
  p_profile_visible boolean,
  p_membership_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_profile_status text := lower(trim(p_profile_status));
  normalized_membership_status text := lower(trim(p_membership_status));
begin
  if not public.is_wayfinder_owner_admin() then
    raise exception 'Owner admin required.'
      using errcode = '42501';
  end if;

  if p_mhp_user_id is null then
    raise exception 'MHP user id is required.'
      using errcode = 'P0001';
  end if;

  if normalized_profile_status not in (
    'draft', 'pending_review', 'published', 'hidden', 'suspended'
  ) then
    raise exception 'Invalid profile status: %', normalized_profile_status
      using errcode = 'P0001';
  end if;

  if normalized_membership_status not in (
    'pending_review', 'active', 'expired', 'suspended'
  ) then
    raise exception 'Invalid membership status: %', normalized_membership_status
      using errcode = 'P0001';
  end if;

  if normalized_profile_status = 'published' then
    if coalesce(p_profile_visible, false) is not true then
      raise exception 'Published profiles require profile_visible = true.'
        using errcode = 'P0001';
    end if;
    if normalized_membership_status <> 'active' then
      raise exception 'Published profiles require membership_status = active.'
        using errcode = 'P0001';
    end if;
  end if;

  if not exists (
    select 1
    from public.profiles pr
    where pr.user_id = p_mhp_user_id
      and pr.role = 'counsellor'
  ) then
    raise exception 'Target user is not a counsellor profile.'
      using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.mental_health_professional_profiles mhp
    where mhp.user_id = p_mhp_user_id
  ) then
    raise exception 'MHP profile row does not exist for this user.'
      using errcode = 'P0001';
  end if;

  update public.mental_health_professional_profiles
  set
    profile_status = normalized_profile_status,
    profile_visible = coalesce(p_profile_visible, false),
    updated_at = now()
  where user_id = p_mhp_user_id;

  insert into public.mental_health_professional_memberships (
    user_id,
    membership_status,
    updated_at
  )
  values (
    p_mhp_user_id,
    normalized_membership_status,
    now()
  )
  on conflict (user_id) do update
  set
    membership_status = excluded.membership_status,
    updated_at = excluded.updated_at;
end;
$$;

revoke all on function public.owner_set_mhp_publication(uuid, text, boolean, text) from public;
grant execute on function public.owner_set_mhp_publication(uuid, text, boolean, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Parent journal-sharing selector — published + active MHPs only
-- ---------------------------------------------------------------------------
-- Replaces list_available_counsellors() from C6d/C6e.
-- Parent/client UI must not show MHPs merely because full_name is populated.
-- Only owner-published, active, non-expired MHP profiles appear.

drop function if exists public.list_available_counsellors();

create function public.list_available_counsellors()
returns table(
  wayfinder_id text,
  display_label text,
  full_name text,
  professional_title text,
  institution_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.parent_id as wayfinder_id,
    coalesce(
      nullif(trim(mhp.full_name), ''),
      nullif(trim(mhp.professional_title), ''),
      nullif(trim(m.institution_name), ''),
      'Mental Health Professional ' || p.parent_id
    ) as display_label,
    nullif(trim(mhp.full_name), '') as full_name,
    nullif(trim(mhp.professional_title), '') as professional_title,
    nullif(trim(m.institution_name), '') as institution_name
  from public.profiles p
  join public.mental_health_professional_profiles mhp
    on mhp.user_id = p.user_id
  join public.mental_health_professional_memberships m
    on m.user_id = p.user_id
  where p.role = 'counsellor'
    and p.parent_id is not null
    and nullif(trim(mhp.full_name), '') is not null
    and mhp.profile_status = 'published'
    and mhp.profile_visible = true
    and m.membership_status = 'active'
    and (
      m.institutional_membership_expires_at is null
      or m.institutional_membership_expires_at > now()
    )
  order by
    nullif(trim(mhp.full_name), '') asc,
    p.parent_id asc;
$$;

revoke all on function public.list_available_counsellors() from public;
grant execute on function public.list_available_counsellors() to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Owner setup notes (manual)
-- ---------------------------------------------------------------------------
-- 1. Insert the owner admin auth user_id:
--      insert into public.owner_admin_users (user_id, admin_status)
--      values ('<owner-auth-user-uuid>', 'active');
-- 2. Verify admin helper while signed in as owner:
--      select public.is_wayfinder_owner_admin();
-- 3. Publish an MHP (example — replace UUID):
--      select public.owner_set_mhp_publication(
--        '<mhp-auth-user-uuid>'::uuid,
--        'published',
--        true,
--        'active'
--      );
-- 4. Verify parent selector:
--      select * from public.list_available_counsellors();

-- ============================================================
-- End of MHP owner publication contract
-- ============================================================
