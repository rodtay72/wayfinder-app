-- ============================================================
-- Wayfinder parent counsellor feedback data contract (Issue #52 Phase 2d.1)
-- ============================================================
--
-- Run in Supabase SQL Editor after:
--   supabase-profiles.sql
--   supabase-schema.sql
--   supabase-counsellor-rls.sql
--   supabase-counsellor-review-grants.sql
--   supabase-counsellor-review-responses.sql
--
-- Phase 2d.1 ONLY: tables, RLS, RPCs, triggers, publish/grant extensions.
-- Does NOT modify auth, ensure_profile, email verification, Parent/Child ID logic.
-- Does NOT add runtime helpers (Phase 2d.2) or parent UI (Phase 2d.3).
-- Does NOT reintroduce broad counsellor journal access.
--
-- Privacy:
--   Parents read published feedback via SECURITY DEFINER RPCs only.
--   No parent SELECT on counsellor_review_responses base table.
--   RPCs never return response_sections, ai_draft_json, counsellor_working_notes,
--   parent email, tokens, or child names.
--   grant_id may be returned for internal app routing — parent UI must not display it.
--
-- Integrity:
--   Grant-linked journal entries lock on counsellor publish and on parent mark-read.
--   Locks persist after counsellor response revoke.
--   Unrelated journal entries remain editable.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Parent owns a published, currently readable counsellor response.
create or replace function public.parent_owns_published_feedback_response(p_response_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.counsellor_review_responses r
    where r.id = p_response_id
      and r.parent_user_id = auth.uid()
      and r.status = 'published'
      and public.parent_can_read_published_review_response(r.grant_id)
  );
$$;

revoke all on function public.parent_owns_published_feedback_response(uuid) from public;
grant execute on function public.parent_owns_published_feedback_response(uuid) to authenticated;

-- Journal entry is locked for review integrity (grant-scoped entries only).
create or replace function public.journal_entry_is_review_locked(p_journal_entry_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.parent_counsellor_grant_entry_locks l
    where l.journal_entry_id = trim(p_journal_entry_id)
      and l.parent_user_id = auth.uid()
  );
$$;

revoke all on function public.journal_entry_is_review_locked(text) from public;
grant execute on function public.journal_entry_is_review_locked(text) to authenticated;

-- Lock all grant-linked entries for a published response (idempotent).
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
begin
  if p_lock_reason not in ('published', 'read') then
    raise exception 'Invalid lock reason' using errcode = 'P0001';
  end if;

  select r.grant_id, r.parent_user_id, r.parent_id
    into v_grant_id, v_parent_user_id, v_parent_id
  from public.counsellor_review_responses r
  where r.id = p_response_id
    and r.status = 'published';

  if v_grant_id is null then
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
  )
  select
    ge.journal_entry_id,
    v_parent_user_id,
    v_parent_id,
    v_grant_id,
    p_response_id,
    p_lock_reason,
    now()
  from public.counsellor_review_grant_entries ge
  where ge.grant_id = v_grant_id
  on conflict (journal_entry_id) do nothing;
end;
$$;

revoke all on function public.lock_grant_entries_for_feedback_response(uuid, text) from public;
-- Internal only: called by publish/read SECURITY DEFINER RPCs (no authenticated execute grant).

-- ---------------------------------------------------------------------------
-- A. Read receipts
-- ---------------------------------------------------------------------------

create table if not exists public.parent_counsellor_feedback_reads (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.counsellor_review_responses(id) on delete cascade,
  grant_id uuid not null references public.counsellor_review_grants(id) on delete cascade,
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  parent_id text not null,
  read_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (response_id, parent_user_id)
);

create index if not exists parent_counsellor_feedback_reads_parent_idx
  on public.parent_counsellor_feedback_reads (parent_user_id, read_at desc);

create index if not exists parent_counsellor_feedback_reads_response_idx
  on public.parent_counsellor_feedback_reads (response_id);

alter table public.parent_counsellor_feedback_reads enable row level security;

-- Parent may read own receipts only. Writes via RPC (no direct INSERT/UPDATE policies).
grant select on public.parent_counsellor_feedback_reads to authenticated;

drop policy if exists "Parents read own feedback read receipts" on public.parent_counsellor_feedback_reads;
create policy "Parents read own feedback read receipts"
  on public.parent_counsellor_feedback_reads
  for select
  to authenticated
  using (parent_user_id = auth.uid());

-- No counsellor policies on this table (parent-private read metadata).

