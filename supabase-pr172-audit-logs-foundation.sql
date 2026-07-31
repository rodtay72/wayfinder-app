-- ============================================================
-- Wayfinder audit_logs SQL foundation (metadata-only)
-- PR #172 — migration draft for review — NOT auto-applied
-- ============================================================
--
-- OWNER-APPLIED ONLY. Run manually in Supabase SQL Editor after
-- PR #172 merges and owner explicitly approves production/staging apply.
-- Do not run from browser code. Do not apply in this PR.
--
-- Purpose:
--   Create public.audit_logs for future metadata-only security and
--   accountability events. RLS enabled with deny-by-default posture.
--
-- This file does NOT:
--   - create runtime emitters, API routes, or SECURITY DEFINER RPCs
--   - add RLS policies allowing parent/MHP SELECT or broad INSERT
--   - create support views or grants
--   - alter journal_entries, profiles, auth, ensure_profile, Stripe tables
--   - store journal/Decode/CAB/MHP feedback/AI/Stripe payload/private content
--
-- Privacy (table purpose):
--   audit_logs stores metadata-only security/accountability events.
--   Do not store journal body, Decode text, CAB text, MHP feedback text,
--   child name, parent email, AI prompt/response, Stripe payload body, JWT,
--   password, token, secret, raw billing portal URL, or private reflection
--   content. Raw IP is not stored unless separately approved.
--
-- After owner-approved apply, verify:
--   select to_regclass('public.audit_logs');
--   select relrowsecurity from pg_class where oid = 'public.audit_logs'::regclass;
--   select count(*) from pg_policies where schemaname = 'public' and tablename = 'audit_logs';
--   -- expected: RLS on; zero policies until a later reviewed PR

-- ---------------------------------------------------------------------------
-- 1. public.audit_logs
-- ---------------------------------------------------------------------------

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  event_time timestamptz not null default now(),
  created_at timestamptz not null default now(),
  event_type text not null,
  event_category text not null,
  actor_role text not null,
  actor_user_ref_hash text null,
  actor_parent_id_masked text null,
  actor_counsellor_id_masked text null,
  resource_type text null,
  resource_ref_hash text null,
  child_id_masked text null,
  outcome text not null,
  failure_reason_code text null,
  request_context jsonb null default '{}'::jsonb,
  ip_region_or_prefix text null,
  session_ref_hash text null,
  correlation_id text null,
  metadata jsonb not null default '{}'::jsonb,
  constraint audit_logs_outcome_check
    check (outcome in ('success', 'failure', 'blocked')),
  constraint audit_logs_event_category_check
    check (event_category in (
      'auth',
      'profile',
      'child_dyad',
      'journal',
      'mhp_sharing',
      'billing_entitlement',
      'admin_owner',
      'security_privacy',
      'ai_future'
    )),
  constraint audit_logs_event_type_nonempty_check
    check (char_length(trim(event_type)) > 0),
  constraint audit_logs_metadata_object_check
    check (jsonb_typeof(metadata) = 'object'),
  constraint audit_logs_request_context_object_check
    check (request_context is null or jsonb_typeof(request_context) = 'object')
);

comment on table public.audit_logs is
  'Metadata-only security/accountability audit events. Do not store journal body, Decode text, CAB text, MHP feedback, child names, parent emails, AI prompt/response, Stripe payloads, tokens, secrets, or private reflection content.';

comment on column public.audit_logs.event_type is
  'Allowlisted event name (future validation). Non-empty text; not an enum in PR #172.';

comment on column public.audit_logs.metadata is
  'Minimal allowlisted keys only at insert time (future RPC/API). Must remain a jsonb object; no private reflection content.';

comment on column public.audit_logs.ip_region_or_prefix is
  'Regional or prefix only unless legal/security approves full IP storage.';

-- ---------------------------------------------------------------------------
-- 2. Indexes (review storage/performance before production apply)
-- ---------------------------------------------------------------------------

create index if not exists audit_logs_event_time_desc_idx
  on public.audit_logs (event_time desc);

create index if not exists audit_logs_event_type_idx
  on public.audit_logs (event_type);

create index if not exists audit_logs_event_category_idx
  on public.audit_logs (event_category);

create index if not exists audit_logs_actor_role_idx
  on public.audit_logs (actor_role);

create index if not exists audit_logs_outcome_idx
  on public.audit_logs (outcome);

create index if not exists audit_logs_correlation_id_idx
  on public.audit_logs (correlation_id);

create index if not exists audit_logs_resource_type_ref_idx
  on public.audit_logs (resource_type, resource_ref_hash);

create index if not exists audit_logs_child_id_masked_idx
  on public.audit_logs (child_id_masked);

-- ---------------------------------------------------------------------------
-- 3. RLS — deny-by-default (no allow policies in PR #172)
-- ---------------------------------------------------------------------------
-- Future INSERT/SELECT for server-side paths or reviewed admin/support views
-- must be added in separate owner/security-reviewed PRs.
-- Parents and MHP (counsellor) roles must not read audit_logs via RLS here.

alter table public.audit_logs enable row level security;

-- Explicitly revoke direct table privileges from browser/API roles.
-- Future access must be added only through separately reviewed server-side/API/RPC PRs.
revoke all on table public.audit_logs from anon;
revoke all on table public.audit_logs from authenticated;

-- Intentionally no CREATE POLICY statements in this migration draft.
