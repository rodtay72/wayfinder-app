-- ============================================================
-- Wayfinder per-entry counsellor review responses (Issue #52 Phase 2d.3.2a)
-- ============================================================
--
-- Run in Supabase SQL Editor after:
--   supabase-profiles.sql
--   supabase-schema.sql
--   supabase-counsellor-rls.sql
--   supabase-counsellor-review-grants.sql
--   supabase-counsellor-review-responses.sql
--   supabase-parent-feedback-read-receipts.sql
--
-- Phase 2d.3.2a ONLY: schema migration + RLS/RPC replacements for per-entry responses.
-- Does NOT modify auth, ensure_profile, email verification, Parent/Child ID logic.
-- Does NOT add runtime helpers (Phase 2d.3.2b) or UI changes (Phase 2d.3.2c/d).
-- Does NOT reintroduce broad counsellor journal access.
--
-- Contract change:
--   One counsellor_review_responses row per counsellor_review_grant_entries row
--   (grant_entry_id), not one row per grant.
--
-- Legacy migration (Option A):
--   - ABORT if any response row exists for a grant with multiple grant entries.
--   - Backfill grant_entry_id + journal_entry_id for single-entry grant responses.
--   - ABORT if any response row remains without grant_entry_id.
--   - Replace unique(grant_id) with unique(grant_entry_id).
--
-- Production note:
--   Legacy test response 316c0d22-f86b-4939-908b-00552e53ecab was deleted before this migration.
--   Owner-applied only — do not run from CI.

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.counsellor_review_responses') is null then
    raise exception 'Phase 2d.3.2a blocked: public.counsellor_review_responses does not exist. Run Phase 2a SQL first.'
      using errcode = 'P0001';
  end if;

  if to_regclass('public.counsellor_review_grant_entries') is null then
    raise exception 'Phase 2d.3.2a blocked: public.counsellor_review_grant_entries does not exist. Run review grants SQL first.'
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Guard: block multi-entry legacy grant-scoped responses (Option A)
-- ---------------------------------------------------------------------------

do $$
declare
  v_blocked_count bigint;
begin
  select count(*)::bigint
    into v_blocked_count
  from public.counsellor_review_responses r
  where (
    select count(*)
    from public.counsellor_review_grant_entries ge
    where ge.grant_id = r.grant_id
  ) > 1;

  if v_blocked_count > 0 then
    raise exception
      'Phase 2d.3.2a blocked: % grant-scoped response row(s) exist for grants with multiple entries. Delete or revoke those rows before migration (Option A).',
      v_blocked_count
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Add per-entry linkage columns (nullable during backfill)
-- ---------------------------------------------------------------------------

alter table public.counsellor_review_responses
  add column if not exists grant_entry_id uuid
    references public.counsellor_review_grant_entries(id) on delete cascade,
  add column if not exists journal_entry_id text
    references public.journal_entries(id) on delete cascade;

-- ---------------------------------------------------------------------------
-- 3. Backfill single-entry grant responses only
-- ---------------------------------------------------------------------------

update public.counsellor_review_responses r
set
  grant_entry_id = ge.id,
  journal_entry_id = ge.journal_entry_id,
  updated_at = now()
from public.counsellor_review_grant_entries ge
where ge.grant_id = r.grant_id
  and r.grant_entry_id is null
  and (
    select count(*)
    from public.counsellor_review_grant_entries ge2
    where ge2.grant_id = r.grant_id
  ) = 1;

do $$
begin
  if exists (
    select 1
    from public.counsellor_review_responses r
    where r.grant_entry_id is null
       or r.journal_entry_id is null
  ) then
    raise exception
      'Phase 2d.3.2a blocked: response row(s) remain without grant_entry_id/journal_entry_id after backfill. Resolve orphan rows before retrying.'
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Enforce final schema: NOT NULL + unique(grant_entry_id)
-- ---------------------------------------------------------------------------

alter table public.counsellor_review_responses
  alter column grant_entry_id set not null,
  alter column journal_entry_id set not null;

alter table public.counsellor_review_responses
  drop constraint if exists counsellor_review_responses_grant_id_key;

alter table public.counsellor_review_responses
  drop constraint if exists counsellor_review_responses_grant_entry_id_key;

alter table public.counsellor_review_responses
  add constraint counsellor_review_responses_grant_entry_id_key
  unique (grant_entry_id);

create index if not exists counsellor_review_responses_grant_entry_idx
  on public.counsellor_review_responses (grant_entry_id);

create index if not exists counsellor_review_responses_journal_entry_idx
  on public.counsellor_review_responses (journal_entry_id);

-- ---------------------------------------------------------------------------
-- 5. Integrity helper: response row matches grant entry linkage
-- ---------------------------------------------------------------------------

create or replace function public.counsellor_review_response_entry_is_valid(
  p_grant_id uuid,
  p_grant_entry_id uuid,
  p_journal_entry_id text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.counsellor_review_grant_entries ge
    join public.counsellor_review_grants g on g.id = ge.grant_id
    where ge.id = p_grant_entry_id
      and ge.grant_id = p_grant_id
      and ge.journal_entry_id = trim(p_journal_entry_id)
  );
$$;

revoke all on function public.counsellor_review_response_entry_is_valid(uuid, uuid, text) from public;
grant execute on function public.counsellor_review_response_entry_is_valid(uuid, uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Counsellor RLS: require per-entry linkage on draft insert/update
-- ---------------------------------------------------------------------------

drop policy if exists "Counsellors insert draft review responses" on public.counsellor_review_responses;
create policy "Counsellors insert draft review responses"
  on public.counsellor_review_responses
  for insert
  to authenticated
  with check (
    public.is_wayfinder_counsellor()
    and counsellor_user_id = auth.uid()
    and status = 'draft'
    and public.counsellor_review_grant_is_writable(grant_id)
    and public.counsellor_review_response_entry_is_valid(grant_id, grant_entry_id, journal_entry_id)
    and exists (
      select 1
      from public.counsellor_review_grants g
      where g.id = grant_id
        and g.counsellor_user_id = auth.uid()
        and g.parent_user_id = parent_user_id
        and g.parent_id = parent_id
        and g.counsellor_wayfinder_id = counsellor_wayfinder_id
    )
  );

drop policy if exists "Counsellors update draft review responses" on public.counsellor_review_responses;
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
    and public.counsellor_review_response_entry_is_valid(grant_id, grant_entry_id, journal_entry_id)
    and exists (
      select 1
      from public.counsellor_review_grants g
      where g.id = grant_id
        and g.counsellor_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 7. Entry lock helper: lock only the response-linked journal entry
-- ---------------------------------------------------------------------------

create or replace function public.lock_grant_entries_for_feedback_response(
  p_response_id uuid,
  p_lock_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_grant_id uuid;
  v_parent_user_id uuid;
  v_parent_id text;
  v_journal_entry_id text;
begin
  if p_lock_reason not in ('published', 'read') then
    raise exception 'Invalid lock reason' using errcode = 'P0001';
  end if;

  select r.grant_id, r.parent_user_id, r.parent_id, r.journal_entry_id
    into v_grant_id, v_parent_user_id, v_parent_id, v_journal_entry_id
  from public.counsellor_review_responses r
  where r.id = p_response_id
    and r.status = 'published';

  if v_grant_id is null or v_journal_entry_id is null then
    raise exception 'Published response not found' using errcode = 'P0001';
  end if;

  insert into public.parent_counsellor_grant_entry_locks (
    journal_entry_id,
    parent_user_id,
    parent_id,
    grant_id,
    response_id,
    lock_reason,
    locked_at
  ) values (
    v_journal_entry_id,
    v_parent_user_id,
    v_parent_id,
    v_grant_id,
    p_response_id,
    p_lock_reason,
    now()
  )
  on conflict (journal_entry_id) do nothing;
end;
$$;

revoke all on function public.lock_grant_entries_for_feedback_response(uuid, text) from public;
revoke execute on function public.lock_grant_entries_for_feedback_response(uuid, text) from authenticated;

-- ---------------------------------------------------------------------------
-- 8. Publish RPC: unchanged flow; lock helper now scopes to one entry
-- ---------------------------------------------------------------------------

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
    and r.status = 'draft'
    and r.grant_entry_id is not null
    and r.journal_entry_id is not null;

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

  perform public.lock_grant_entries_for_feedback_response(p_response_id, 'published');

  return p_response_id;
end;
$$;

revoke all on function public.publish_counsellor_review_response(uuid) from public;
grant execute on function public.publish_counsellor_review_response(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 9. Parent-safe read RPCs: per-entry routing fields
-- ---------------------------------------------------------------------------

drop function if exists public.get_parent_published_review_responses(uuid);

create or replace function public.get_parent_published_review_responses(p_grant_id uuid default null)
returns table(
  response_id uuid,
  grant_id uuid,
  grant_entry_id uuid,
  journal_entry_id text,
  counsellor_wayfinder_id text,
  parent_facing_text text,
  published_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id as response_id,
    r.grant_id,
    r.grant_entry_id,
    r.journal_entry_id,
    r.counsellor_wayfinder_id,
    r.parent_facing_text,
    r.published_at
  from public.counsellor_review_responses r
  where r.parent_user_id = auth.uid()
    and r.status = 'published'
    and public.parent_can_read_published_review_response(r.grant_id)
    and (p_grant_id is null or r.grant_id = p_grant_id);
$$;

revoke all on function public.get_parent_published_review_responses(uuid) from public;
grant execute on function public.get_parent_published_review_responses(uuid) to authenticated;

drop function if exists public.get_parent_unread_counsellor_feedback_summary();

create or replace function public.get_parent_unread_counsellor_feedback_summary()
returns table(
  response_id uuid,
  grant_id uuid,
  grant_entry_id uuid,
  journal_entry_id text,
  counsellor_wayfinder_id text,
  published_at timestamptz,
  context_label text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id as response_id,
    r.grant_id,
    r.grant_entry_id,
    r.journal_entry_id,
    r.counsellor_wayfinder_id,
    r.published_at,
    'Counsellor feedback on a shared reflection'::text as context_label
  from public.counsellor_review_responses r
  where r.parent_user_id = auth.uid()
    and r.status = 'published'
    and public.parent_can_read_published_review_response(r.grant_id)
    and not exists (
      select 1
      from public.parent_counsellor_feedback_reads rd
      where rd.response_id = r.id
        and rd.parent_user_id = auth.uid()
    )
  order by r.published_at desc;
$$;

revoke all on function public.get_parent_unread_counsellor_feedback_summary() from public;
grant execute on function public.get_parent_unread_counsellor_feedback_summary() to authenticated;

drop function if exists public.get_parent_counsellor_feedback_detail(uuid);

create or replace function public.get_parent_counsellor_feedback_detail(p_response_id uuid)
returns table(
  response_id uuid,
  grant_id uuid,
  grant_entry_id uuid,
  journal_entry_id text,
  counsellor_wayfinder_id text,
  parent_facing_text text,
  published_at timestamptz,
  is_read boolean,
  read_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id as response_id,
    r.grant_id,
    r.grant_entry_id,
    r.journal_entry_id,
    r.counsellor_wayfinder_id,
    r.parent_facing_text,
    r.published_at,
    exists (
      select 1
      from public.parent_counsellor_feedback_reads rd
      where rd.response_id = r.id
        and rd.parent_user_id = auth.uid()
    ) as is_read,
    (
      select rd.read_at
      from public.parent_counsellor_feedback_reads rd
      where rd.response_id = r.id
        and rd.parent_user_id = auth.uid()
      limit 1
    ) as read_at
  from public.counsellor_review_responses r
  where r.id = p_response_id
    and r.parent_user_id = auth.uid()
    and r.status = 'published'
    and public.parent_can_read_published_review_response(r.grant_id);
$$;

revoke all on function public.get_parent_counsellor_feedback_detail(uuid) from public;
grant execute on function public.get_parent_counsellor_feedback_detail(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 10. Parent reflections: one private reflection per response (1:1)
-- ---------------------------------------------------------------------------

do $$
declare
  v_duplicate_count bigint;
  c record;
begin
  if to_regclass('public.parent_counsellor_feedback_reflections') is not null then
    select count(*)::bigint
      into v_duplicate_count
    from (
      select fr.parent_user_id, fr.response_id, count(*) as reflection_count
      from public.parent_counsellor_feedback_reflections fr
      group by fr.parent_user_id, fr.response_id
      having count(*) > 1
    ) dup;

    if v_duplicate_count > 0 then
      raise exception
        'Phase 2d.3.2a blocked: % response(s) have multiple parent reflection rows. Consolidate to one reflection per response before migration.',
        v_duplicate_count
        using errcode = 'P0001';
    end if;

    for c in
      select con.conname
      from pg_constraint con
      where con.conrelid = 'public.parent_counsellor_feedback_reflections'::regclass
        and con.contype = 'u'
    loop
      execute format(
        'alter table public.parent_counsellor_feedback_reflections drop constraint if exists %I',
        c.conname
      );
    end loop;

    alter table public.parent_counsellor_feedback_reflections
      add constraint parent_counsellor_feedback_reflections_parent_user_id_response_id_key
      unique (parent_user_id, response_id);
  end if;
end;
$$;

drop function if exists public.save_parent_counsellor_feedback_reflection(uuid, uuid, text);

create or replace function public.save_parent_counsellor_feedback_reflection(
  p_response_id uuid,
  p_reflection_text text
)
returns table(
  reflection_id uuid,
  journal_entry_id text,
  reflection_text text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_grant_id uuid;
  v_grant_entry_id uuid;
  v_parent_id text;
  v_journal_entry_id text;
  v_row public.parent_counsellor_feedback_reflections%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if not public.parent_owns_published_feedback_response(p_response_id) then
    raise exception 'Published feedback not found' using errcode = 'P0001';
  end if;

  select r.grant_id, r.grant_entry_id, r.parent_id, r.journal_entry_id
    into v_grant_id, v_grant_entry_id, v_parent_id, v_journal_entry_id
  from public.counsellor_review_responses r
  where r.id = p_response_id;

  if v_grant_entry_id is null or v_journal_entry_id is null then
    raise exception 'Response entry linkage not found' using errcode = 'P0001';
  end if;

  insert into public.parent_counsellor_feedback_reflections (
    response_id,
    grant_id,
    grant_entry_id,
    journal_entry_id,
    parent_user_id,
    parent_id,
    reflection_text,
    created_at,
    updated_at
  ) values (
    p_response_id,
    v_grant_id,
    v_grant_entry_id,
    v_journal_entry_id,
    auth.uid(),
    v_parent_id,
    coalesce(p_reflection_text, ''),
    now(),
    now()
  )
  on conflict (parent_user_id, response_id) do update
    set
      reflection_text = excluded.reflection_text,
      updated_at = now()
  returning * into v_row;

  return query
  select
    v_row.id,
    v_row.journal_entry_id,
    v_row.reflection_text,
    v_row.updated_at;
end;
$$;

revoke all on function public.save_parent_counsellor_feedback_reflection(uuid, text) from public;
grant execute on function public.save_parent_counsellor_feedback_reflection(uuid, text) to authenticated;

drop function if exists public.get_parent_counsellor_feedback_reflection(uuid, uuid);

create or replace function public.get_parent_counsellor_feedback_reflection(p_response_id uuid)
returns table(
  reflection_id uuid,
  journal_entry_id text,
  reflection_text text,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    fr.id as reflection_id,
    fr.journal_entry_id,
    fr.reflection_text,
    fr.updated_at
  from public.parent_counsellor_feedback_reflections fr
  where fr.parent_user_id = auth.uid()
    and fr.response_id = p_response_id
    and public.parent_owns_published_feedback_response(p_response_id);
$$;

revoke all on function public.get_parent_counsellor_feedback_reflection(uuid) from public;
grant execute on function public.get_parent_counsellor_feedback_reflection(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 11. Counsellor lookup RPC (draft/published/revoked for one grant entry)
-- ---------------------------------------------------------------------------

create or replace function public.get_counsellor_review_response_for_grant_entry(p_grant_entry_id uuid)
returns table(
  response_id uuid,
  grant_id uuid,
  grant_entry_id uuid,
  journal_entry_id text,
  counsellor_user_id uuid,
  parent_user_id uuid,
  parent_id text,
  counsellor_wayfinder_id text,
  status text,
  response_sections jsonb,
  parent_facing_text text,
  ai_draft_json jsonb,
  counsellor_working_notes text,
  published_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id as response_id,
    r.grant_id,
    r.grant_entry_id,
    r.journal_entry_id,
    r.counsellor_user_id,
    r.parent_user_id,
    r.parent_id,
    r.counsellor_wayfinder_id,
    r.status,
    r.response_sections,
    r.parent_facing_text,
    r.ai_draft_json,
    r.counsellor_working_notes,
    r.published_at,
    r.revoked_at,
    r.created_at,
    r.updated_at
  from public.counsellor_review_responses r
  join public.counsellor_review_grant_entries ge on ge.id = r.grant_entry_id
  join public.counsellor_review_grants g on g.id = r.grant_id
  where r.grant_entry_id = p_grant_entry_id
    and r.counsellor_user_id = auth.uid()
    and g.counsellor_user_id = auth.uid()
    and (
      public.counsellor_review_grant_is_writable(r.grant_id)
      or r.status in ('published', 'revoked')
    );
$$;

revoke all on function public.get_counsellor_review_response_for_grant_entry(uuid) from public;
grant execute on function public.get_counsellor_review_response_for_grant_entry(uuid) to authenticated;

-- ============================================================
-- Phase 2d.3.2b runtime notes (not in this file):
--   - supabase.js: key counsellor save/load by grant_entry_id
--   - Parent helpers: use simplified reflection RPC signatures
--   - Graceful unavailable fallback until owner applies this SQL
-- Phase 2d.3.2c/d UI notes (not in this file):
--   - One parent reflection textarea per response
--   - Remove bundled linked_grant_entries display
-- ============================================================
