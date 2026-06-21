-- ============================================================
-- Wayfinder parent-selected counsellor review grants (Issue #48)
-- ============================================================
--
-- Run in Supabase SQL Editor after:
--   supabase-profiles.sql
--   supabase-schema.sql
--   supabase-counsellor-rls.sql
--
-- PR A (this file): tables + grant-scoped RLS + additive journal read policy.
-- PR B (separate file): supabase-counsellor-review-grants-tighten-rls.sql
--   — run ONLY after runtime uses grant-scoped reads and smoke tests pass.
--
-- Does NOT drop "Counsellors can read journal entries" broad policy in this file.

-- Resolve counsellor auth user_id from Wayfinder ID (parent_id on profiles).
-- Returns null if not found or not counsellor role. Does not expose email.
create or replace function public.resolve_counsellor_user_id(p_wayfinder_id text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.user_id
  from public.profiles p
  where p.parent_id = trim(p_wayfinder_id)
    and p.role = 'counsellor'
  limit 1;
$$;

revoke all on function public.resolve_counsellor_user_id(text) from public;
grant execute on function public.resolve_counsellor_user_id(text) to authenticated;

-- Parent-safe counsellor directory for review sharing (Wayfinder ID + label only).
-- Does not expose user_id, email, tokens, or service identifiers.
create or replace function public.list_available_counsellors()
returns table(wayfinder_id text, display_label text)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.parent_id as wayfinder_id,
    'Counsellor · ' || p.parent_id as display_label
  from public.profiles p
  where p.role = 'counsellor'
    and p.parent_id is not null
  order by p.created_at asc;
$$;

revoke all on function public.list_available_counsellors() from public;
grant execute on function public.list_available_counsellors() to authenticated;

-- Validates parent ownership without RLS recursion between journal_entries
-- and counsellor_review_grant_entries during grant entry INSERT.
create or replace function public.parent_can_link_journal_entry_to_grant(p_journal_entry_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.journal_entries je
    where je.id = p_journal_entry_id
      and je.user_id = auth.uid()
  );
$$;

revoke all on function public.parent_can_link_journal_entry_to_grant(text) from public;
grant execute on function public.parent_can_link_journal_entry_to_grant(text) to authenticated;

-- Atomic parent grant creation (grant + entry links in one transaction).
create or replace function public.create_parent_review_grant(
  p_parent_id text,
  p_counsellor_wayfinder_id text,
  p_consent_version text,
  p_consent_text_snapshot text,
  p_expires_at timestamptz,
  p_journal_entry_ids text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_counsellor_user_id uuid;
  v_grant_id uuid;
  v_entry_id text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select public.resolve_counsellor_user_id(p_counsellor_wayfinder_id)
    into v_counsellor_user_id;

  if v_counsellor_user_id is null then
    raise exception 'Counsellor not found' using errcode = 'P0001';
  end if;

  if p_journal_entry_ids is null or array_length(p_journal_entry_ids, 1) is null then
    raise exception 'No journal entries selected' using errcode = 'P0001';
  end if;

  foreach v_entry_id in array p_journal_entry_ids loop
    if not public.parent_can_link_journal_entry_to_grant(v_entry_id) then
      raise exception 'Journal entry not available for sharing' using errcode = 'P0001';
    end if;
  end loop;

  insert into public.counsellor_review_grants (
    parent_user_id,
    parent_id,
    counsellor_user_id,
    counsellor_wayfinder_id,
    status,
    consent_version,
    consent_text_snapshot,
    expires_at
  ) values (
    auth.uid(),
    p_parent_id,
    v_counsellor_user_id,
    trim(p_counsellor_wayfinder_id),
    'active',
    p_consent_version,
    p_consent_text_snapshot,
    p_expires_at
  )
  returning id into v_grant_id;

  foreach v_entry_id in array p_journal_entry_ids loop
    insert into public.counsellor_review_grant_entries (grant_id, journal_entry_id)
    values (v_grant_id, v_entry_id);
  end loop;

  return v_grant_id;
end;
$$;

revoke all on function public.create_parent_review_grant(text, text, text, text, timestamptz, text[]) from public;
grant execute on function public.create_parent_review_grant(text, text, text, text, timestamptz, text[]) to authenticated;

create table if not exists public.counsellor_review_grants (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  parent_id text not null,
  counsellor_user_id uuid not null references auth.users(id) on delete cascade,
  counsellor_wayfinder_id text not null,
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  consent_version text not null default '2026-06-1',
  consent_text_snapshot text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);

create table if not exists public.counsellor_review_grant_entries (
  id uuid primary key default gen_random_uuid(),
  grant_id uuid not null references public.counsellor_review_grants(id) on delete cascade,
  journal_entry_id text not null references public.journal_entries(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (grant_id, journal_entry_id)
);

create index if not exists counsellor_review_grants_parent_idx
  on public.counsellor_review_grants (parent_user_id);

create index if not exists counsellor_review_grants_counsellor_idx
  on public.counsellor_review_grants (counsellor_user_id, status, expires_at);

create index if not exists counsellor_review_grant_entries_grant_idx
  on public.counsellor_review_grant_entries (grant_id);

create index if not exists counsellor_review_grant_entries_entry_idx
  on public.counsellor_review_grant_entries (journal_entry_id);

alter table public.counsellor_review_grants enable row level security;
alter table public.counsellor_review_grant_entries enable row level security;

grant select, insert, update on public.counsellor_review_grants to authenticated;
grant select, insert on public.counsellor_review_grant_entries to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'counsellor_review_grants'
      and policyname = 'Parents manage own review grants'
  ) then
    create policy "Parents manage own review grants"
      on public.counsellor_review_grants
      for all
      to authenticated
      using (parent_user_id = auth.uid())
      with check (parent_user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'counsellor_review_grants'
      and policyname = 'Counsellors read assigned active review grants'
  ) then
    create policy "Counsellors read assigned active review grants"
      on public.counsellor_review_grants
      for select
      to authenticated
      using (
        counsellor_user_id = auth.uid()
        and public.is_wayfinder_counsellor()
        and status = 'active'
        and expires_at > now()
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'counsellor_review_grant_entries'
      and policyname = 'Parents manage own grant entries'
  ) then
    create policy "Parents manage own grant entries"
      on public.counsellor_review_grant_entries
      for all
      to authenticated
      using (
        exists (
          select 1 from public.counsellor_review_grants g
          where g.id = grant_id and g.parent_user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.counsellor_review_grants g
          where g.id = grant_id and g.parent_user_id = auth.uid()
        )
        and public.parent_can_link_journal_entry_to_grant(journal_entry_id)
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'counsellor_review_grant_entries'
      and policyname = 'Counsellors read entries on active assigned grants'
  ) then
    create policy "Counsellors read entries on active assigned grants"
      on public.counsellor_review_grant_entries
      for select
      to authenticated
      using (
        public.is_wayfinder_counsellor()
        and exists (
          select 1 from public.counsellor_review_grants g
          where g.id = grant_id
            and g.counsellor_user_id = auth.uid()
            and g.status = 'active'
            and g.expires_at > now()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'journal_entries'
      and policyname = 'Counsellors can read granted journal entries'
  ) then
    create policy "Counsellors can read granted journal entries"
      on public.journal_entries
      for select
      to authenticated
      using (
        public.is_wayfinder_counsellor()
        and exists (
          select 1
          from public.counsellor_review_grant_entries ge
          join public.counsellor_review_grants g on g.id = ge.grant_id
          where ge.journal_entry_id = journal_entries.id
            and g.counsellor_user_id = auth.uid()
            and g.status = 'active'
            and g.expires_at > now()
        )
      );
  end if;
end;
$$;

-- Re-apply if grant entry INSERT previously returned REST 500 (RLS recursion fix).
drop policy if exists "Parents manage own grant entries" on public.counsellor_review_grant_entries;
create policy "Parents manage own grant entries"
  on public.counsellor_review_grant_entries
  for all
  to authenticated
  using (
    exists (
      select 1 from public.counsellor_review_grants g
      where g.id = grant_id and g.parent_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.counsellor_review_grants g
      where g.id = grant_id and g.parent_user_id = auth.uid()
    )
    and public.parent_can_link_journal_entry_to_grant(journal_entry_id)
  );

-- ============================================================
-- PR B — run separately after smoke tests (NOT in PR A deploy):
--   \i supabase-counsellor-review-grants-tighten-rls.sql
-- ============================================================
