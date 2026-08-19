-- ===========================================================================
-- ClubOS — corrige la recursion infinie RLS sur memberships (erreur 42P17)
-- ===========================================================================
--
-- memberships_write_tenant_admin interrogeait memberships depuis sa propre
-- policy -> chaque evaluation de la policy redeclenchait son evaluation sur
-- la sous-requete, a l'infini. Fix : sous-requete deplacee dans une fonction
-- SECURITY DEFINER (contourne la RLS pour cette lecture interne, comme
-- create_club_with_admin / custom_access_token_hook).
-- ===========================================================================

create or replace function is_tenant_admin(target_tenant_id uuid) returns boolean as $$
  select exists (
    select 1 from public.memberships
    where tenant_id = target_tenant_id
      and user_id = auth.uid()
      and role in ('club_admin', 'committee_admin', 'league_admin', 'federation_admin')
  );
$$ language sql stable security definer set search_path = public, extensions;

drop policy if exists "memberships_write_tenant_admin" on memberships;
create policy "memberships_write_tenant_admin" on memberships
  for all using (is_tenant_admin(tenant_id));
