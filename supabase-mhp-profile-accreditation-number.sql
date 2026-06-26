-- ============================================================
-- Wayfinder MHP profile accreditation number (Issue #71 PR C3g)
-- ============================================================
--
-- Run in Supabase SQL Editor after:
--   supabase-mhp-profile-license.sql
--
-- Purpose:
--   Add accreditation_number to mental_health_professional_profiles so
--   Mental Health Professional profile drafts can store Acc. No. separately
--   from licence / certificate number (Cert. No.).
--
-- User-facing label: Mental Health Professional
-- Internal role gate: public.is_wayfinder_counsellor()
--
-- Owner-applied only. Do not run from CI.

-- ---------------------------------------------------------------------------
-- Column
-- ---------------------------------------------------------------------------

alter table public.mental_health_professional_profiles
  add column if not exists accreditation_number text;
