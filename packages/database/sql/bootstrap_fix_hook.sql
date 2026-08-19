-- ===========================================================================
-- ClubOS — correction du hook custom_access_token_hook
-- ===========================================================================
--
-- Le hook etait bien enregistre mais plantait a l'execution ("Error running
-- hook URI: pg-functions://postgres/public/custom_access_token_hook"), car
-- il tourne avec les droits de `supabase_auth_admin`, qui n'a ni acces direct
-- a `memberships` ni de quoi passer les policies RLS dessus.
--
-- Correction : SECURITY DEFINER (la fonction tourne avec les droits de son
-- proprietaire postgres, qui contourne la RLS sur ses propres tables) +
-- references de table qualifiees (necessaire avec search_path vide).
-- ===========================================================================

create or replace function custom_access_token_hook(event jsonb) returns jsonb as $$
declare
  claims jsonb;
  uid uuid := (event ->> 'user_id')::uuid;
  tenant_ids uuid[];
  supervisor_tenant_ids uuid[];
begin
  select coalesce(array_agg(m.tenant_id), '{}') into tenant_ids
  from public.memberships m
  where m.user_id = uid and m.status = 'active';

  select coalesce(array_agg(m.tenant_id), '{}') into supervisor_tenant_ids
  from public.memberships m
  where m.user_id = uid
    and m.status = 'active'
    and m.role in ('committee_admin', 'league_admin', 'federation_admin');

  claims := coalesce(event -> 'claims', '{}'::jsonb);
  claims := jsonb_set(claims, '{app_metadata,tenant_ids}', to_jsonb(tenant_ids));
  claims := jsonb_set(claims, '{app_metadata,supervisor_tenant_ids}', to_jsonb(supervisor_tenant_ids));

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$ language plpgsql stable security definer set search_path = '';
