-- 20260528134000_user_suggestions.sql
create table if not exists public.user_suggestions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text not null,
  description text not null,
  created_at timestamptz not null default now()
);

alter table public.user_suggestions enable row level security;

drop policy if exists "Anon create suggestions" on public.user_suggestions;
drop policy if exists "Admins manage suggestions" on public.user_suggestions;

create policy "Anon create suggestions"
on public.user_suggestions
for insert
to anon, authenticated
with check (true);

create policy "Admins manage suggestions"
on public.user_suggestions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select, insert, update, delete on table public.user_suggestions to authenticated;
grant insert on table public.user_suggestions to anon;
