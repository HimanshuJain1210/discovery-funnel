-- Run in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run: uses "if not exists" and drops policies before recreating.

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'My discovery project',
  state jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If you ran v1 before, add the new column:
alter table projects add column if not exists is_public boolean not null default false;

alter table projects enable row level security;

drop policy if exists "own_select" on projects;
drop policy if exists "own_insert" on projects;
drop policy if exists "own_update" on projects;
drop policy if exists "own_delete" on projects;
drop policy if exists "public_read" on projects;

-- Owners can do everything with their own rows.
create policy "own_select" on projects for select using (auth.uid() = user_id);
create policy "own_insert" on projects for insert with check (auth.uid() = user_id);
create policy "own_update" on projects for update using (auth.uid() = user_id);
create policy "own_delete" on projects for delete using (auth.uid() = user_id);

-- ANYONE (including anonymous visitors) can read a row ONLY if it's marked public.
-- This powers the /share/:id read-only links.
create policy "public_read" on projects for select using (is_public = true);
