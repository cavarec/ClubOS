-- ClubOS — plomberie onboarding : création de profil à l'inscription,
-- création de club atomique.

-- ---------------------------------------------------------------------------
-- Auto-création de `profiles` à l'inscription (auth.users -> public.profiles)
-- ---------------------------------------------------------------------------
-- Sans ce trigger, aucune ligne `profiles` n'existe pour un nouvel utilisateur
-- et tout insert dans `memberships` (qui référence profiles.id) échoue avec
-- une violation de clé étrangère.

create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Création de club atomique (tenant + membership admin en une transaction)
-- ---------------------------------------------------------------------------
-- Deux inserts séparés depuis la route API (tenant puis membership) peuvent
-- laisser un tenant orphelin si le second échoue (slug alors définitivement
-- "pris" sans admin capable d'y accéder). Cette fonction garantit l'atomicité.

create or replace function public.create_club_with_admin(
  p_name text,
  p_slug text,
  p_sport_id uuid,
  p_user_id uuid
) returns public.tenants as $$
declare
  v_tenant public.tenants;
begin
  insert into public.tenants (type, name, slug, sport_id)
  values ('club', p_name, p_slug, p_sport_id)
  returning * into v_tenant;

  insert into public.memberships (tenant_id, user_id, role)
  values (v_tenant.id, p_user_id, 'club_admin');

  return v_tenant;
end;
$$ language plpgsql security definer set search_path = '';

grant execute on function public.create_club_with_admin(text, text, uuid, uuid) to authenticated;
