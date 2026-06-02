-- =============================================
-- Way Finder - Profiles table
-- Run this in Supabase SQL Editor
-- =============================================

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  parent_id text unique not null,
  role text not null default 'parent',
  email_verified boolean not null default false,
  verification_token text,
  verification_token_expires_at timestamptz,
  verified_at timestamptz,
  email_sent_at timestamptz,
  email_delivery_provider text,
  verification_email_attempts integer not null default 0,
  verification_email_last_attempt_at timestamptz,
  created_at timestamptz default now()
);

alter table profiles add column if not exists role text not null default 'parent';
alter table profiles add column if not exists email_verified boolean not null default false;
alter table profiles add column if not exists verification_token text;
alter table profiles add column if not exists verification_token_expires_at timestamptz;
alter table profiles add column if not exists verified_at timestamptz;
alter table profiles add column if not exists email_sent_at timestamptz;
alter table profiles add column if not exists email_delivery_provider text;
alter table profiles add column if not exists verification_email_attempts integer not null default 0;
alter table profiles add column if not exists verification_email_last_attempt_at timestamptz;

comment on column profiles.verification_token is 'Stores a SHA-256 hash of the email verification token, never the raw token.';

-- Stable source of truth: exactly one profile row per Supabase auth user.
create unique index if not exists profiles_user_id_unique_idx on profiles(user_id);
create unique index if not exists profiles_parent_id_unique_idx on profiles(parent_id);
create unique index if not exists profiles_verification_token_unique_idx
  on profiles(verification_token)
  where verification_token is not null;

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

drop function if exists public.ensure_profile(text);

create or replace function public.ensure_profile(p_role text default 'parent')
returns table(parent_id text, role text, email_verified boolean, email_sent_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text := coalesce(nullif(p_role, ''), 'parent');
  v_parent_id text;
  v_attempt integer := 0;
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select p.parent_id, p.role, p.email_verified, p.email_sent_at
    into parent_id, role, email_verified, email_sent_at
  from public.profiles p
  where p.user_id = v_user_id
  order by p.created_at asc
  limit 1;

  if found then
    return next;
    return;
  end if;

  loop
    v_attempt := v_attempt + 1;
    v_parent_id := 'P-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 5));

    begin
      insert into public.profiles (user_id, parent_id, role)
      values (v_user_id, v_parent_id, v_role)
      returning profiles.parent_id, profiles.role, profiles.email_verified, profiles.email_sent_at
        into parent_id, role, email_verified, email_sent_at;

      return next;
      return;
    exception
      when unique_violation then
        select p.parent_id, p.role, p.email_verified, p.email_sent_at
          into parent_id, role, email_verified, email_sent_at
        from public.profiles p
        where p.user_id = v_user_id
        order by p.created_at asc
        limit 1;

        if found then
          return next;
          return;
        end if;

        if v_attempt >= 5 then
          raise;
        end if;
    end;
  end loop;
end;
$$;

revoke all on function public.ensure_profile(text) from public;
grant execute on function public.ensure_profile(text) to authenticated;
