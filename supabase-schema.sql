-- =============================================
-- Way Finder / Parenting-EQ - Supabase Schema
-- Paste this into Supabase SQL Editor and run it
-- =============================================

-- Table: dyads (parent-child configurations)
create table if not exists dyads (
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id text not null,
  data jsonb not null default '{}',
  created_at timestamptz default now(),
  primary key (user_id, parent_id)
);

-- Table: journal_entries (parent reflections)
create table if not exists journal_entries (
  id bigint primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id text not null,
  data jsonb not null default '{}',
  created_at timestamptz default now()
);

-- Table: reviews (counsellor notes per entry)
create table if not exists reviews (
  entry_id bigint primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}',
  created_at timestamptz default now()
);

-- Enable Row Level Security on all tables
alter table dyads enable row level security;
alter table journal_entries enable row level security;
alter table reviews enable row level security;

-- RLS policies: users can only access their own data
create policy "Users manage own dyads"
  on dyads for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own entries"
  on journal_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own reviews"
  on reviews for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
