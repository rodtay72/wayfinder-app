-- ============================================================
-- Wayfinder free trial entitlement correction
-- PR #146 — 30-day time-only trial (no save cap)
-- ============================================================
--
-- OWNER-APPLIED ONLY. Run manually in Supabase SQL Editor after
-- PR #146 merges to main. Do not run from browser code.
--
-- Corrected Wayfinder Free contract:
--   - 30-day no-card trial (time-limited only)
--   - unlimited saves during the active trial window
--   - monthly_save_limit = NULL (not used for Free tier enforcement)
--   - current_period_start / current_period_end = free-trial window
--   - after trial expiry, a future enforcement PR blocks new saves only;
--     existing saved reflections remain readable
--
-- Backfill Policy B (owner-approved):
--   Existing Wayfinder Free rows receive a fresh 30-day window from apply time:
--     monthly_save_limit = NULL
--     current_period_start = now()
--     current_period_end = now() + interval '30 days'
--     subscription_status remains 'free'
--
-- This PR does NOT:
--   - delete or alter journal_entries
--   - change auth, RLS, ensure_profile, or profiles
--   - implement save gating or usage_counter writes
--   - add Stripe columns or webhook handlers
--
-- After apply, verify:
--   select plan_key, subscription_status, monthly_save_limit,
--          current_period_start, current_period_end, count(*)
--   from public.user_entitlements
--   group by 1, 2, 3, 4, 5;
--
--   select public.ensure_parent_entitlement();
--   select * from public.get_current_user_entitlement();

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.user_entitlements') is null then
    raise exception 'PR146 blocked: public.user_entitlements does not exist. Apply PR #143 first.'
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Bootstrap RPC — Wayfinder Free with 30-day trial window
-- ---------------------------------------------------------------------------

create or replace function public.ensure_parent_entitlement()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_now timestamptz := now();
begin
  if v_user_id is null then
    raise exception 'Not authenticated'
      using errcode = '28000';
  end if;

  select p.role
    into v_role
  from public.profiles p
  where p.user_id = v_user_id
  order by p.created_at asc
  limit 1;

  if v_role is distinct from 'parent' then
    return;
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
    current_period_end
  )
  values (
    v_user_id,
    'wayfinder',
    'free',
    true,
    null,
    false,
    false,
    0,
    v_now,
    v_now + interval '30 days'
  )
  on conflict (user_id) do nothing;
end;
$$;

revoke all on function public.ensure_parent_entitlement() from public;
grant execute on function public.ensure_parent_entitlement() to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Backfill Policy B — existing Wayfinder Free parents
-- ---------------------------------------------------------------------------

update public.user_entitlements
set
  monthly_save_limit = null,
  current_period_start = now(),
  current_period_end = now() + interval '30 days',
  updated_at = now()
where plan_key = 'wayfinder'
  and subscription_status = 'free';

-- ---------------------------------------------------------------------------
-- 3. Verification notes
-- ---------------------------------------------------------------------------
-- Wayfinder Free active trial: plan_key=wayfinder, subscription_status=free,
-- monthly_save_limit=NULL, current_period_end in the future.
-- Future trial expiry enforcement PR may set subscription_status='expired'
-- when now() > current_period_end — existing journal rows stay readable.
-- Paid Plus/Connect: monthly_save_limit=NULL; current_period_* from Stripe.
-- usage_counters.saved_reflection_count is not the Free-tier limit mechanism.

-- ============================================================
-- End of PR #146 free trial entitlement correction
-- ============================================================
