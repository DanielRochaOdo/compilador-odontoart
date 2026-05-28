-- 20260528130500_rls_policies.sql
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- user_roles
alter table public.user_roles enable row level security;
drop policy if exists "Admins read roles" on public.user_roles;
drop policy if exists "Users read own role" on public.user_roles;
drop policy if exists "Admins manage roles" on public.user_roles;

create policy "Users read own role"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins manage roles"
on public.user_roles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- catalog_links
alter table public.catalog_links enable row level security;
drop policy if exists "Public read visible links" on public.catalog_links;
drop policy if exists "Admins manage links" on public.catalog_links;

create policy "Public read visible links"
on public.catalog_links
for select
using (is_active = true and is_public = true);

create policy "Admins manage links"
on public.catalog_links
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- user_favorites
alter table public.user_favorites enable row level security;
drop policy if exists "Users read own favorites" on public.user_favorites;
drop policy if exists "Users manage own favorites" on public.user_favorites;

create policy "Users read own favorites"
on public.user_favorites
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users manage own favorites"
on public.user_favorites
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- announcements
alter table public.announcements enable row level security;
drop policy if exists "Users read active announcements" on public.announcements;
drop policy if exists "Admins manage announcements" on public.announcements;

create policy "Users read active announcements"
on public.announcements
for select
using (is_active = true);

create policy "Admins manage announcements"
on public.announcements
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- user_popup_views
alter table public.user_popup_views enable row level security;
drop policy if exists "Users read own popup views" on public.user_popup_views;
drop policy if exists "Users manage own popup views" on public.user_popup_views;

create policy "Users read own popup views"
on public.user_popup_views
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users manage own popup views"
on public.user_popup_views
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- system_settings
alter table public.system_settings enable row level security;
drop policy if exists "Admins manage settings" on public.system_settings;

create policy "Admins manage settings"
on public.system_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
