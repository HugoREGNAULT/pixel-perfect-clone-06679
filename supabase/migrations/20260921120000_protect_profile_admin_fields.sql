create or replace function public.protect_profile_admin_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE'
     and (new.role is distinct from old.role or new.banned_at is distinct from old.banned_at)
     and not public.is_admin()
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Modification non autorisée';
  end if;
  if tg_op = 'INSERT' and not public.is_admin()
     and coalesce(auth.role(), '') <> 'service_role' then
    new.role := 'user';
  end if;
  return new;
end $$;

drop trigger if exists protect_profile_admin_fields on public.profiles;
create trigger protect_profile_admin_fields
before insert or update on public.profiles
for each row execute function public.protect_profile_admin_fields();
