-- ============================================================
-- Wayfinder MHP invite email-bound acceptance contract
-- PR #138 — Email-bound MHP invite acceptance flow
-- ============================================================
--
-- Owner-applied only. Run manually in Supabase SQL Editor.
--
-- Purpose:
--   After account creation and email verification, allow invited Mental
--   Health Professionals to accept onboarding by verified email match —
--   without carrying raw invite tokens through browser redirects.
--
-- Prerequisites:
--   - supabase-mhp-invite-token-acceptance-contract.sql
--   - public.mental_health_professional_invite_tokens
--   - public.profiles
--   - public.mental_health_professional_profiles
--   - public.mental_health_professional_memberships
--
-- Invitee routes:
--   Initial invite page: /counsellor.html?mhp_invite=<token>
--   Post-verification setup: /counsellor.html?mhp_setup=profile
--   Recovery sign-in: /counsellor.html (official MHP sign-in)
--
-- This PR does NOT:
--   - require raw invite tokens after email verification
--   - store raw tokens
--   - publish MHP profiles or activate public membership
--   - grant parent/journal/child access
--   - bypass email verification
--   - modify ensure_profile or browser profile writes
--
-- After apply, verify (as invited verified user):
--   select * from public.get_mhp_invite_status_for_current_user_email();
--   select * from public.consume_mhp_invite_for_current_user_by_email();

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.mental_health_professional_invite_tokens') is null then
    raise exception 'MHP email-bound invite acceptance blocked: mental_health_professional_invite_tokens does not exist. Apply supabase-mhp-invite-token-acceptance-contract.sql first.'
      using errcode = 'P0001';
  end if;

  if to_regprocedure('public.hash_mhp_invite_token(text)') is null then
    raise exception 'MHP email-bound invite acceptance blocked: hash_mhp_invite_token() does not exist. Apply supabase-mhp-invite-token-acceptance-contract.sql first.'
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Authenticated invite status by verified email
-- ---------------------------------------------------------------------------

create or replace function public.get_mhp_invite_status_for_current_user_email()
returns table(
  has_active_invite boolean,
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
  v_user_id uuid := auth.uid();
  v_auth_email text;
  v_email_confirmed timestamptz;
  v_row public.mental_health_professional_invite_tokens%rowtype;
begin
  if v_user_id is null then
    raise exception 'Not authenticated'
      using errcode = '28000';
  end if;

  select lower(trim(u.email)), u.email_confirmed_at
    into v_auth_email, v_email_confirmed
  from auth.users u
  where u.id = v_user_id;

  if v_auth_email is null or v_auth_email = '' then
    return query
    select false, null::text, null::text, null::timestamptz,
      'Your account email could not be read for invitation lookup.'::text;
    return;
  end if;

  if v_email_confirmed is null then
    return query
    select false, null::text, null::text, null::timestamptz,
      'Please verify your email before continuing Mental Health Professional invitation setup.'::text;
    return;
  end if;

  select *
    into v_row
  from public.mental_health_professional_invite_tokens t
  where lower(btrim(t.invited_email)) = v_auth_email
    and t.token_status = 'active'
    and t.expires_at > now()
  order by t.created_at desc
  limit 1;

  if not found then
    return query
    select false, null::text, null::text, null::timestamptz,
      'No active Mental Health Professional invitation was found for this signed-in email.'::text;
    return;
  end if;

  return query
  select true, v_row.invited_email, v_row.invited_name, v_row.expires_at,
    'An active Mental Health Professional invitation was found for this email.'::text;
end;
$$;

revoke all on function public.get_mhp_invite_status_for_current_user_email() from public;
grant execute on function public.get_mhp_invite_status_for_current_user_email() to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Authenticated invite consumption by verified email
-- ---------------------------------------------------------------------------

create or replace function public.consume_mhp_invite_for_current_user_by_email()
returns table(
  accepted boolean,
  role text,
  invited_email text,
  message text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_auth_email text;
  v_email_confirmed timestamptz;
  v_token_row public.mental_health_professional_invite_tokens%rowtype;
  v_profile public.profiles%rowtype;
  v_parent_id text;
  v_attempt integer := 0;
begin
  if v_user_id is null then
    raise exception 'Not authenticated'
      using errcode = '28000';
  end if;

  select lower(trim(u.email)), u.email_confirmed_at
    into v_auth_email, v_email_confirmed
  from auth.users u
  where u.id = v_user_id;

  if v_auth_email is null or v_auth_email = '' then
    return query
    select false, null::text, null::text,
      'Your account email could not be verified for this invitation.'::text;
    return;
  end if;

  if v_email_confirmed is null then
    return query
    select false, null::text, null::text,
      'Please verify your email before accepting this Mental Health Professional invitation.'::text;
    return;
  end if;

  select *
    into v_token_row
  from public.mental_health_professional_invite_tokens t
  where lower(btrim(t.invited_email)) = v_auth_email
    and t.token_status = 'active'
    and t.expires_at > now()
  order by t.created_at desc
  limit 1
  for update;

  if not found then
    select *
      into v_token_row
    from public.mental_health_professional_invite_tokens t
    where lower(btrim(t.invited_email)) = v_auth_email
      and t.token_status = 'consumed'
      and t.consumed_by = v_user_id
    order by t.consumed_at desc nulls last, t.created_at desc
    limit 1;

    if found then
      select *
        into v_profile
      from public.profiles p
      where p.user_id = v_user_id;

      if found and v_profile.role = 'counsellor' then
        return query
        select true, v_profile.role, v_token_row.invited_email,
          'Invitation already accepted for this account.'::text;
        return;
      end if;
    end if;

    return query
    select false, null::text, null::text,
      'No active Mental Health Professional invitation was found for this signed-in email.'::text;
    return;
  end if;

  select *
    into v_profile
  from public.profiles p
  where p.user_id = v_user_id;

  if found and v_profile.role <> 'counsellor' then
    return query
    select false, v_profile.role, v_token_row.invited_email,
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
              select false, v_profile.role, v_token_row.invited_email,
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
  select true, 'counsellor'::text, v_token_row.invited_email,
    'Invitation accepted. You may begin Mental Health Professional onboarding.'::text;
end;
$$;

revoke all on function public.consume_mhp_invite_for_current_user_by_email() from public;
grant execute on function public.consume_mhp_invite_for_current_user_by_email() to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Verification notes
-- ---------------------------------------------------------------------------
-- Token table remains without authenticated SELECT grants.
-- Raw invite token opens /counsellor.html?mhp_invite=<token> for initial page only.
-- After email verification, /counsellor.html?mhp_setup=profile or official sign-in
-- uses verified email match — raw token is not required.
-- Existing get_mhp_invite_token_status / consume_mhp_invite_token_for_current_user
-- remain for backward compatibility with old links during transition.
-- Consumption creates counsellor profile (C- Wayfinder ID), draft MHP profile,
-- and pending_review membership only — not publication.
-- Pending-review MHPs must not pass can_read_parent_journals_as_mhp() until
-- owner/admin sets membership_status = 'active'.
