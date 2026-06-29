-- ============================================================
-- Wayfinder MHP invite request intake contract
-- PR #129 — Admin-visible MHP invite request intake
-- ============================================================
--
-- Owner-applied only. Run manually in Supabase SQL Editor.
--
-- Purpose:
--   Store Mental Health Professional colleague invite *requests*
--   for Wayfinder owner/admin review. A request must never create
--   auth users, profiles, counsellor roles, invite tokens, membership,
--   or publication automatically.
--
-- Based on:
--   supabase-counsellor-rls.sql (is_wayfinder_counsellor)
--   supabase-mhp-owner-publish-contract.sql (is_wayfinder_owner_admin)
--   docs/MHP_OWNER_HANDOFF_RUNBOOK.md
--
-- Prerequisites:
--   - auth.users
--   - public.profiles
--   - public.is_wayfinder_counsellor()
--   - public.is_wayfinder_owner_admin()
--
-- This PR does NOT:
--   - create Supabase auth users or profiles for invitees
--   - assign counsellor role or membership
--   - create invite tokens or send email
--   - expose parent journal/reflection/child data
--   - weaken existing RLS on profiles, journal_entries, dyads, MHP profiles,
--     licence documents, or storage
--
-- Email normalisation:
--   colleague_email is trimmed and lowercased on INSERT/UPDATE via trigger.
--
-- After apply, verify (expect zero rows until runtime submit):
--   select status, count(*)
--   from public.mental_health_professional_invite_requests
--   group by 1;

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'MHP invite requests contract blocked: public.profiles does not exist.'
      using errcode = 'P0001';
  end if;

  if to_regprocedure('public.is_wayfinder_counsellor()') is null then
    raise exception 'MHP invite requests contract blocked: is_wayfinder_counsellor() does not exist.'
      using errcode = 'P0001';
  end if;

  if to_regprocedure('public.is_wayfinder_owner_admin()') is null then
    raise exception 'MHP invite requests contract blocked: is_wayfinder_owner_admin() does not exist. Apply supabase-mhp-owner-publish-contract.sql first.'
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Invite requests table
-- ---------------------------------------------------------------------------

create table if not exists public.mental_health_professional_invite_requests (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references auth.users(id) on delete cascade,
  requester_profile_id uuid references public.profiles(user_id) on delete set null,
  requester_parent_id text,
  colleague_name text not null,
  colleague_email text not null,
  note text,
  status text not null default 'pending',
  admin_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mhp_invite_requests_status_check check (
    status in ('pending', 'reviewing', 'approved', 'declined', 'cancelled')
  ),
  constraint mhp_invite_requests_colleague_name_check check (btrim(colleague_name) <> ''),
  constraint mhp_invite_requests_colleague_email_check check (btrim(colleague_email) <> '')
);

comment on table public.mental_health_professional_invite_requests is
  'Admin-reviewed MHP colleague invite requests. Does not provision access.';

comment on column public.mental_health_professional_invite_requests.requester_profile_id is
  'Optional profiles.user_id of the requesting counsellor (profiles PK is user_id).';

comment on column public.mental_health_professional_invite_requests.requester_parent_id is
  'Optional Wayfinder ID of the requesting counsellor — not parent journal data.';

comment on column public.mental_health_professional_invite_requests.colleague_email is
  'Trimmed and lowercased by trigger before write.';

create index if not exists mhp_invite_requests_status_created_idx
  on public.mental_health_professional_invite_requests (status, created_at desc);

