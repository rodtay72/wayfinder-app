-- ============================================================
-- Wayfinder counsellor review responses (Issue #52 Phase 2a)
-- ============================================================
--
-- Run in Supabase SQL Editor after:
--   supabase-profiles.sql
--   supabase-schema.sql
--   supabase-counsellor-rls.sql
--   supabase-counsellor-review-grants.sql
--
-- PR A (this file): counsellor_review_responses table + grant-scoped RLS + publish/revoke RPCs.
-- Does NOT modify journal_entries policies or reintroduce broad counsellor journal access.
-- Does NOT run supabase-counsellor-review-grants-tighten-rls.sql (PR B — after runtime smoke).
--
-- Visibility rules:
--   Parent: SELECT published responses only; remains readable after grant expiry;
--           hidden when parent revokes the grant (grant.status = 'revoked').
--   Counsellor: INSERT/UPDATE drafts and publish only while grant is active, assigned,
--               unexpired, and not revoked; may revoke an already-published response later.

-- Grant is writable by assigned counsellor (draft/edit/publish/source-entry parity window).
create or replace function public.counsellor_review_grant_is_writable(p_grant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.counsellor_review_grants g
    where g.id = p_grant_id
      and g.counsellor_user_id = auth.uid()
      and g.status = 'active'
      and g.expires_at > now()
  );
$$;

revoke all on function public.counsellor_review_grant_is_writable(uuid) from public;
grant execute on function public.counsellor_review_grant_is_writable(uuid) to authenticated;

-- Parent may read published responses unless they revoked the grant (expiry does not block).
create or replace function public.parent_can_read_published_review_response(p_grant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.counsellor_review_grants g
    where g.id = p_grant_id
      and g.parent_user_id = auth.uid()
      and g.status <> 'revoked'
  );
$$;

revoke all on function public.parent_can_read_published_review_response(uuid) from public;
grant execute on function public.parent_can_read_published_review_response(uuid) to authenticated;

-- Counsellor owns response row on a grant assigned to them (read includes expired grants).
create or replace function public.counsellor_owns_review_response(p_response_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.counsellor_review_responses r
    join public.counsellor_review_grants g on g.id = r.grant_id
    where r.id = p_response_id
      and r.counsellor_user_id = auth.uid()
      and g.counsellor_user_id = auth.uid()
  );
$$;

revoke all on function public.counsellor_owns_review_response(uuid) from public;
grant execute on function public.counsellor_owns_review_response(uuid) to authenticated;

create table if not exists public.counsellor_review_responses (
  id uuid primary key default gen_random_uuid(),
  grant_id uuid not null references public.counsellor_review_grants(id) on delete cascade,
  counsellor_user_id uuid not null references auth.users(id) on delete cascade,
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  parent_id text not null,
  counsellor_wayfinder_id text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'revoked')),
  response_sections jsonb not null default '{}'::jsonb,
  parent_facing_text text not null default '',
  ai_draft_json jsonb,
  counsellor_working_notes text,
  published_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (grant_id)
);

create index if not exists counsellor_review_responses_grant_idx
  on public.counsellor_review_responses (grant_id);

create index if not exists counsellor_review_responses_parent_idx
  on public.counsellor_review_responses (parent_user_id, status);

create index if not exists counsellor_review_responses_counsellor_idx
  on public.counsellor_review_responses (counsellor_user_id, status);

alter table public.counsellor_review_responses enable row level security;

grant select, insert, update on public.counsellor_review_responses to authenticated;

