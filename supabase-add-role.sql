-- Add role column to profiles table
alter table profiles add column if not exists role text not null default 'parent';
