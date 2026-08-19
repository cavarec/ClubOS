-- ===========================================================================
-- ClubOS — correction search_path sur les fonctions de 001_init.sql
-- ===========================================================================
--
-- create_club_with_admin (SECURITY DEFINER, search_path = '') declenche le
-- trigger tenants_set_path() lors de l'insert dans tenants. En PL/pgSQL, une
-- fonction sans son propre SET search_path herite du search_path actif au
-- moment de l'appel -- donc herite du search_path vide de la fonction
-- appelante, et ne trouve plus le type "ltree". Meme risque pour les
-- fonctions RLS (auth_jwt_tenant_ids, is_supervised_tenant, ...) si jamais
-- appelees depuis un contexte similaire. Fix : chaque fonction fixe son
-- propre search_path, independant de l'appelant.
-- ===========================================================================

create or replace function tenants_set_path() returns trigger as $$
declare
  parent_path ltree;
begin
  if new.parent_id is null then
    new.path := text2ltree(replace(new.id::text, '-', '_'));
  else
    select path into parent_path from public.tenants where id = new.parent_id;
    new.path := parent_path || text2ltree(replace(new.id::text, '-', '_'));
  end if;
  return new;
end;
$$ language plpgsql set search_path = public, extensions;

create or replace function auth_jwt_tenant_ids() returns uuid[] as $$
  select coalesce(
    array(select jsonb_array_elements_text(auth.jwt() -> 'app_metadata' -> 'tenant_ids'))::uuid[],
    '{}'::uuid[]
  );
$$ language sql stable set search_path = public, extensions;

create or replace function auth_jwt_supervisor_tenant_ids() returns uuid[] as $$
  select coalesce(
    array(select jsonb_array_elements_text(auth.jwt() -> 'app_metadata' -> 'supervisor_tenant_ids'))::uuid[],
    '{}'::uuid[]
  );
$$ language sql stable set search_path = public, extensions;

create or replace function is_supervised_tenant(target_tenant_id uuid) returns boolean as $$
  select exists (
    select 1
    from public.tenants supervised
    join public.tenants target on target.id = target_tenant_id
    where supervised.id = any(public.auth_jwt_supervisor_tenant_ids())
      and target.path <@ supervised.path
  );
$$ language sql stable set search_path = public, extensions;
