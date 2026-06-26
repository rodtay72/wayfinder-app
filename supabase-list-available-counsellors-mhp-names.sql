-- ============================================================
-- Wayfinder parent-safe MHP selector names
-- Issue #71 C6d
-- ============================================================
-- Purpose:
--   Replace list_available_counsellors() so parent review sharing can display
--   safe Mental Health Professional names instead of generic Counsellor labels.
--
-- Guardrails:
--   - User-facing label: Mental Health Professional / practitioner.
--   - Internal role value remains: counsellor.
--   - Does not expose auth UUIDs, emails, invite tokens, licence PDFs,
--     storage paths, extraction JSON, review notes, or hidden identifiers.
--   - Does not create public MHP signup.
--   - Does not activate membership.
--   - Does not publish profiles.
--   - Does not weaken RLS.
--
-- Owner-applied only. Run manually in Supabase SQL Editor.

drop function if exists public.list_available_counsellors();

create function public.list_available_counsellors()
returns table(
  wayfinder_id text,
  display_label text,
  full_name text,
  professional_title text,
  institution_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.parent_id as wayfinder_id,
    coalesce(
      nullif(trim(mhp.full_name), ''),
      nullif(trim(mhp.professional_title), ''),
      nullif(trim(m.institution_name), ''),
      'Mental Health Professional ' || p.parent_id
    ) as display_label,
    nullif(trim(mhp.full_name), '') as full_name,
    nullif(trim(mhp.professional_title), '') as professional_title,
    nullif(trim(m.institution_name), '') as institution_name
  from public.profiles p
  left join public.mental_health_professional_profiles mhp
    on mhp.user_id = p.user_id
  left join public.mental_health_professional_memberships m
    on m.user_id = p.user_id
  where p.role = 'counsellor'
    and p.parent_id is not null
  order by
    coalesce(
      nullif(trim(mhp.full_name), ''),
      nullif(trim(mhp.professional_title), ''),
      nullif(trim(m.institution_name), ''),
      p.parent_id
    ) asc,
    p.parent_id asc;
$$;

revoke all on function public.list_available_counsellors() from public;
grant execute on function public.list_available_counsellors() to authenticated;
