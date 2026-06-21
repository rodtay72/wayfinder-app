-- ============================================================
-- Wayfinder facilitator-hosted activity events (Issue #45)
-- ============================================================
--
-- Run in Supabase SQL Editor after:
--   supabase-profiles.sql
--   supabase-counsellor-rls.sql  (needs is_wayfinder_counsellor())
--
-- Parent app reads only status = 'published'.
-- Counsellors manage their own draft / published / archived events.
-- No journal, Decode, parent, or child data in this table.

create table if not exists public.hosted_activity_events (
  id uuid primary key default gen_random_uuid(),
  activity_id text not null,
  facilitator_user_id uuid not null references auth.users(id) on delete cascade,
  venue_type text not null check (venue_type in ('physical', 'online')),
  venue_address_or_link text not null,
  start_date date not null,
  start_time text not null,
  end_time text,
  timezone text not null default 'Asia/Singapore',
  fee_type text not null check (fee_type in ('free', 'paid')),
  registration_url text,
  eventbrite_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  archived_at timestamptz
);

create index if not exists hosted_activity_events_facilitator_idx
  on public.hosted_activity_events (facilitator_user_id);

create index if not exists hosted_activity_events_status_date_idx
  on public.hosted_activity_events (status, start_date, start_time);

alter table public.hosted_activity_events enable row level security;

grant select, insert, update on public.hosted_activity_events to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'hosted_activity_events'
      and policyname = 'Authenticated read published hosted events'
  ) then
    create policy "Authenticated read published hosted events"
      on public.hosted_activity_events
      for select
      to authenticated
      using (status = 'published');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'hosted_activity_events'
      and policyname = 'Counsellors read own hosted events'
  ) then
    create policy "Counsellors read own hosted events"
      on public.hosted_activity_events
      for select
      to authenticated
      using (
        facilitator_user_id = auth.uid()
        and public.is_wayfinder_counsellor()
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'hosted_activity_events'
      and policyname = 'Counsellors insert own hosted events'
  ) then
    create policy "Counsellors insert own hosted events"
      on public.hosted_activity_events
      for insert
      to authenticated
      with check (
        facilitator_user_id = auth.uid()
        and public.is_wayfinder_counsellor()
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'hosted_activity_events'
      and policyname = 'Counsellors update own hosted events'
  ) then
    create policy "Counsellors update own hosted events"
      on public.hosted_activity_events
      for update
      to authenticated
      using (
        facilitator_user_id = auth.uid()
        and public.is_wayfinder_counsellor()
      )
      with check (
        facilitator_user_id = auth.uid()
        and public.is_wayfinder_counsellor()
      );
  end if;
end;
$$;
