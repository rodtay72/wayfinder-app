-- ============================================================
-- Wayfinder profile duplicate detection and cleanup guide
-- ============================================================
--
-- WARNING:
-- 1. Backup/export the affected tables before deleting anything.
-- 2. Prefer the oldest created_at row as canonical for each user_id.
-- 3. Do not run DELETE statements until you have reviewed the rows and
--    confirmed no related data needs to be migrated.
--
-- The intended invariant is:
-- - one profiles row per auth user_id
-- - one unique parent_id / Wayfinder ID per profile

-- ------------------------------------------------------------
-- Detect duplicate profiles by user_id
-- ------------------------------------------------------------
select
  user_id,
  count(*) as row_count,
  min(created_at) as oldest_created_at,
  array_agg(parent_id order by created_at asc) as parent_ids
from public.profiles
group by user_id
having count(*) > 1
order by row_count desc, oldest_created_at asc;

-- Inspect all duplicate rows. rn = 1 is the canonical oldest row.
with ranked as (
  select
    p.*,
    row_number() over (partition by user_id order by created_at asc) as rn
  from public.profiles p
)
select *
from ranked
where user_id in (
  select user_id
  from public.profiles
  group by user_id
  having count(*) > 1
)
order by user_id, rn;

-- ------------------------------------------------------------
-- Detect duplicate parent_id values
-- ------------------------------------------------------------
select
  parent_id,
  count(*) as row_count,
  array_agg(user_id order by created_at asc) as user_ids
from public.profiles
group by parent_id
having count(*) > 1
order by row_count desc, parent_id asc;

-- ------------------------------------------------------------
-- Commented cleanup guidance
-- ------------------------------------------------------------
-- If duplicate profiles exist for the same user_id, keep rn = 1 and review
-- whether child dyads, journal_entries, or reviews reference a duplicate
-- parent_id. Migrate related references before deleting duplicate rows.
--
-- Example review query for one user:
-- select * from public.dyads where user_id = '<USER_ID>' order by parent_id;
-- select * from public.journal_entries where user_id = '<USER_ID>' order by created_at;
--
-- Example migration pattern, after review:
-- update public.dyads
-- set parent_id = '<CANONICAL_PARENT_ID>'
-- where user_id = '<USER_ID>'
--   and parent_id = '<DUPLICATE_PARENT_ID>';
--
-- update public.journal_entries
-- set parent_id = '<CANONICAL_PARENT_ID>'
-- where user_id = '<USER_ID>'
--   and parent_id = '<DUPLICATE_PARENT_ID>';
--
-- Example duplicate profile delete, after backup and reference migration:
-- with ranked as (
--   select
--     user_id,
--     parent_id,
--     row_number() over (partition by user_id order by created_at asc) as rn
--   from public.profiles
-- )
-- delete from public.profiles p
-- using ranked r
-- where p.user_id = r.user_id
--   and p.parent_id = r.parent_id
--   and r.rn > 1;

-- ------------------------------------------------------------
-- Verification queries after cleanup
-- ------------------------------------------------------------
select user_id, count(*) as row_count
from public.profiles
group by user_id
having count(*) > 1;

select parent_id, count(*) as row_count
from public.profiles
group by parent_id
having count(*) > 1;

select count(*) as total_profiles
from public.profiles;
