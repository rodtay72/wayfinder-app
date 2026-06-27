-- ============================================================
-- Wayfinder MHP owner admin image review RPC
-- PR #110 — Owner admin source photo review preview
-- ============================================================
--
-- Owner-applied only. Run manually in Supabase SQL Editor.
--
-- Purpose:
--   Add owner-only list RPC for private MHP profile image metadata
--   during admin review at /admin.html.
--
-- Prerequisites:
--   - supabase-mhp-owner-publish-contract.sql (owner_admin_users,
--     is_wayfinder_owner_admin)
--   - supabase-mhp-profile-image-storage.sql
--     (mental_health_professional_profile_images)
--   - supabase-mhp-profile-image-upload-policies.sql
--     (owner admin read on professional-profile-image-sources)
--
-- This PR does NOT:
--   - expose anon access
--   - return signed URLs, auth emails, invite tokens, or journal data
--   - approve, publish, or promote images
--   - change photo_url or public profile display
--
-- After apply, verify (as owner admin):
--   select * from public.owner_list_mhp_profile_images(null);
--   select * from public.owner_list_mhp_profile_images('<mhp_user_id>');

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regprocedure('public.is_wayfinder_owner_admin()') is null then
    raise exception 'MHP owner image review RPC blocked: is_wayfinder_owner_admin() does not exist. Apply supabase-mhp-owner-publish-contract.sql first.'
      using errcode = 'P0001';
  end if;

  if to_regclass('public.mental_health_professional_profile_images') is null then
    raise exception 'MHP owner image review RPC blocked: mental_health_professional_profile_images does not exist. Apply supabase-mhp-profile-image-storage.sql first.'
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Owner MHP profile image metadata list RPC
-- ---------------------------------------------------------------------------

create or replace function public.owner_list_mhp_profile_images(p_mhp_user_id uuid default null)
returns table(
  image_id uuid,
  mhp_user_id uuid,
  wayfinder_id text,
  full_name text,
  image_kind text,
  image_status text,
  storage_bucket text,
  storage_path text,
  mime_type text,
  file_size_bytes bigint,
  portrait_style text,
  created_at timestamptz,
  selected_at timestamptz,
  approved_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_wayfinder_owner_admin() then
    raise exception 'Owner admin required.'
      using errcode = '42501';
  end if;

  return query
  select
    img.id as image_id,
    p.user_id as mhp_user_id,
    p.parent_id as wayfinder_id,
    nullif(trim(mhp.full_name), '') as full_name,
    img.image_kind,
    img.image_status,
    img.storage_bucket,
    img.storage_path,
    img.mime_type,
    img.file_size_bytes,
    img.portrait_style,
    img.created_at,
    img.selected_at,
    img.approved_at
  from public.mental_health_professional_profile_images img
  inner join public.profiles p
    on p.user_id = img.user_id
  inner join public.mental_health_professional_profiles mhp
    on mhp.user_id = p.user_id
  where p.role = 'counsellor'
    and (p_mhp_user_id is null or p.user_id = p_mhp_user_id)
  order by img.created_at desc;
end;
$$;

revoke all on function public.owner_list_mhp_profile_images(uuid) from public;
grant execute on function public.owner_list_mhp_profile_images(uuid) to authenticated;

-- ============================================================
-- End of MHP owner admin image review RPC
-- ============================================================
