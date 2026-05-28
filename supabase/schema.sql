-- Enable UUID helper
create extension if not exists "pgcrypto";

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('admin', 'user')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.catalog_links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  url text not null,
  image_url text,
  icon_name text,
  category text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_public boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  link_id uuid not null references public.catalog_links(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, link_id)
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  is_active boolean not null default true,
  start_at timestamptz,
  end_at timestamptz,
  frequency_type text not null default 'once_per_day' check (frequency_type in ('always', 'once_per_login', 'once_per_day', 'every_x_hours', 'between_dates')),
  frequency_hours int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.user_popup_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  popup_id uuid not null references public.announcements(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  dismissed_at timestamptz,
  unique(user_id, popup_id)
);

create table if not exists public.system_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

alter table public.user_roles enable row level security;
alter table public.catalog_links enable row level security;
alter table public.user_favorites enable row level security;
alter table public.announcements enable row level security;
alter table public.user_popup_views enable row level security;
alter table public.system_settings enable row level security;

create policy "Admins read roles" on public.user_roles for select using (public.is_admin());
create policy "Admins manage roles" on public.user_roles for all using (public.is_admin()) with check (public.is_admin());

create policy "Public read visible links" on public.catalog_links for select using (is_active = true and is_public = true);
create policy "Admins manage links" on public.catalog_links for all using (public.is_admin()) with check (public.is_admin());

create policy "Users read own favorites" on public.user_favorites for select using (auth.uid() = user_id);
create policy "Users manage own favorites" on public.user_favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users read active announcements" on public.announcements for select using (is_active = true);
create policy "Admins manage announcements" on public.announcements for all using (public.is_admin()) with check (public.is_admin());

create policy "Users read own popup views" on public.user_popup_views for select using (auth.uid() = user_id);
create policy "Users manage own popup views" on public.user_popup_views for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Admins manage settings" on public.system_settings for all using (public.is_admin()) with check (public.is_admin());
