-- ============================================================
-- Wayfinder Stripe entitlement sync SQL foundation
-- PR #148 — server-only billing refs + sync RPC (no webhook runtime)
-- ============================================================
--
-- OWNER-APPLIED ONLY. Run manually in Supabase SQL Editor after
-- PR #148 merges to main. Do not run from browser code.
--
-- Purpose:
--   Prepare webhook-safe entitlement sync for a future Stripe webhook
--   runtime PR. Stripe customer/subscription IDs live in a private
--   server-only table — not on parent-readable user_entitlements.
--
-- Prerequisites:
--   - PR #143 user_entitlements + usage_counters applied
--   - PR #146 free-trial correction applied (recommended)
--
-- This PR does NOT:
--   - add api/stripe-webhook.js or any Stripe API calls
--   - alter journal_entries, profiles, auth, or ensure_profile
--   - weaken existing RLS on user_entitlements (browser SELECT-only)
--   - grant browser read/write on billing refs or webhook events
--   - backfill or change existing parent entitlements
--   - store raw Stripe payloads, emails, journal/CAB/child data
--
-- After apply, verify:
--   select column_name from information_schema.columns
--   where table_schema = 'public' and table_name = 'user_entitlements'
--     and column_name = 'last_entitlement_sync_at';
--
--   select to_regclass('public.stripe_billing_references');
--   select to_regclass('public.stripe_webhook_events');
--
--   select has_function_privilege('authenticated',
--     'public.sync_parent_entitlement_from_stripe(uuid,text,text,text,text,timestamptz,timestamptz,boolean)',
--     'EXECUTE');
--   -- expected: false

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.user_entitlements') is null then
    raise exception 'PR148 blocked: public.user_entitlements does not exist. Apply PR #143 first.'
      using errcode = 'P0001';
  end if;

  if to_regclass('public.profiles') is null then
    raise exception 'PR148 blocked: public.profiles does not exist.'
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. user_entitlements — sync timestamp only (parent-readable table)
-- ---------------------------------------------------------------------------

alter table public.user_entitlements
  add column if not exists last_entitlement_sync_at timestamptz;

-- ---------------------------------------------------------------------------
-- 2. stripe_billing_references — server-only Stripe ID mapping
-- ---------------------------------------------------------------------------

create table if not exists public.stripe_billing_references (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists stripe_billing_references_customer_id_uidx
  on public.stripe_billing_references (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists stripe_billing_references_subscription_id_uidx
  on public.stripe_billing_references (stripe_subscription_id)
  where stripe_subscription_id is not null;

create or replace function public.set_stripe_billing_references_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists stripe_billing_references_set_updated_at on public.stripe_billing_references;
create trigger stripe_billing_references_set_updated_at
  before update on public.stripe_billing_references
  for each row
  execute function public.set_stripe_billing_references_updated_at();

alter table public.stripe_billing_references enable row level security;

revoke all on public.stripe_billing_references from public;

-- No grants to anon or authenticated — browser cannot read/write.

-- ---------------------------------------------------------------------------
-- 3. stripe_webhook_events — idempotency / minimal audit (server-only)
-- ---------------------------------------------------------------------------

create table if not exists public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  livemode boolean not null default false,
  outcome text not null,
  processed_at timestamptz not null default now(),
  constraint stripe_webhook_events_outcome_check check (
    outcome in ('claimed', 'processed', 'duplicate', 'skipped', 'failed')
  )
);

create index if not exists stripe_webhook_events_processed_at_idx
  on public.stripe_webhook_events (processed_at desc);

alter table public.stripe_webhook_events enable row level security;

revoke all on public.stripe_webhook_events from public;

-- No grants to anon or authenticated — browser cannot read/write.

-- ---------------------------------------------------------------------------
-- 4. claim_stripe_webhook_event — idempotency claim (service_role only)
-- ---------------------------------------------------------------------------

create or replace function public.claim_stripe_webhook_event(
  p_stripe_event_id text,
  p_event_type text,
  p_livemode boolean default false
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id text := nullif(trim(p_stripe_event_id), '');
  v_event_type text := nullif(trim(p_event_type), '');
  v_inserted text;
begin
  if v_event_id is null then
    raise exception 'stripe_event_id is required'
      using errcode = '22023';
  end if;

  if v_event_type is null then
    raise exception 'event_type is required'
      using errcode = '22023';
  end if;

  insert into public.stripe_webhook_events (
    stripe_event_id,
    event_type,
    livemode,
    outcome
  )
  values (
    v_event_id,
    v_event_type,
    coalesce(p_livemode, false),
    'claimed'
  )
  on conflict (stripe_event_id) do nothing
  returning stripe_event_id into v_inserted;

  return v_inserted is not null;
end;
$$;

revoke all on function public.claim_stripe_webhook_event(text, text, boolean) from public;
revoke all on function public.claim_stripe_webhook_event(text, text, boolean) from anon;
revoke all on function public.claim_stripe_webhook_event(text, text, boolean) from authenticated;
grant execute on function public.claim_stripe_webhook_event(text, text, boolean) to service_role;

-- ---------------------------------------------------------------------------
-- 5. sync_parent_entitlement_from_stripe — entitlement sync (service_role only)
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

  if v_plan_key = 'wayfinder' and v_status = 'free' then
    raise exception 'Stripe sync cannot grant Wayfinder free trial'
      using errcode = '22023';
  end if;

  if v_status = 'expired' and v_plan_key <> 'wayfinder' then
    raise exception 'Expired lapse must use plan_key wayfinder'
      using errcode = '22023';
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
  on conflict (user_id) do update
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
  on conflict (user_id) do update
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

-- ---------------------------------------------------------------------------
-- 6. Verification notes
-- ---------------------------------------------------------------------------
-- stripe_billing_references and stripe_webhook_events: RLS enabled, no
-- authenticated policies — browser cannot SELECT Stripe billing identifiers.
-- user_entitlements: existing parent read policy unchanged; only adds
-- last_entitlement_sync_at (non-identifying sync timestamp).
-- Future webhook PR calls claim_stripe_webhook_event + sync_parent_entitlement_from_stripe
-- via service role only. Existing saved journal_entries remain readable.
-- Paid lapse: plan_key=wayfinder, subscription_status=expired, no fresh trial.

-- ============================================================
-- End of PR #148 Stripe entitlement sync SQL foundation
-- ============================================================
