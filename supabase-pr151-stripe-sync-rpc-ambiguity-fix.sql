-- ============================================================
-- Wayfinder Stripe sync RPC ambiguity fix
-- PR #151 — owner-applied hotfix for sync_parent_entitlement_from_stripe
-- ============================================================
--
-- OWNER-APPLIED ONLY. Run manually in Supabase SQL Editor after
-- PR #151 merges to main. Do not run from browser code.
--
-- Root cause:
--   RETURNS TABLE output column user_id collides with ON CONFLICT (user_id)
--   inside PL/pgSQL INSERT statements, causing:
--   ERROR 42702: column reference "user_id" is ambiguous
--
-- Fix:
--   Use named primary-key constraints in ON CONFLICT clauses:
--   - user_entitlements_pkey
--   - stripe_billing_references_pkey
--
-- Prerequisites:
--   - PR #143 user_entitlements applied
--   - PR #148 stripe entitlement sync foundation applied
--
-- This PR does NOT:
--   - alter journal_entries, profiles, auth, or ensure_profile
--   - change RLS policies or browser grants
--   - backfill or manually edit entitlements
--   - add webhook runtime or checkout UI
--
-- Verification (after apply):
--
-- 1. Confirm function exists:
--   select proname
--   from pg_proc
--   where proname = 'sync_parent_entitlement_from_stripe';
--
-- 2. Confirm authenticated cannot execute:
--   select has_function_privilege(
--     'authenticated',
--     'public.sync_parent_entitlement_from_stripe(uuid,text,text,text,text,timestamptz,timestamptz,boolean)',
--     'EXECUTE'
--   );
--   -- expected: false
--
-- 3. Rollback-only RPC test (no data persisted):
--   begin;
--   select *
--   from public.sync_parent_entitlement_from_stripe(
--     (select user_id from public.profiles where parent_id = 'P-00001' limit 1),
--     'wayfinder_plus',
--     'active',
--     'cus_safe_test',
--     'sub_safe_test',
--     now(),
--     now() + interval '1 month',
--     false
--   );
--   rollback;
--   -- expected: one row returned; no 42702 ambiguity error

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.user_entitlements') is null then
    raise exception 'PR151 blocked: public.user_entitlements does not exist. Apply PR #143 first.'
      using errcode = 'P0001';
  end if;

  if to_regclass('public.stripe_billing_references') is null then
    raise exception 'PR151 blocked: public.stripe_billing_references does not exist. Apply PR #148 first.'
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. sync_parent_entitlement_from_stripe — fix ON CONFLICT ambiguity
-- ---------------------------------------------------------------------------

