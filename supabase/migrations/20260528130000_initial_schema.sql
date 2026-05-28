-- 20260528130000_initial_schema.sql
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

alter table public.user_roles enable row level security;
alter table public.catalog_links enable row level security;
alter table public.user_favorites enable row level security;
alter table public.announcements enable row level security;
alter table public.user_popup_views enable row level security;
alter table public.system_settings enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_catalog_links_updated_at on public.catalog_links;
create trigger trg_catalog_links_updated_at
before update on public.catalog_links
for each row execute function public.set_updated_at();

drop trigger if exists trg_announcements_updated_at on public.announcements;
create trigger trg_announcements_updated_at
before update on public.announcements
for each row execute function public.set_updated_at();

drop trigger if exists trg_system_settings_updated_at on public.system_settings;
create trigger trg_system_settings_updated_at
before update on public.system_settings
for each row execute function public.set_updated_at();