-- ---------------------------------------------------------------------------
-- B. Parent private reflections (per grant-linked entry)
-- ---------------------------------------------------------------------------

create table if not exists public.parent_counsellor_feedback_reflections (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.counsellor_review_responses(id) on delete cascade,
  grant_id uuid not null references public.counsellor_review_grants(id) on delete cascade,
  grant_entry_id uuid not null references public.counsellor_review_grant_entries(id) on delete cascade,
  journal_entry_id text not null references public.journal_entries(id) on delete cascade,
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  parent_id text not null,
  reflection_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (parent_user_id, grant_entry_id, response_id)
);

create index if not exists parent_counsellor_feedback_reflections_parent_idx
  on public.parent_counsellor_feedback_reflections (parent_user_id, updated_at desc);

create index if not exists parent_counsellor_feedback_reflections_entry_idx
  on public.parent_counsellor_feedback_reflections (journal_entry_id);

alter table public.parent_counsellor_feedback_reflections enable row level security;

-- Parent may read own reflections only. Writes via save_parent_counsellor_feedback_reflection RPC only.
grant select on public.parent_counsellor_feedback_reflections to authenticated;

drop policy if exists "Parents read own feedback reflections" on public.parent_counsellor_feedback_reflections;
create policy "Parents read own feedback reflections"
  on public.parent_counsellor_feedback_reflections
  for select
  to authenticated
  using (parent_user_id = auth.uid());

drop policy if exists "Parents insert own feedback reflections" on public.parent_counsellor_feedback_reflections;
drop policy if exists "Parents update own feedback reflections" on public.parent_counsellor_feedback_reflections;

-- No counsellor policies (no share-back in Phase 2d). No direct authenticated INSERT/UPDATE.

-- ---------------------------------------------------------------------------
-- C. Entry locks (immutable; grant-scoped entries only)
-- ---------------------------------------------------------------------------

create table if not exists public.parent_counsellor_grant_entry_locks (
  journal_entry_id text primary key references public.journal_entries(id) on delete restrict,
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  parent_id text not null,
  grant_id uuid not null references public.counsellor_review_grants(id) on delete restrict,
  response_id uuid not null references public.counsellor_review_responses(id) on delete restrict,
  lock_reason text not null check (lock_reason in ('published', 'read')),
  locked_at timestamptz not null default now()
);

create index if not exists parent_counsellor_grant_entry_locks_parent_idx
  on public.parent_counsellor_grant_entry_locks (parent_user_id);

create index if not exists parent_counsellor_grant_entry_locks_grant_idx
  on public.parent_counsellor_grant_entry_locks (grant_id);

alter table public.parent_counsellor_grant_entry_locks enable row level security;

grant select on public.parent_counsellor_grant_entry_locks to authenticated;

drop policy if exists "Parents read own grant entry locks" on public.parent_counsellor_grant_entry_locks;
create policy "Parents read own grant entry locks"
  on public.parent_counsellor_grant_entry_locks
  for select
  to authenticated
  using (parent_user_id = auth.uid());

-- No authenticated INSERT/UPDATE/DELETE policies — locks written only via SECURITY DEFINER RPCs/triggers.

-- ---------------------------------------------------------------------------
-- H. Journal entry update protection (tightening; reads unchanged)
-- ---------------------------------------------------------------------------

create or replace function public.prevent_locked_journal_entry_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entry_id text;
begin
  v_entry_id := coalesce(
    case when tg_op = 'DELETE' then old.id::text else new.id::text end,
    ''
  );

  if v_entry_id <> ''
     and exists (
       select 1
       from public.parent_counsellor_grant_entry_locks l
       where l.journal_entry_id = v_entry_id
         and l.parent_user_id = auth.uid()
     ) then
    raise exception 'Journal entry is locked for counsellor review integrity'
      using errcode = '42501';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function public.prevent_locked_journal_entry_mutation() from public;

drop trigger if exists trg_prevent_locked_journal_entry_update on public.journal_entries;
create trigger trg_prevent_locked_journal_entry_update
  before update on public.journal_entries
  for each row
  execute function public.prevent_locked_journal_entry_mutation();

drop trigger if exists trg_prevent_locked_journal_entry_delete on public.journal_entries;
create trigger trg_prevent_locked_journal_entry_delete
  before delete on public.journal_entries
  for each row
  execute function public.prevent_locked_journal_entry_mutation();