create index if not exists mhp_invite_requests_requester_idx
  on public.mental_health_professional_invite_requests (requester_user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 2. Row normalisation + updated_at
-- ---------------------------------------------------------------------------

create or replace function public.normalize_mhp_invite_request_row()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.colleague_name := btrim(new.colleague_name);
  new.colleague_email := lower(btrim(new.colleague_email));
  if new.note is not null then
    new.note := nullif(btrim(new.note), '');
  end if;
  if new.admin_note is not null then
    new.admin_note := nullif(btrim(new.admin_note), '');
  end if;
  if new.requester_parent_id is not null then
    new.requester_parent_id := nullif(btrim(new.requester_parent_id), '');
  end if;
  return new;
end;
$$;

create or replace function public.set_mhp_invite_request_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_normalize_mhp_invite_request_row
  on public.mental_health_professional_invite_requests;

create trigger trg_normalize_mhp_invite_request_row
  before insert or update on public.mental_health_professional_invite_requests
  for each row
  execute function public.normalize_mhp_invite_request_row();

drop trigger if exists trg_set_mhp_invite_request_updated_at
  on public.mental_health_professional_invite_requests;

create trigger trg_set_mhp_invite_request_updated_at
  before update on public.mental_health_professional_invite_requests
  for each row
  execute function public.set_mhp_invite_request_updated_at();

-- ---------------------------------------------------------------------------
-- 3. RLS and grants
-- ---------------------------------------------------------------------------
-- PR #129 is read-only intake.
-- Owner/admin approval, status updates, admin notes, invite-token creation,
-- and controlled invitation actions are deferred to PR #130.
--
-- Parents have no policy — no access.
-- Counsellors may insert pending requests for themselves and read own safe columns.
-- Owner/admin may read all rows via the same client-safe column grant.
-- No client UPDATE/DELETE in PR #129.

alter table public.mental_health_professional_invite_requests enable row level security;

revoke all on public.mental_health_professional_invite_requests from public;
revoke all on public.mental_health_professional_invite_requests from anon;
revoke all on public.mental_health_professional_invite_requests from authenticated;

grant select (
  id,
  requester_user_id,
  requester_profile_id,
  requester_parent_id,
  colleague_name,
  colleague_email,
  note,
  status,
  created_at,
  updated_at
) on public.mental_health_professional_invite_requests to authenticated;

grant insert (
  requester_user_id,
  requester_profile_id,
  requester_parent_id,
  colleague_name,
  colleague_email,
  note
) on public.mental_health_professional_invite_requests to authenticated;

drop policy if exists "Counsellors insert own MHP invite requests"
  on public.mental_health_professional_invite_requests;

create policy "Counsellors insert own MHP invite requests"
  on public.mental_health_professional_invite_requests
  for insert
  to authenticated
  with check (
    public.is_wayfinder_counsellor()
    and requester_user_id = auth.uid()
    and (requester_profile_id is null or requester_profile_id = auth.uid())
    and (
      requester_parent_id is null
      or exists (
        select 1
        from public.profiles p
        where p.user_id = auth.uid()
          and p.parent_id = requester_parent_id
      )
    )
    and status = 'pending'
    and btrim(colleague_name) <> ''
    and btrim(colleague_email) <> ''
  );

drop policy if exists "Owner admin insert MHP invite requests"
  on public.mental_health_professional_invite_requests;

create policy "Owner admin insert MHP invite requests"
  on public.mental_health_professional_invite_requests
  for insert
  to authenticated
  with check (
    public.is_wayfinder_owner_admin()
    and requester_user_id = auth.uid()
    and (requester_profile_id is null or requester_profile_id = auth.uid())
    and (
      requester_parent_id is null
      or exists (
        select 1
        from public.profiles p
        where p.user_id = auth.uid()
          and p.parent_id = requester_parent_id
      )
    )
    and status = 'pending'
  );

drop policy if exists "Counsellors read own MHP invite requests"
  on public.mental_health_professional_invite_requests;

create policy "Counsellors read own MHP invite requests"
  on public.mental_health_professional_invite_requests
  for select
  to authenticated
  using (
    public.is_wayfinder_counsellor()
    and requester_user_id = auth.uid()
  );

drop policy if exists "Owner admin read MHP invite requests"
  on public.mental_health_professional_invite_requests;

create policy "Owner admin read MHP invite requests"
  on public.mental_health_professional_invite_requests
  for select
  to authenticated
  using (public.is_wayfinder_owner_admin());

drop policy if exists "Owner admin update MHP invite requests"
  on public.mental_health_professional_invite_requests;

drop policy if exists "Owner admin delete MHP invite requests"
  on public.mental_health_professional_invite_requests;

-- PR #130 will add owner/admin UPDATE/DELETE policies and controlled approval RPCs
-- with separate column grants or SECURITY DEFINER paths for admin_note/reviewed_*.

-- ---------------------------------------------------------------------------
-- 4. Verification notes
-- ---------------------------------------------------------------------------
-- Counsellor submit (runtime PR #129):
--   insert pending row only — client cannot set status (table default applies).
--   Client cannot SELECT admin_note, reviewed_by, or reviewed_at.
--
-- Owner admin intake (read-only in PR #129; approval in PR #130):
--   select id, colleague_name, colleague_email, note, status, requester_parent_id, created_at
--   from public.mental_health_professional_invite_requests
--   where status = 'pending'
--   order by created_at desc;
--
-- Parent users must receive zero rows from this table via RLS.
