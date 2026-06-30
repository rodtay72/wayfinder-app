-- ============================================================
-- Wayfinder MHP invite token acceptance contract
-- PR #132 — Invited MHP token acceptance and onboarding entry
-- ============================================================
--
-- Owner-applied only. Run manually in Supabase SQL Editor.
--
-- Purpose:
--   Allow invited Mental Health Professionals to validate and consume
--   one-time invite tokens at /counsellor.html?mhp_invite=<token>.
--   Grants controlled onboarding access only — not publication.
--
-- Prerequisites:
--   - supabase-mhp-invite-approval-token-contract.sql
--   - public.profiles
--   - public.mental_health_professional_profiles
--   - public.mental_health_professional_memberships
--
-- Invitee route:
--   /counsellor.html?mhp_invite=<token>
--
-- This PR does NOT:
--   - create Supabase auth users
--   - publish MHP profiles or activate public membership
--   - grant parent/journal/child access
--   - store raw tokens
--   - grant browser access to token table
--   - modify ensure_profile or browser profile writes
--
-- After apply, verify:
--   select * from public.get_mhp_invite_token_status('<raw-token-from-owner>');
--   -- Then as invited verified user:
--   select * from public.consume_mhp_invite_token_for_current_user('<raw-token>');

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.mental_health_professional_invite_tokens') is null then
    raise exception 'MHP invite token acceptance blocked: mental_health_professional_invite_tokens does not exist. Apply supabase-mhp-invite-approval-token-contract.sql first.'
      using errcode = 'P0001';
  end if;

  if to_regclass('public.profiles') is null then
    raise exception 'MHP invite token acceptance blocked: public.profiles does not exist.'
      using errcode = 'P0001';
  end if;

  if to_regclass('public.mental_health_professional_memberships') is null then
    raise exception 'MHP invite token acceptance blocked: mental_health_professional_memberships does not exist.'
      using errcode = 'P0001';
  end if;
end;
$$;

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- 1. Token hash helper
-- ---------------------------------------------------------------------------

create or replace function public.hash_mhp_invite_token(p_token text)
returns text
language sql
immutable
set search_path = public, extensions
as $$
  select encode(digest(btrim(coalesce(p_token, '')), 'sha256'), 'hex');
$$;

revoke all on function public.hash_mhp_invite_token(text) from public;
-- Internal helper only — not granted to browser roles.

-- ---------------------------------------------------------------------------
-- 2. Public token status RPC (anon + authenticated)
-- ---------------------------------------------------------------------------
-- Requires possession of raw token. Returns minimal invitee-safe data only.

create or replace function public.get_mhp_invite_token_status(p_token text)
returns table(
  valid boolean,
  status text,
  invited_email text,
  invited_name text,
  expires_at timestamptz,
  message text
)
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_token_hash text;
  v_row public.mental_health_professional_invite_tokens%rowtype;
begin
  if p_token is null or btrim(p_token) = '' then
    return query
    select false, 'invalid'::text, null::text, null::text, null::timestamptz,
      'This invitation link is invalid or incomplete.'::text;
    return;
  end if;

  v_token_hash := public.hash_mhp_invite_token(p_token);

  select *
    into v_row
  from public.mental_health_professional_invite_tokens t
  where t.token_hash = v_token_hash;

  if not found then
    return query
    select false, 'invalid'::text, null::text, null::text, null::timestamptz,
      'This invitation link is invalid or has expired.'::text;
    return;
  end if;

  if v_row.token_status = 'consumed' then
    return query
    select false, 'consumed'::text, null::text, null::text, null::timestamptz,
      'This invitation link has already been used.'::text;
    return;
  end if;

  if v_row.token_status = 'revoked' then
    return query
    select false, 'revoked'::text, null::text, null::text, null::timestamptz,
      'This invitation link is no longer active.'::text;
    return;
  end if;

  if v_row.expires_at <= now() then
    return query
    select false, 'expired'::text, null::text, null::text, v_row.expires_at,
      'This invitation link has expired.'::text;
    return;
  end if;

  if v_row.token_status <> 'active' then
    return query
    select false, v_row.token_status, null::text, null::text, v_row.expires_at,
      'This invitation link is not available.'::text;
    return;
  end if;

  return query
  select true, 'active'::text, v_row.invited_email, v_row.invited_name, v_row.expires_at,
    'Invitation link is valid. Sign in or create an account with the invited email address.'::text;
end;
$$;

