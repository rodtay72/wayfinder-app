-- ============================================================
-- Wayfinder parent mark-as-read hotfix (Issue #52 Phase 2d.3.2d/e)
-- ============================================================
--
-- Run in Supabase SQL Editor after:
--   supabase-profiles.sql
--   supabase-schema.sql
--   supabase-counsellor-rls.sql
--   supabase-counsellor-review-grants.sql
--   supabase-counsellor-review-responses.sql
--   supabase-parent-feedback-read-receipts.sql
--   supabase-counsellor-review-responses-per-entry.sql
--
-- Purpose:
--   Fix mark_parent_counsellor_feedback_read after per-entry response migration.
--   Publish already creates a per-entry lock (lock_reason = 'published').
--   Mark as read must remain idempotent and must NOT fail when that lock exists.
--
-- Scope:
--   SQL hotfix only — replaces mark_parent_counsellor_feedback_read.
--   Does NOT alter auth, ensure_profile, Parent/Child ID logic, journal save/read
--   runtime, RLS policies, or parent/counsellor UI helpers.
--
-- Owner-applied only. Do not run from CI.

-- ---------------------------------------------------------------------------
-- mark_parent_counsellor_feedback_read — per-entry safe, idempotent
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
  v_grant_entry_id uuid;
  v_journal_entry_id text;
  v_read_at timestamptz;
  v_entries_locked boolean := false;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if not public.parent_owns_published_feedback_response(p_response_id) then
    raise exception 'Published feedback not found' using errcode = 'P0001';
  end if;

  select
    r.grant_id,
    r.parent_id,
    r.grant_entry_id,
    r.journal_entry_id
  into
    v_grant_id,
    v_parent_id,
    v_grant_entry_id,
    v_journal_entry_id
  from public.counsellor_review_responses r
  where r.id = p_response_id
    and r.parent_user_id = auth.uid()
    and r.status = 'published';

  if v_grant_id is null or v_parent_id is null then
    raise exception 'Published feedback not found' using errcode = 'P0001';
  end if;

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
  on conflict (response_id, parent_user_id) do update
    set
      read_at = coalesce(public.parent_counsellor_feedback_reads.read_at, excluded.read_at),
      updated_at = now();

  select rd.read_at
    into v_read_at
  from public.parent_counsellor_feedback_reads rd
  where rd.response_id = p_response_id
    and rd.parent_user_id = auth.uid();

  if v_read_at is null then
    raise exception 'Read receipt could not be recorded' using errcode = 'P0001';
  end if;

  -- Per-entry lock only: do not lock all grant entries.
  -- Publish may already have created lock_reason = 'published' for this journal entry.
  -- Keep existing lock rows; never fail Mark as read because a lock already exists.
  if v_journal_entry_id is not null and trim(v_journal_entry_id) <> '' then
    begin
      insert into public.parent_counsellor_grant_entry_locks (
        journal_entry_id,
        parent_user_id,
        parent_id,
        grant_id,
        response_id,
        lock_reason,
        locked_at
      ) values (
        trim(v_journal_entry_id),
        auth.uid(),
        v_parent_id,
        v_grant_id,
        p_response_id,
        'read',
        now()
      )
      on conflict (journal_entry_id) do nothing;
    exception
      when others then
        -- Read receipt remains committed; existing publish lock is sufficient.
        null;
    end;

    select exists (
      select 1
      from public.parent_counsellor_grant_entry_locks l
      where l.journal_entry_id = trim(v_journal_entry_id)
        and l.parent_user_id = auth.uid()
    )
    into v_entries_locked;
  end if;

  return query
  select
    p_response_id,
    v_grant_id,
    v_read_at,
    v_entries_locked;
end;
$$;

revoke all on function public.mark_parent_counsellor_feedback_read(uuid) from public;
grant execute on function public.mark_parent_counsellor_feedback_read(uuid) to authenticated;

-- ============================================================
-- Notes:
--   - Read receipt upsert is idempotent for repeated Mark as read clicks.
--   - Existing publish locks (lock_reason = 'published') are preserved via
--     ON CONFLICT DO NOTHING on parent_counsellor_grant_entry_locks.
--   - Only the response-linked journal_entry_id is touched — never all grant entries.
--   - Runtime helpers/UI unchanged; owner applies this SQL manually after merge.
-- ============================================================
