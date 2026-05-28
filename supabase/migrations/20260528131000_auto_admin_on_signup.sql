-- 20260528131000_auto_admin_on_signup.sql
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role, is_active)
  values (new.id, 'admin', true)
  on conflict (user_id) do update
  set role = 'admin',
      is_active = true;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

-- Sync retroactive users
insert into public.user_roles (user_id, role, is_active)
select id, 'admin', true
from auth.users
on conflict (user_id) do update
set role = 'admin',
    is_active = true;