create or replace function public.sync_parent_entitlement_from_stripe(
  p_user_id uuid,
  p_plan_key text,
  p_subscription_status text,
  p_stripe_customer_id text default null,
  p_stripe_subscription_id text default null,
  p_current_period_start timestamptz default null,
  p_current_period_end timestamptz default null,
  p_clear_subscription_id boolean default false
)
returns table(
  user_id uuid,
  plan_key text,
  subscription_status text,
  updated boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := p_user_id;
  v_plan_key text := nullif(trim(p_plan_key), '');
  v_status text := nullif(trim(p_subscription_status), '');
  v_role text;
  v_customer_id text := nullif(trim(p_stripe_customer_id), '');
  v_subscription_id text := nullif(trim(p_stripe_subscription_id), '');
  v_monthly_save_limit integer;
  v_progress_tracker boolean;
  v_mhp_review boolean;
  v_mhp_reviews integer;
  v_period_start timestamptz := p_current_period_start;
  v_period_end timestamptz := p_current_period_end;
  v_existing_customer_id text;
  v_did_update boolean := false;
begin
  if v_user_id is null then
    raise exception 'user_id is required'
      using errcode = '22023';
  end if;

  if v_plan_key is null or v_plan_key not in ('wayfinder', 'wayfinder_plus', 'wayfinder_connect') then
    raise exception 'Invalid plan_key'
      using errcode = '22023';
  end if;

  if v_status is null or v_status not in ('free', 'trialing', 'active', 'past_due', 'canceled', 'expired') then
    raise exception 'Invalid subscription_status'
      using errcode = '22023';
  end if;

  if v_status = 'free' then
    raise exception 'Stripe sync cannot use subscription_status free'
      using errcode = '22023';
  end if;

  if v_plan_key = 'wayfinder' then
    if v_status <> 'expired' then
      raise exception 'Wayfinder Stripe sync allows expired lapse only'
        using errcode = '22023';
    end if;
  elsif v_plan_key = 'wayfinder_plus' then
    if v_status not in ('trialing', 'active', 'past_due', 'canceled') then
      raise exception 'Invalid subscription_status for wayfinder_plus'
        using errcode = '22023';
    end if;
  elsif v_plan_key = 'wayfinder_connect' then
    if v_status not in ('trialing', 'active', 'past_due', 'canceled') then
      raise exception 'Invalid subscription_status for wayfinder_connect'
        using errcode = '22023';
    end if;
  end if;

  if not exists (select 1 from auth.users u where u.id = v_user_id) then
    raise exception 'User not found'
      using errcode = '22023';
  end if;

  select p.role
    into v_role
  from public.profiles p
  where p.user_id = v_user_id
  order by p.created_at asc
  limit 1;

  if v_role is distinct from 'parent' then
    raise exception 'Parent profile required'
      using errcode = '22023';
  end if;

  if v_status = 'expired' then
    v_plan_key := 'wayfinder';
    v_monthly_save_limit := null;
    v_progress_tracker := false;
    v_mhp_review := false;
    v_mhp_reviews := 0;
    v_period_start := null;
    v_period_end := null;
    v_subscription_id := null;
  elsif v_plan_key = 'wayfinder_plus' then
    v_monthly_save_limit := null;
    v_progress_tracker := true;
    v_mhp_review := false;
    v_mhp_reviews := 0;
  elsif v_plan_key = 'wayfinder_connect' then
    v_monthly_save_limit := null;
    v_progress_tracker := true;
    v_mhp_review := true;
    v_mhp_reviews := 1;
  else
    raise exception 'Unsupported plan_key for Stripe sync'
      using errcode = '22023';
  end if;

  insert into public.user_entitlements (
    user_id,
    plan_key,
    subscription_status,
    core_parent_app_access,
    monthly_save_limit,
    progress_tracker_enabled,
    mhp_review_enabled,
    included_mhp_reviews_per_month,
    current_period_start,
    current_period_end,
    last_entitlement_sync_at
  )
  values (
    v_user_id,
    v_plan_key,
    v_status,
    true,
    v_monthly_save_limit,
    v_progress_tracker,
    v_mhp_review,
    v_mhp_reviews,
    v_period_start,
    v_period_end,
    now()
  )
  on conflict on constraint user_entitlements_pkey do update
  set
    plan_key = excluded.plan_key,
    subscription_status = excluded.subscription_status,
    core_parent_app_access = true,
    monthly_save_limit = excluded.monthly_save_limit,
    progress_tracker_enabled = excluded.progress_tracker_enabled,
    mhp_review_enabled = excluded.mhp_review_enabled,
    included_mhp_reviews_per_month = excluded.included_mhp_reviews_per_month,
    current_period_start = excluded.current_period_start,
    current_period_end = excluded.current_period_end,
    last_entitlement_sync_at = now(),
    updated_at = now();

  v_did_update := true;

  select sbr.stripe_customer_id
    into v_existing_customer_id
  from public.stripe_billing_references sbr
  where sbr.user_id = v_user_id;

  if p_clear_subscription_id then
    v_subscription_id := null;
  end if;

  insert into public.stripe_billing_references (
    user_id,
    stripe_customer_id,
    stripe_subscription_id
  )
  values (
    v_user_id,
    coalesce(v_customer_id, v_existing_customer_id),
    v_subscription_id
  )
  on conflict on constraint stripe_billing_references_pkey do update
  set
    stripe_customer_id = coalesce(excluded.stripe_customer_id, stripe_billing_references.stripe_customer_id),
    stripe_subscription_id = case
      when p_clear_subscription_id or v_status = 'expired' then null
      else coalesce(excluded.stripe_subscription_id, stripe_billing_references.stripe_subscription_id)
    end,
    updated_at = now();

  return query
  select
    v_user_id,
    v_plan_key,
    v_status,
    v_did_update;
end;
$$;

revoke all on function public.sync_parent_entitlement_from_stripe(
  uuid, text, text, text, text, timestamptz, timestamptz, boolean
) from public;
revoke all on function public.sync_parent_entitlement_from_stripe(
  uuid, text, text, text, text, timestamptz, timestamptz, boolean
) from anon;
revoke all on function public.sync_parent_entitlement_from_stripe(
  uuid, text, text, text, text, timestamptz, timestamptz, boolean
) from authenticated;
grant execute on function public.sync_parent_entitlement_from_stripe(
  uuid, text, text, text, text, timestamptz, timestamptz, boolean
) to service_role;

-- ============================================================
-- End of PR #151 Stripe sync RPC ambiguity fix
-- ============================================================
