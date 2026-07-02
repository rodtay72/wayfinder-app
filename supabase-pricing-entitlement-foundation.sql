-- ============================================================
-- Wayfinder pricing and entitlement foundation
-- PR #143 — user_entitlements + usage_counters + read RPCs
-- ============================================================
--
-- Owner-applied only. Run manually in Supabase SQL Editor.
--
-- Purpose:
--   Persist parent plan entitlements and monthly usage counters for
--   future Stripe/webhook sync. Browser may read own rows only.
--
-- Prerequisites:
--   - auth.users
--   - public.profiles
--
-- This PR does NOT:
--   - change ensure_profile, auth, or email verification
--   - modify journal_entries, dyads, profiles, or MHP RLS
--   - add Stripe columns or webhook handlers
--   - grant browser INSERT/UPDATE/DELETE on entitlements
--   - implement feature gating or usage counter writes
--
-- Wayfinder is ALIGN/CAB parent-development support — not child
-- diagnosis, behaviour labelling, or generic advice.
--
-- After apply, verify:
--   select plan_key, subscription_status, count(*)
--   from public.user_entitlements
--   group by 1, 2;
--
--   select public.ensure_parent_entitlement();
--   select * from public.get_current_user_entitlement();

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'PR143 entitlement foundation blocked: public.profiles does not exist.'
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. User entitlements
-- ---------------------------------------------------------------------------

create table if not exists public.user_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_key text not null default 'wayfinder',
  subscription_status text not null default 'free',
  core_parent_app_access boolean not null default true,
  monthly_save_limit integer default 3,
  progress_tracker_enabled boolean not null default false,
  mhp_review_enabled boolean not null default false,
  included_mhp_reviews_per_month integer not null default 0,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_entitlements_plan_key_check check (
    plan_key in ('wayfinder', 'wayfinder_plus', 'wayfinder_connect')
  ),
  constraint user_entitlements_subscription_status_check check (
    subscription_status in ('free', 'trialing', 'active', 'past_due', 'canceled', 'expired')
  ),
  constraint user_entitlements_included_mhp_reviews_nonnegative check (
    included_mhp_reviews_per_month >= 0
  ),
  constraint user_entitlements_monthly_save_limit_nonnegative check (
    monthly_save_limit is null or monthly_save_limit >= 0
  )
);

create index if not exists user_entitlements_plan_key_idx
  on public.user_entitlements (plan_key);

create index if not exists user_entitlements_subscription_status_idx
  on public.user_entitlements (subscription_status);

create or replace function public.set_user_entitlements_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists user_entitlements_set_updated_at on public.user_entitlements;
create trigger user_entitlements_set_updated_at
  before update on public.user_entitlements
  for each row
  execute function public.set_user_entitlements_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Usage counters
-- ---------------------------------------------------------------------------

create table if not exists public.usage_counters (
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  saved_reflection_count integer not null default 0,
  mhp_review_request_count integer not null default 0,
  primary key (user_id, period_start),
  constraint usage_counters_saved_reflection_count_nonnegative check (
    saved_reflection_count >= 0
  ),
  constraint usage_counters_mhp_review_request_count_nonnegative check (
    mhp_review_request_count >= 0
  ),
  constraint usage_counters_period_range_valid check (
    period_end >= period_start
  )
);

create index if not exists usage_counters_user_period_end_idx
  on public.usage_counters (user_id, period_end desc);

-- ---------------------------------------------------------------------------
-- 3. RLS and grants — read-only for authenticated browser
-- ---------------------------------------------------------------------------

alter table public.user_entitlements enable row level security;
alter table public.usage_counters enable row level security;

revoke all on public.user_entitlements from public;
revoke all on public.usage_counters from public;

grant select on public.user_entitlements to authenticated;
grant select on public.usage_counters to authenticated;

drop policy if exists "Parents read own entitlement" on public.user_entitlements;
create policy "Parents read own entitlement"
  on public.user_entitlements
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Parents read own usage counters" on public.usage_counters;
create policy "Parents read own usage counters"
  on public.usage_counters
  for select
  to authenticated
  using (user_id = auth.uid());

-- Paid plan changes and usage increments are server-side only (future webhook PR).

-- ---------------------------------------------------------------------------
-- 4. Bootstrap RPC — default Wayfinder free tier for parent users
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
    included_mhp_reviews_per_month
  )
  values (
    v_user_id,
    'wayfinder',
    'free',
    true,
    3,
    false,
    false,
    0
  )
  on conflict (user_id) do nothing;
end;
$$;

revoke all on function public.ensure_parent_entitlement() from public;
grant execute on function public.ensure_parent_entitlement() to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Read RPC — current entitlement + optional current-month usage
-- ---------------------------------------------------------------------------

create or replace function public.get_current_user_entitlement()
returns table(
  user_id uuid,
  plan_key text,
  subscription_status text,
  core_parent_app_access boolean,
  monthly_save_limit integer,
  progress_tracker_enabled boolean,
  mhp_review_enabled boolean,
  included_mhp_reviews_per_month integer,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  usage_period_start date,
  usage_period_end date,
  saved_reflection_count integer,
  mhp_review_request_count integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_month_start date := date_trunc('month', now())::date;
  v_month_end date := (date_trunc('month', now()) + interval '1 month - 1 day')::date;
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

  return query
  select
    e.user_id,
    e.plan_key,
    e.subscription_status,
    e.core_parent_app_access,
    e.monthly_save_limit,
    e.progress_tracker_enabled,
    e.mhp_review_enabled,
    e.included_mhp_reviews_per_month,
    e.current_period_start,
    e.current_period_end,
    e.created_at,
    e.updated_at,
    uc.period_start as usage_period_start,
    uc.period_end as usage_period_end,
    coalesce(uc.saved_reflection_count, 0) as saved_reflection_count,
    coalesce(uc.mhp_review_request_count, 0) as mhp_review_request_count
  from public.user_entitlements e
  left join public.usage_counters uc
    on uc.user_id = e.user_id
   and uc.period_start = v_month_start
  where e.user_id = v_user_id;
end;
$$;

revoke all on function public.get_current_user_entitlement() from public;
grant execute on function public.get_current_user_entitlement() to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Verification notes
-- ---------------------------------------------------------------------------
-- Default parent entitlement: plan_key=wayfinder, subscription_status=free,
-- monthly_save_limit=3, progress_tracker_enabled=false, mhp_review_enabled=false.
-- Plus seed (future webhook): monthly_save_limit NULL, progress_tracker_enabled true.
-- Connect seed (future webhook): monthly_save_limit NULL, progress_tracker_enabled true,
--   mhp_review_enabled true, included_mhp_reviews_per_month=1.
-- Existing saved journal_entries remain readable regardless of entitlement row.
-- No Stripe data in this PR.

-- ============================================================
-- End of Wayfinder pricing and entitlement foundation
-- ============================================================
