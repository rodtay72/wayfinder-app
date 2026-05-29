-- ============================================================
-- Wayfinder counsellor portal RLS hardening
-- ============================================================
--
-- Run this in the Supabase SQL Editor after supabase-profiles.sql and
-- supabase-schema.sql. It grants verified authenticated users whose
-- profile role is counsellor read-only access to parent journal entries.
--
-- This does not make journal_entries public, does not expose service-role
-- keys, and does not grant counsellors write/delete access to parent data.

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
  );
$$;

revoke all on function public.is_wayfinder_counsellor() from public;
grant execute on function public.is_wayfinder_counsellor() to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'journal_entries'
      and policyname = 'Counsellors can read journal entries'
  ) then
    create policy "Counsellors can read journal entries"
      on public.journal_entries
      for select
      to authenticated
      using (public.is_wayfinder_counsellor());
  end if;
end;
$$;
