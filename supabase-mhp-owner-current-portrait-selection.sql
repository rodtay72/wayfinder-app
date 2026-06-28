-- ============================================================
-- Wayfinder MHP owner current approved portrait selection
-- PR #117 — Explicit selected_at for current approved portrait
-- ============================================================
--
-- Owner-applied only. Run manually in Supabase SQL Editor.
--
-- Purpose:
--   Add owner-only RPC to mark one approved_portrait as the current
--   selected portrait for an MHP, and improve owner list ordering.
--
-- Prerequisites:
--   - supabase-mhp-profile-image-storage.sql (PR #106)
--   - supabase-mhp-owner-publish-contract.sql
--   - supabase-mhp-owner-image-review-rpc.sql (PR #110)
--
-- Does NOT:
--   - expose anon access
--   - write photo_url
--   - publish to parents/clients
--   - delete portrait history rows
--
-- After apply, verify (as owner admin):
--   select * from public.owner_select_mhp_approved_portrait('<approved_image_id>');

-- ---------------------------------------------------------------------------
-- 0. Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regprocedure('public.is_wayfinder_owner_admin()') is null then
    raise exception 'PR117 current portrait selection blocked: is_wayfinder_owner_admin() does not exist.'
      using errcode = 'P0001';
  end if;

  if to_regclass('public.mental_health_professional_profile_images') is null then
    raise exception 'PR117 current portrait selection blocked: mental_health_professional_profile_images does not exist.'
      using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Safe column guard (PR #106 already defines selected_at)
-- ---------------------------------------------------------------------------

alter table public.mental_health_professional_profile_images
  add column if not exists selected_at timestamptz;

-- ---------------------------------------------------------------------------
-- 2. Owner select current approved portrait RPC
-- ---------------------------------------------------------------------------

create or replace function public.owner_select_mhp_approved_portrait(p_image_id uuid)
returns table(
  image_id uuid,
  mhp_user_id uuid,
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
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
begin
  if not public.is_wayfinder_owner_admin() then
    raise exception 'Owner admin required.'
      using errcode = '42501';
  end if;

  select img.user_id
  into target_user_id
  from public.mental_health_professional_profile_images img
  inner join public.profiles p
    on p.user_id = img.user_id
  where img.id = p_image_id
    and img.image_kind = 'approved_portrait'
    and img.image_status = 'approved'
    and p.role = 'counsellor';

  if target_user_id is null then
    raise exception 'Approved portrait not found.'
      using errcode = 'P0002';
  end if;

  update public.mental_health_professional_profile_images
  set selected_at = null
  where user_id = target_user_id
    and image_kind = 'approved_portrait'
    and image_status = 'approved'
    and id <> p_image_id;

  update public.mental_health_professional_profile_images
  set selected_at = now()
  where id = p_image_id;

  return query
  select
    img.id as image_id,
    img.user_id as mhp_user_id,
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
  where img.id = p_image_id;
end;
$$;

revoke all on function public.owner_select_mhp_approved_portrait(uuid) from public;
grant execute on function public.owner_select_mhp_approved_portrait(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Owner list ordering — selected approved portraits first
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
  order by
    case
      when img.image_kind = 'approved_portrait'
        and img.image_status = 'approved'
        and img.selected_at is not null then 0
      else 1
    end,
    img.selected_at desc nulls last,
    img.created_at desc;
end;
$$;

revoke all on function public.owner_list_mhp_profile_images(uuid) from public;
grant execute on function public.owner_list_mhp_profile_images(uuid) to authenticated;

-- ============================================================
-- End of MHP owner current approved portrait selection
-- ============================================================