-- Atomic publish: counsellor only, grant must still be writable.
create or replace function public.publish_counsellor_review_response(p_response_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_grant_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if not public.is_wayfinder_counsellor() then
    raise exception 'Counsellor role required' using errcode = '42501';
  end if;

  select r.grant_id
    into v_grant_id
  from public.counsellor_review_responses r
  where r.id = p_response_id
    and r.counsellor_user_id = auth.uid()
    and r.status = 'draft';

  if v_grant_id is null then
    raise exception 'Draft response not found' using errcode = 'P0001';
  end if;

  if not public.counsellor_review_grant_is_writable(v_grant_id) then
    raise exception 'Review grant is not active for publishing' using errcode = '42501';
  end if;

  if coalesce(trim(
    (select parent_facing_text from public.counsellor_review_responses where id = p_response_id)
  ), '') = '' then
    raise exception 'Parent-facing text is required before publishing' using errcode = 'P0001';
  end if;

  update public.counsellor_review_responses
  set
    status = 'published',
    published_at = now(),
    updated_at = now(),
    revoked_at = null
  where id = p_response_id
    and counsellor_user_id = auth.uid()
    and status = 'draft';

  return p_response_id;
end;
$$;

revoke all on function public.publish_counsellor_review_response(uuid) from public;
grant execute on function public.publish_counsellor_review_response(uuid) to authenticated;

-- Revoke published response from parent view (counsellor may unpublish even after grant expiry).
create or replace function public.revoke_counsellor_review_response(p_response_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if not public.is_wayfinder_counsellor() then
    raise exception 'Counsellor role required' using errcode = '42501';
  end if;

  if not public.counsellor_owns_review_response(p_response_id) then
    raise exception 'Response not found' using errcode = 'P0001';
  end if;

  update public.counsellor_review_responses
  set
    status = 'revoked',
    revoked_at = now(),
    updated_at = now()
  where id = p_response_id
    and counsellor_user_id = auth.uid()
    and status = 'published';

  if not found then
    raise exception 'Only published responses can be revoked' using errcode = 'P0001';
  end if;

  return p_response_id;
end;
$$;

revoke all on function public.revoke_counsellor_review_response(uuid) from public;
grant execute on function public.revoke_counsellor_review_response(uuid) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'counsellor_review_responses'
      and policyname = 'Counsellors read own review responses'
  ) then
    create policy "Counsellors read own review responses"
      on public.counsellor_review_responses
      for select
      to authenticated
      using (
        public.is_wayfinder_counsellor()
        and counsellor_user_id = auth.uid()
        and exists (
          select 1 from public.counsellor_review_grants g
          where g.id = grant_id
            and g.counsellor_user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'counsellor_review_responses'
      and policyname = 'Parents read published review responses'
  ) then
    create policy "Parents read published review responses"
      on public.counsellor_review_responses
      for select
      to authenticated
      using (
        parent_user_id = auth.uid()
        and status = 'published'
        and public.parent_can_read_published_review_response(grant_id)
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'counsellor_review_responses'
      and policyname = 'Counsellors insert draft review responses'
  ) then
    create policy "Counsellors insert draft review responses"
      on public.counsellor_review_responses
      for insert
      to authenticated
      with check (
        public.is_wayfinder_counsellor()
        and counsellor_user_id = auth.uid()
        and status = 'draft'
        and public.counsellor_review_grant_is_writable(grant_id)
        and exists (
          select 1 from public.counsellor_review_grants g
          where g.id = grant_id
            and g.counsellor_user_id = auth.uid()
            and g.parent_user_id = parent_user_id
            and g.parent_id = parent_id
            and g.counsellor_wayfinder_id = counsellor_wayfinder_id
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'counsellor_review_responses'
      and policyname = 'Counsellors update draft review responses'
  ) then
    create policy "Counsellors update draft review responses"
      on public.counsellor_review_responses
      for update
      to authenticated
      using (
        public.is_wayfinder_counsellor()
        and counsellor_user_id = auth.uid()
        and status = 'draft'
      )
      with check (
        public.is_wayfinder_counsellor()
        and counsellor_user_id = auth.uid()
        and status = 'draft'
        and public.counsellor_review_grant_is_writable(grant_id)
        and exists (
          select 1 from public.counsellor_review_grants g
          where g.id = grant_id
            and g.counsellor_user_id = auth.uid()
        )
      );
  end if;
end;
$$;

-- ============================================================
-- Notes for runtime (Phase 2b — not in this file):
--   - Publish via RPC publish_counsellor_review_response
--   - Revoke via RPC revoke_counsellor_review_response
--   - Draft save via REST INSERT/UPDATE on draft rows only
--   - ai_draft_json and counsellor_working_notes are counsellor-only (no parent SELECT policy)
--   - Parent SELECT does not filter on grant.expires_at (published survives expiry)
--   - Parent SELECT blocked when grant.status = 'revoked'
-- ============================================================