drop trigger if exists trg_prevent_locked_journal_entry_insert_overwrite on public.journal_entries;
create trigger trg_prevent_locked_journal_entry_insert_overwrite
  before insert on public.journal_entries
  for each row
  execute function public.prevent_locked_journal_entry_mutation();

-- ---------------------------------------------------------------------------
-- Extend publish RPC: atomic publish + entry locks (published)
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

  perform public.lock_grant_entries_for_feedback_response(p_response_id, 'published');

  return p_response_id;
end;
$$;

revoke all on function public.publish_counsellor_review_response(uuid) from public;
grant execute on function public.publish_counsellor_review_response(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Extend grant creation: reject locked entries (re-share integrity)
-- ---------------------------------------------------------------------------

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

    if exists (
      select 1
      from public.parent_counsellor_grant_entry_locks l
      where l.journal_entry_id = trim(v_entry_id)
        and l.parent_user_id = auth.uid()
    ) then
      raise exception 'One or more entries are locked for review integrity and cannot be shared again'
        using errcode = 'P0001';
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

-- ---------------------------------------------------------------------------
-- D. Parent-safe unread notification source
-- ---------------------------------------------------------------------------

create or replace function public.get_parent_unread_counsellor_feedback_count()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.counsellor_review_responses r
  where r.parent_user_id = auth.uid()
    and r.status = 'published'
    and public.parent_can_read_published_review_response(r.grant_id)
    and not exists (
      select 1
      from public.parent_counsellor_feedback_reads rd
      where rd.response_id = r.id
        and rd.parent_user_id = auth.uid()
    );
$$;

revoke all on function public.get_parent_unread_counsellor_feedback_count() from public;
grant execute on function public.get_parent_unread_counsellor_feedback_count() to authenticated;

create or replace function public.get_parent_unread_counsellor_feedback_summary()
returns table(
  response_id uuid,
  grant_id uuid,
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
    r.counsellor_wayfinder_id,
    r.published_at,
    case
      when (
        select count(*)
        from public.counsellor_review_grant_entries ge
        where ge.grant_id = r.grant_id
      ) = 1 then 'Counsellor feedback on 1 shared reflection'
      else 'Counsellor feedback on ' || (
        select count(*)::text
        from public.counsellor_review_grant_entries ge
        where ge.grant_id = r.grant_id
      ) || ' shared reflections'
    end as context_label
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

-- ---------------------------------------------------------------------------
-- E. Parent-safe published response detail (extends Phase 2a read path)
-- ---------------------------------------------------------------------------

create or replace function public.get_parent_counsellor_feedback_detail(p_response_id uuid)
returns table(
  response_id uuid,
  grant_id uuid,
  counsellor_wayfinder_id text,
  parent_facing_text text,
  published_at timestamptz,
  is_read boolean,
  read_at timestamptz,
  linked_journal_entry_ids text[],
  linked_grant_entries jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id as response_id,
    r.grant_id,
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
    ) as read_at,
    coalesce(
      (
        select array_agg(ge.journal_entry_id order by ge.created_at asc)
        from public.counsellor_review_grant_entries ge
        where ge.grant_id = r.grant_id
      ),
      array[]::text[]
    ) as linked_journal_entry_ids,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'grant_entry_id', ge.id,
            'journal_entry_id', ge.journal_entry_id
          )
          order by ge.created_at asc
        )
        from public.counsellor_review_grant_entries ge
        where ge.grant_id = r.grant_id
      ),
      '[]'::jsonb
    ) as linked_grant_entries
  from public.counsellor_review_responses r
  where r.id = p_response_id
    and r.parent_user_id = auth.uid()
    and r.status = 'published'
    and public.parent_can_read_published_review_response(r.grant_id);
$$;

revoke all on function public.get_parent_counsellor_feedback_detail(uuid) from public;
grant execute on function public.get_parent_counsellor_feedback_detail(uuid) to authenticated;

-- Existing Phase 2a RPC retained unchanged for backward compatibility.
-- Phase 2d.2 helpers may prefer get_parent_counsellor_feedback_detail for richer reads.

-- ---------------------------------------------------------------------------
-- F. Mark as read RPC
-- ---------------------------------------------------------------------------

