-- =============================================
-- Way Finder - Add profiles table
-- Run this in Supabase SQL Editor
-- =============================================

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  parent_id text unique not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users manage own profile"
  on profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