revoke all on function public.get_mhp_invite_token_status(text) from public;
grant execute on function public.get_mhp_invite_token_status(text) to anon;
grant execute on function public.get_mhp_invite_token_status(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Authenticated token consumption RPC
-- ---------------------------------------------------------------------------

create or replace function public.consume_mhp_invite_token_for_current_user(p_token text)
returns table(
  accepted boolean,
  role text,
  invited_email text,
  invited_name text,
  message text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_auth_email text;
  v_token_hash text;
  v_token_row public.mental_health_professional_invite_tokens%rowtype;
  v_profile public.profiles%rowtype;
  v_parent_id text;
  v_attempt integer := 0;
begin
  if v_user_id is null then
    raise exception 'Not authenticated'
      using errcode = '28000';
  end if;

  if p_token is null or btrim(p_token) = '' then
    return query
    select false, null::text, null::text, null::text,
      'This invitation link is invalid or incomplete.'::text;
    return;
  end if;

  select lower(trim(u.email))
    into v_auth_email
  from auth.users u
  where u.id = v_user_id;

  if v_auth_email is null or v_auth_email = '' then
    return query
    select false, null::text, null::text, null::text,
      'Your account email could not be verified for this invitation.'::text;
    return;
  end if;

  v_token_hash := public.hash_mhp_invite_token(p_token);

  select *
    into v_token_row
  from public.mental_health_professional_invite_tokens t
  where t.token_hash = v_token_hash
  for update;

  if not found then
    return query
    select false, null::text, null::text, null::text,
      'This invitation link is invalid or has expired.'::text;
    return;
  end if;

  if v_token_row.token_status = 'consumed' then
    if v_token_row.consumed_by = v_user_id then
      select *
        into v_profile
      from public.profiles p
      where p.user_id = v_user_id;

      if found and v_profile.role = 'counsellor' then
        return query
        select true, v_profile.role, v_token_row.invited_email, v_token_row.invited_name,
          'Invitation already accepted for this account.'::text;
        return;
      end if;
    end if;

    return query
    select false, null::text, null::text, null::text,
      'This invitation link has already been used.'::text;
    return;
  end if;

  if v_token_row.token_status = 'revoked' then
    return query
    select false, null::text, null::text, null::text,
      'This invitation link is no longer active.'::text;
    return;
  end if;

  if v_token_row.expires_at <= now() then
    return query
    select false, null::text, null::text, null::text,
      'This invitation link has expired.'::text;
    return;
  end if;

  if v_token_row.token_status <> 'active' then
    return query
    select false, null::text, null::text, null::text,
      'This invitation link is not available.'::text;
    return;
  end if;

  if v_auth_email <> lower(btrim(v_token_row.invited_email)) then
    return query
    select false, null::text, null::text, null::text,
      'Please sign in with the email address this invitation was sent to.'::text;
    return;
  end if;

  select *
    into v_profile
  from public.profiles p
  where p.user_id = v_user_id;

  if found and v_profile.role <> 'counsellor' then
    return query
    select false, v_profile.role, v_token_row.invited_email, v_token_row.invited_name,
      'This account cannot use this invitation. Please contact Wayfinder admin for support.'::text;
    return;
  end if;

  if not found then
    loop
      v_attempt := v_attempt + 1;
      v_parent_id := 'C-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 5));

      begin
        insert into public.profiles (user_id, parent_id, role)
        values (v_user_id, v_parent_id, 'counsellor')
        returning * into v_profile;
        exit;
      exception
        when unique_violation then
          select *
            into v_profile
          from public.profiles p
          where p.user_id = v_user_id;

          if found then
            if v_profile.role <> 'counsellor' then
              return query
              select false, v_profile.role, v_token_row.invited_email, v_token_row.invited_name,
                'This account cannot use this invitation. Please contact Wayfinder admin for support.'::text;
              return;
            end if;
            exit;
          end if;

          if v_attempt >= 5 then
            raise;
          end if;
      end;
    end loop;
  end if;

  insert into public.mental_health_professional_profiles (
    user_id,
    full_name,
    profile_status,
    profile_visible,
    enquiry_email,
    enquiry_mobile
  )
  values (
    v_user_id,
    btrim(v_token_row.invited_name),
    'draft',
    false,
    'ask.anything@psytec.com.sg',
    '+65 91681166'
  )
  on conflict (user_id) do nothing;

  insert into public.mental_health_professional_memberships as m (
    user_id,
    membership_status
  )
  values (
    v_user_id,
    'pending_review'
  )
  on conflict (user_id) do nothing;

  update public.mental_health_professional_invite_tokens t
  set
    token_status = 'consumed',
    consumed_by = v_user_id,
    consumed_at = now()
  where t.id = v_token_row.id;

  return query
  select true, 'counsellor'::text, v_token_row.invited_email, v_token_row.invited_name,
    'Invitation accepted. You may begin Mental Health Professional onboarding.'::text;
end;
$$;

revoke all on function public.consume_mhp_invite_token_for_current_user(text) from public;
grant execute on function public.consume_mhp_invite_token_for_current_user(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Journal read gate — active membership required
-- ---------------------------------------------------------------------------
-- Invited MHP onboarding uses is_wayfinder_counsellor() for profile/licence draft
-- RLS. Broad parent journal read must require active membership so pending_review
-- invitees cannot read parent journal_entries before owner/admin activation.

create or replace function public.can_read_parent_journals_as_mhp()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.mental_health_professional_memberships m
      on m.user_id = p.user_id
    where p.user_id = auth.uid()
      and p.role = 'counsellor'
      and m.membership_status = 'active'
      and (
        m.institutional_membership_expires_at is null
        or m.institutional_membership_expires_at > now()
      )
  );
$$;

revoke all on function public.can_read_parent_journals_as_mhp() from public;
grant execute on function public.can_read_parent_journals_as_mhp() to authenticated;

drop policy if exists "Counsellors can read journal entries"
  on public.journal_entries;

create policy "Counsellors can read journal entries"
  on public.journal_entries
  for select
  to authenticated
  using (public.can_read_parent_journals_as_mhp());

-- Grant-scoped counsellor journal reads (review grants) remain unchanged in
-- supabase-counsellor-review-grants.sql — this patch tightens only the broad policy.

-- ---------------------------------------------------------------------------
-- 5. Verification notes
-- ---------------------------------------------------------------------------
-- Token table remains without authenticated grants.
-- Parents and counsellors cannot SELECT token hashes via REST.
-- Consumption creates counsellor profile (C- Wayfinder ID), draft MHP profile,
-- and pending_review membership only — not publication.
-- Pending-review MHPs must not pass can_read_parent_journals_as_mhp() until
-- owner/admin sets membership_status = 'active'.