create or replace function public.mark_parent_counsellor_feedback_read(p_response_id uuid)
returns table(
  response_id uuid,
  grant_id uuid,
  read_at timestamptz,
  entries_locked boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_grant_id uuid;
  v_parent_id text;
  v_read_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if not public.parent_owns_published_feedback_response(p_response_id) then
    raise exception 'Published feedback not found' using errcode = 'P0001';
  end if;

  select r.grant_id, r.parent_id
    into v_grant_id, v_parent_id
  from public.counsellor_review_responses r
  where r.id = p_response_id;

  insert into public.parent_counsellor_feedback_reads (
    response_id,
    grant_id,
    parent_user_id,
    parent_id,
    read_at,
    created_at,
    updated_at
  ) values (
    p_response_id,
    v_grant_id,
    auth.uid(),
    v_parent_id,
    now(),
    now(),
    now()
  )
  on conflict (response_id, parent_user_id) do nothing;

  select rd.read_at
    into v_read_at
  from public.parent_counsellor_feedback_reads rd
  where rd.response_id = p_response_id
    and rd.parent_user_id = auth.uid();

  perform public.lock_grant_entries_for_feedback_response(p_response_id, 'read');

  return query
  select
    p_response_id,
    v_grant_id,
    v_read_at,
    true as entries_locked;
end;
$$;

revoke all on function public.mark_parent_counsellor_feedback_read(uuid) from public;
grant execute on function public.mark_parent_counsellor_feedback_read(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- G. Parent reflection save/load RPCs (prefer RPC over direct REST for validation)
-- ---------------------------------------------------------------------------

create or replace function public.save_parent_counsellor_feedback_reflection(
  p_response_id uuid,
  p_grant_entry_id uuid,
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

  select r.grant_id, r.parent_id
    into v_grant_id, v_parent_id
  from public.counsellor_review_responses r
  where r.id = p_response_id;

  select ge.journal_entry_id
    into v_journal_entry_id
  from public.counsellor_review_grant_entries ge
  where ge.id = p_grant_entry_id
    and ge.grant_id = v_grant_id;

  if v_journal_entry_id is null then
    raise exception 'Grant entry not found for this feedback' using errcode = 'P0001';
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
    p_grant_entry_id,
    v_journal_entry_id,
    auth.uid(),
    v_parent_id,
    coalesce(p_reflection_text, ''),
    now(),
    now()
  )
  on conflict (parent_user_id, grant_entry_id, response_id) do update
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

revoke all on function public.save_parent_counsellor_feedback_reflection(uuid, uuid, text) from public;
grant execute on function public.save_parent_counsellor_feedback_reflection(uuid, uuid, text) to authenticated;

create or replace function public.get_parent_counsellor_feedback_reflection(
  p_response_id uuid,
  p_grant_entry_id uuid
)
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
    and fr.grant_entry_id = p_grant_entry_id
    and public.parent_owns_published_feedback_response(p_response_id);
$$;

revoke all on function public.get_parent_counsellor_feedback_reflection(uuid, uuid) from public;
grant execute on function public.get_parent_counsellor_feedback_reflection(uuid, uuid) to authenticated;

-- Entry lock map for journal trail / dashboard (parent-safe).
create or replace function public.get_parent_entry_review_lock_map(p_journal_entry_ids text[])
returns table(
  journal_entry_id text,
  is_locked boolean,
  lock_reason text,
  locked_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    eid as journal_entry_id,
    exists (
      select 1
      from public.parent_counsellor_grant_entry_locks l
      where l.journal_entry_id = trim(eid)
        and l.parent_user_id = auth.uid()
    ) as is_locked,
    (
      select l.lock_reason
      from public.parent_counsellor_grant_entry_locks l
      where l.journal_entry_id = trim(eid)
        and l.parent_user_id = auth.uid()
      limit 1
    ) as lock_reason,
    (
      select l.locked_at
      from public.parent_counsellor_grant_entry_locks l
      where l.journal_entry_id = trim(eid)
        and l.parent_user_id = auth.uid()
      limit 1
    ) as locked_at
  from unnest(coalesce(p_journal_entry_ids, array[]::text[])) as eid;
$$;

revoke all on function public.get_parent_entry_review_lock_map(text[]) from public;
grant execute on function public.get_parent_entry_review_lock_map(text[]) to authenticated;

-- ============================================================
-- Phase 2d.2 runtime notes (not in this file):
--   - Wrap RPCs in supabase.js with unavailable fallback
--   - saveEntry: surface lock rejection from trigger (42501)
-- Phase 2d.3 UI notes (not in this file):
--   - Dashboard notification from get_parent_unread_counsellor_feedback_summary
--   - Mark as read via mark_parent_counsellor_feedback_read only (not on open)
--   - Confidentiality notice in content.js (not stored in DB)
--   - Do not display grant_id in parent-facing labels
-- ============================================================
