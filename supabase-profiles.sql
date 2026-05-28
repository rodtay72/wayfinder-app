-- =============================================
-- Way Finder - Profiles table
-- Run this in Supabase SQL Editor
-- =============================================

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  parent_id text unique not null,
  role text not null default 'parent',
  created_at timestamptz default now()
);

alter table profiles add column if not exists role text not null default 'parent';

-- Stable source of truth: exactly one profile row per Supabase auth user.
create unique index if not exists profiles_user_id_unique_idx on profiles(user_id);
create unique index if not exists profiles_parent_id_unique_idx on profiles(parent_id);

alter table profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users manage own profile'
  ) then
    create policy "Users manage own profile"
      on profiles for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end;
$$;