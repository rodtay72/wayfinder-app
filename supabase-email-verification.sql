-- ============================================================
-- Wayfinder custom email verification migration
-- ============================================================
--
-- Run after supabase-profiles.sql and supabase-schema.sql.
-- The verification_token column stores a SHA-256 hash, not the raw token.

alter table public.profiles add column if not exists email_verified boolean not null default false;
alter table public.profiles add column if not exists verification_token text;
alter table public.profiles add column if not exists verification_token_expires_at timestamptz;
alter table public.profiles add column if not exists verified_at timestamptz;
alter table public.profiles add column if not exists email_sent_at timestamptz;
alter table public.profiles add column if not exists email_delivery_provider text;
alter table public.profiles add column if not exists verification_email_attempts integer not null default 0;
alter table public.profiles add column if not exists verification_email_last_attempt_at timestamptz;

comment on column public.profiles.verification_token is
  'Stores a SHA-256 hash of the email verification token, never the raw token.';

create unique index if not exists profiles_verification_token_unique_idx
  on public.profiles(verification_token)
  where verification_token is not null;

-- Replace ensure_profile because its return type now includes the app-level
-- verification state needed by the browser gate.
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
      insert into public.profiles (user_id, parent_id, role, email_verified)
      values (v_user_id, v_parent_id, v_role, false)
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

-- Token hashes, expiry values, attempts, and delivery metadata are admin-only.
-- Browser profile updates are restricted to non-verification profile cache fields.
revoke select on table public.profiles from public, anon, authenticated;
revoke update on table public.profiles from public, anon, authenticated;

do $$
declare
  select_cols text;
  update_cols text;
begin
  select string_agg(quote_ident(column_name), ', ' order by column_name)
    into select_cols
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'profiles'
    and column_name in (
      'user_id',
      'parent_id',
      'role',
      'created_at',
      'email_verified',
      'email_sent_at',
      'disc_image_url',
      'disc_bars',
      'insight_text',
      'insight_generated_at',
      'insight_entry_count',
      'insight_latest_entry_at'
    );

  if select_cols is not null then
    execute format('grant select (%s) on table public.profiles to authenticated', select_cols);
  end if;

  select string_agg(quote_ident(column_name), ', ' order by column_name)
    into update_cols
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'profiles'
    and column_name in (
      'disc_image_url',
      'disc_bars',
      'insight_text',
      'insight_generated_at',
      'insight_entry_count',
      'insight_latest_entry_at'
    );

  if update_cols is not null then
    execute format('grant update (%s) on table public.profiles to authenticated', update_cols);
  end if;
end;
$$;

create or replace function public.is_wayfinder_verified_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.email_verified is true
  );
$$;

revoke all on function public.is_wayfinder_verified_user() from public;
grant execute on function public.is_wayfinder_verified_user() to authenticated;

create or replace function public.is_wayfinder_counsellor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'counsellor'
      and p.email_verified is true
  );
$$;

revoke all on function public.is_wayfinder_counsellor() from public;
grant execute on function public.is_wayfinder_counsellor() to authenticated;

drop policy if exists "Users manage own dyads" on public.dyads;
create policy "Users manage own dyads"
  on public.dyads for all
  to authenticated
  using (auth.uid() = user_id and public.is_wayfinder_verified_user())
  with check (auth.uid() = user_id and public.is_wayfinder_verified_user());

drop policy if exists "Users manage own entries" on public.journal_entries;
create policy "Users manage own entries"
  on public.journal_entries for all
  to authenticated
  using (auth.uid() = user_id and public.is_wayfinder_verified_user())
  with check (auth.uid() = user_id and public.is_wayfinder_verified_user());

drop policy if exists "Users manage own reviews" on public.reviews;
create policy "Users manage own reviews"
  on public.reviews for all
  to authenticated
  using (auth.uid() = user_id and public.is_wayfinder_verified_user())
  with check (auth.uid() = user_id and public.is_wayfinder_verified_user());

drop policy if exists "Counsellors can read journal entries" on public.journal_entries;
create policy "Counsellors can read journal entries"
  on public.journal_entries
  for select
  to authenticated
  using (public.is_wayfinder_counsellor());
