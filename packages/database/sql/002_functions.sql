-- ClubOS — hook Supabase Auth : enrichit le JWT avec tenant_ids / supervisor_tenant_ids / roles
-- À enregistrer comme "Custom Access Token Hook" dans Supabase Dashboard > Authentication > Hooks.

create or replace function custom_access_token_hook(event jsonb) returns jsonb as $$
declare
  claims jsonb;
  uid uuid := (event ->> 'user_id')::uuid;
  tenant_ids uuid[];
  supervisor_tenant_ids uuid[];
begin
  select coalesce(array_agg(m.tenant_id), '{}') into tenant_ids
  from memberships m
  where m.user_id = uid and m.status = 'active';

  select coalesce(array_agg(m.tenant_id), '{}') into supervisor_tenant_ids
  from memberships m
  where m.user_id = uid
    and m.status = 'active'
    and m.role in ('committee_admin', 'league_admin', 'federation_admin');

  claims := event -> 'claims';
  claims := jsonb_set(claims, '{app_metadata,tenant_ids}', to_jsonb(tenant_ids));
  claims := jsonb_set(claims, '{app_metadata,supervisor_tenant_ids}', to_jsonb(supervisor_tenant_ids));

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$ language plpgsql stable;

-- Le rôle `supabase_auth_admin` doit pouvoir exécuter ce hook (requis par Supabase)
grant execute on function custom_access_token_hook(jsonb) to supabase_auth_admin;
grant usage on schema public to supabase_auth_admin;
revoke execute on function custom_access_token_hook(jsonb) from authenticated, anon, public;
