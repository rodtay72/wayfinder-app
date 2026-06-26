-- ============================================================
-- Wayfinder consent records contract
-- PR #102 — Consent Persistence SQL/RLS contract
-- ============================================================
--
-- Owner-applied only. Run manually in Supabase SQL Editor.
--
-- Purpose:
--   Persist parent acknowledgement/consent records for transparency,
--   privacy, and choice — before research-ready check-ins,
--   questionnaire storage, or data-use expansion.
--
-- Based on:
--   docs/CONSENT_PERSISTENCE_FOUNDATION_SPEC.md (PR #101)
--
-- Prerequisites:
--   - auth.users
--   - public.profiles
--
-- This PR does NOT:
--   - change ensure_profile, auth, or email verification
--   - modify journal_entries, dyads, or profiles RLS
--   - add browser/runtime consent writes
--   - create questionnaire/check-in or research response storage
--   - add revocation RPC (deferred to later PR)
--
-- Wayfinder is ALIGN/CAB parent-development support — not child
-- diagnosis, scoring, or behaviour labelling.
--
-- After apply, verify (expect zero rows until runtime PR):
--   select consent_type, consent_status, count(*)
--   from public.consent_records
--   group by 1, 2;

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'Consent records contract blocked: public.profiles does not exist.'
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Consent records table
-- ---------------------------------------------------------------------------

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id text,
  consent_type text not null,
  consent_version text not null,
  consent_status text not null,
  consent_text_snapshot text not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  source_page text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consent_records_type_check check (
    consent_type in (
      'signup_privacy',
      'research_opt_in',
      'questionnaire_check_in',
      'mhp_sharing',
      'event_payment_terms'
    )
  ),
  constraint consent_records_status_check check (
    consent_status in ('accepted', 'declined', 'revoked', 'superseded')
  ),
  constraint consent_records_version_not_blank check (
    length(trim(consent_version)) > 0
  ),
  constraint consent_records_snapshot_not_blank check (
    length(trim(consent_text_snapshot)) > 0
  ),
  constraint consent_records_accepted_at_required check (
    consent_status <> 'accepted' or accepted_at is not null
  ),
  constraint consent_records_revoked_at_required check (
    consent_status <> 'revoked' or revoked_at is not null
  )
);

create index if not exists consent_records_user_type_idx
  on public.consent_records (user_id, consent_type, created_at desc);

create index if not exists consent_records_parent_id_idx
  on public.consent_records (parent_id)
  where parent_id is not null;

create index if not exists consent_records_user_type_status_idx
  on public.consent_records (user_id, consent_type, consent_status, created_at desc);

-- ---------------------------------------------------------------------------
-- 2. RLS and grants
-- ---------------------------------------------------------------------------
-- Parents may read and insert their own rows only.
-- No authenticated UPDATE/DELETE in this PR — snapshots stay immutable;
-- revocation UX deferred to a later controlled RPC/policy PR.

alter table public.consent_records enable row level security;

revoke all on public.consent_records from public;
grant select, insert on public.consent_records to authenticated;

drop policy if exists "Parents read own consent records" on public.consent_records;
create policy "Parents read own consent records"
  on public.consent_records
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Parents insert own consent records" on public.consent_records;
create policy "Parents insert own consent records"
  on public.consent_records
  for insert
  to authenticated
  with check (user_id = auth.uid());
