-- ============================================================
-- Wayfinder MHP invite approval token contract
-- PR #131 — Owner-admin MHP invite approval token contract
-- ============================================================
--
-- Owner-applied only. Run manually in Supabase SQL Editor.
--
-- Purpose:
--   Allow owner/admin to approve a pending MHP colleague invite request
--   and generate a one-time controlled invitation token/link.
--   Does NOT create auth users, profiles, counsellor roles, membership,
--   or publication automatically.
--
-- Invitee signup / token consumption: deferred to PR #132.
-- Planned invite link route (PR #132):
--   /counsellor.html?mhp_invite=<token>
--
-- Prerequisites:
--   - supabase-mhp-invite-requests.sql
--   - public.is_wayfinder_owner_admin()
--   - pgcrypto extension (enabled by default on Supabase)
--
-- This PR does NOT:
--   - create Supabase auth users or profiles
--   - assign counsellor role or membership
--   - publish MHP profiles
--   - send external email automatically
--   - grant browser SELECT/INSERT/UPDATE/DELETE on token table
--   - expose token hashes to browser lists
--
-- After apply, verify (as owner admin via RPC only):
--   select * from public.create_mhp_invite_token_from_request('<pending-request-uuid>');

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.mental_health_professional_invite_requests') is null then
    raise exception 'MHP invite approval token contract blocked: mental_health_professional_invite_requests does not exist. Apply supabase-mhp-invite-requests.sql first.'
      using errcode = 'P0001';
  end if;

  if to_regprocedure('public.is_wayfinder_owner_admin()') is null then
    raise exception 'MHP invite approval token contract blocked: is_wayfinder_owner_admin() does not exist. Apply supabase-mhp-owner-publish-contract.sql first.'
      using errcode = 'P0001';
  end if;
end;
$$;

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- 1. Invite tokens table
-- ---------------------------------------------------------------------------
-- Raw invite token is never stored. token_hash stores SHA-256 hex digest only.
-- No authenticated table grants — owner/admin uses SECURITY DEFINER RPC only.

create table if not exists public.mental_health_professional_invite_tokens (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.mental_health_professional_invite_requests(id) on delete cascade,
  invited_email text not null,
  invited_name text not null,
  token_hash text not null,
  token_status text not null default 'active',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_by uuid references auth.users(id) on delete set null,
  consumed_at timestamptz,
  revoked_at timestamptz,
  constraint mhp_invite_tokens_status_check check (
    token_status in ('active', 'consumed', 'revoked')
  ),
  constraint mhp_invite_tokens_invited_email_check check (btrim(invited_email) <> ''),
  constraint mhp_invite_tokens_invited_name_check check (btrim(invited_name) <> ''),
  constraint mhp_invite_tokens_token_hash_check check (btrim(token_hash) <> '')
);

comment on table public.mental_health_professional_invite_tokens is
  'Owner/admin-controlled MHP invitation tokens. Hash only — raw token returned once from RPC.';

create unique index if not exists mhp_invite_tokens_token_hash_key
  on public.mental_health_professional_invite_tokens (token_hash);

create index if not exists mhp_invite_tokens_request_status_idx
  on public.mental_health_professional_invite_tokens (request_id, token_status);

create index if not exists mhp_invite_tokens_status_expires_idx
  on public.mental_health_professional_invite_tokens (token_status, expires_at);

alter table public.mental_health_professional_invite_tokens enable row level security;

revoke all on public.mental_health_professional_invite_tokens from public;
revoke all on public.mental_health_professional_invite_tokens from anon;
revoke all on public.mental_health_professional_invite_tokens from authenticated;

-- No authenticated policies — parents and counsellors have no access.
-- PR #132 will add token verification/consumption via SECURITY DEFINER RPC.

-- ---------------------------------------------------------------------------
-- 2. Owner/admin approval RPC
-- ---------------------------------------------------------------------------

create or replace function public.create_mhp_invite_token_from_request(
  p_request_id uuid,
  p_expires_days integer default 7
)
returns table(
  request_id uuid,
  invited_email text,
  invited_name text,
  invite_token text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_request public.mental_health_professional_invite_requests%rowtype;
  v_raw_token text;
  v_token_hash text;
  v_expires_at timestamptz;
  v_expires_days integer;
begin
  if not public.is_wayfinder_owner_admin() then
    raise exception 'Owner admin required.'
      using errcode = '42501';
  end if;

  if p_request_id is null then
    raise exception 'Request id is required.'
      using errcode = 'P0001';
  end if;

  v_expires_days := coalesce(p_expires_days, 7);
  if v_expires_days < 1 or v_expires_days > 30 then
    raise exception 'Expiry days must be between 1 and 30.'
      using errcode = 'P0001';
  end if;

  select *
    into v_request
  from public.mental_health_professional_invite_requests r
  where r.id = p_request_id
  for update;

  if not found then
    raise exception 'Invite request not found.'
      using errcode = 'P0001';
  end if;

  if v_request.status not in ('pending', 'reviewing') then
    raise exception 'Invite request is not awaiting approval.'
      using errcode = 'P0001';
  end if;

  v_expires_at := now() + make_interval(days => v_expires_days);
  v_raw_token := encode(gen_random_bytes(32), 'hex');
  v_token_hash := encode(digest(v_raw_token, 'sha256'), 'hex');

  update public.mental_health_professional_invite_tokens t
  set
    token_status = 'revoked',
    revoked_at = now()
  where t.request_id = p_request_id
    and t.token_status = 'active';

  update public.mental_health_professional_invite_requests r
  set
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    updated_at = now()
  where r.id = p_request_id;

  insert into public.mental_health_professional_invite_tokens (
    request_id,
    invited_email,
    invited_name,
    token_hash,
    token_status,
    created_by,
    expires_at
  )
  values (
    p_request_id,
    lower(btrim(v_request.colleague_email)),
    btrim(v_request.colleague_name),
    v_token_hash,
    'active',
    auth.uid(),
    v_expires_at
  );

  return query
  select
    p_request_id,
    lower(btrim(v_request.colleague_email)),
    btrim(v_request.colleague_name),
    v_raw_token,
    v_expires_at;
end;
$$;

revoke all on function public.create_mhp_invite_token_from_request(uuid, integer) from public;
grant execute on function public.create_mhp_invite_token_from_request(uuid, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Verification notes
-- ---------------------------------------------------------------------------
-- Owner admin approval (runtime PR #131):
--   RPC returns raw invite_token once — not stored in table (hash only).
--   Request status becomes approved; pending queue hides row on refresh.
--
-- Invitee route (PR #132 — not in this PR):
--   /counsellor.html?mhp_invite=<token>
--
-- Parent users and requesting counsellors must have zero access to token rows.
