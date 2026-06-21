-- ============================================================
-- Issue #48 PR B — Tighten counsellor journal access to grants only
-- ============================================================
--
-- Run ONLY after:
--   1. supabase-counsellor-review-grants.sql applied
--   2. Runtime uses DB.getCounsellorGrantedEntries (not getAllEntries)
--   3. Parent + counsellor portal smoke tests pass with grant workflow
--
-- PostgreSQL RLS permissive policies are OR'd. This DROP is required
-- to retire platform-wide counsellor journal visibility.

drop policy if exists "Counsellors can read journal entries" on public.journal_entries;

-- After this migration, counsellors may SELECT journal_entries only when:
--   - entry is attached to an active, non-expired grant assigned to them
--   (policy "Counsellors can read granted journal entries")
