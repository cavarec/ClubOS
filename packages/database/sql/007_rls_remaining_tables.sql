-- ClubOS — policies RLS manquantes pour les tables restantes du schéma
-- initial (sponsors, products, orders, installments, site_pages,
-- site_settings, volunteer_*, carpools, chat_messages, push_tokens,
-- notifications, licenses, federation_*, consents, data_requests).
-- Aucune de ces tables n'avait RLS activé : accès total inter-tenant pour
-- tout utilisateur authentifié (mêmes symptômes que 005_rls_extended.sql).

-- ---------------------------------------------------------------------------
-- Partenaires
-- ---------------------------------------------------------------------------

alter table sponsors enable row level security;

drop policy if exists "sponsors_select_tenant_member_or_supervisor" on sponsors;
create policy "sponsors_select_tenant_member_or_supervisor" on sponsors
  for select using (
    tenant_id = any(auth_jwt_tenant_ids())
    or is_supervised_tenant(tenant_id)
  );

drop policy if exists "sponsors_write_admin" on sponsors;
create policy "sponsors_write_admin" on sponsors
  for all using (is_tenant_admin(tenant_id));

-- ---------------------------------------------------------------------------
-- Paiements & boutique
-- ---------------------------------------------------------------------------

alter table products enable row level security;

drop policy if exists "products_select_tenant_member_or_supervisor" on products;
create policy "products_select_tenant_member_or_supervisor" on products
  for select using (
    tenant_id = any(auth_jwt_tenant_ids())
    or is_supervised_tenant(tenant_id)
  );

drop policy if exists "products_write_admin" on products;
create policy "products_write_admin" on products
  for all using (is_tenant_admin(tenant_id));

alter table orders enable row level security;

drop policy if exists "orders_select_own_or_admin" on orders;
create policy "orders_select_own_or_admin" on orders
  for select using (
    user_id = auth.uid()
    or is_tenant_admin(tenant_id)
  );

drop policy if exists "orders_insert_own" on orders;
create policy "orders_insert_own" on orders
  for insert with check (
    user_id = auth.uid()
    and tenant_id = any(auth_jwt_tenant_ids())
  );

drop policy if exists "orders_update_admin" on orders;
create policy "orders_update_admin" on orders
  for update using (is_tenant_admin(tenant_id));

alter table installments enable row level security;

drop policy if exists "installments_select_own_or_admin" on installments;
create policy "installments_select_own_or_admin" on installments
  for select using (
    exists (
      select 1 from orders o
      where o.id = installments.order_id
        and (o.user_id = auth.uid() or is_tenant_admin(o.tenant_id))
    )
  );

drop policy if exists "installments_write_admin" on installments;
create policy "installments_write_admin" on installments
  for all using (
    exists (
      select 1 from orders o
      where o.id = installments.order_id
        and is_tenant_admin(o.tenant_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Site public
-- ---------------------------------------------------------------------------

-- La policy "tenants_select_member_or_supervisor" (001_init.sql) bloque la
-- lecture anonyme de la table tenants brute (elle contient stripe_account_id,
-- siret, address) — cf. son commentaire "lecture publique... via une vue
-- dédiée, pas la table brute". Vue non-RLS (security_invoker=false, exécutée
-- avec les droits du propriétaire) exposant uniquement les champs vitrine.
create or replace view public.tenants_public
  with (security_invoker = false) as
  select id, name, slug, logo_url from public.tenants;

grant select on public.tenants_public to anon, authenticated;

alter table site_pages enable row level security;

-- Contenu vitrine, non sensible : lecture publique (site public sans auth),
-- écriture réservée aux admins du club.
drop policy if exists "site_pages_select_public" on site_pages;
create policy "site_pages_select_public" on site_pages
  for select using (true);

drop policy if exists "site_pages_write_admin" on site_pages;
create policy "site_pages_write_admin" on site_pages
  for all using (is_tenant_admin(tenant_id));

alter table site_settings enable row level security;

drop policy if exists "site_settings_select_public" on site_settings;
create policy "site_settings_select_public" on site_settings
  for select using (true);

drop policy if exists "site_settings_write_admin" on site_settings;
create policy "site_settings_write_admin" on site_settings
  for all using (is_tenant_admin(tenant_id));

-- ---------------------------------------------------------------------------
-- Bénévolat
-- ---------------------------------------------------------------------------

alter table volunteer_missions enable row level security;

drop policy if exists "volunteer_missions_select_tenant_member_or_supervisor" on volunteer_missions;
create policy "volunteer_missions_select_tenant_member_or_supervisor" on volunteer_missions
  for select using (
    tenant_id = any(auth_jwt_tenant_ids())
    or is_supervised_tenant(tenant_id)
  );

drop policy if exists "volunteer_missions_write_admin" on volunteer_missions;
create policy "volunteer_missions_write_admin" on volunteer_missions
  for all using (is_tenant_admin(tenant_id));

alter table volunteer_assignments enable row level security;

drop policy if exists "volunteer_assignments_select_own_or_admin" on volunteer_assignments;
create policy "volunteer_assignments_select_own_or_admin" on volunteer_assignments
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from volunteer_missions vm
      where vm.id = volunteer_assignments.mission_id
        and is_tenant_admin(vm.tenant_id)
    )
  );

drop policy if exists "volunteer_assignments_insert_own" on volunteer_assignments;
create policy "volunteer_assignments_insert_own" on volunteer_assignments
  for insert with check (user_id = auth.uid());

drop policy if exists "volunteer_assignments_delete_own_or_admin" on volunteer_assignments;
create policy "volunteer_assignments_delete_own_or_admin" on volunteer_assignments
  for delete using (
    user_id = auth.uid()
    or exists (
      select 1 from volunteer_missions vm
      where vm.id = volunteer_assignments.mission_id
        and is_tenant_admin(vm.tenant_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Covoiturage
-- ---------------------------------------------------------------------------

alter table carpools enable row level security;

drop policy if exists "carpools_select_tenant_member" on carpools;
create policy "carpools_select_tenant_member" on carpools
  for select using (
    exists (
      select 1 from events e
      join teams t on t.id = e.team_id
      where e.id = carpools.event_id
        and (t.tenant_id = any(auth_jwt_tenant_ids()) or is_supervised_tenant(t.tenant_id))
    )
  );

drop policy if exists "carpools_write_own_or_admin" on carpools;
create policy "carpools_write_own_or_admin" on carpools
  for all using (
    driver_id = auth.uid()
    or exists (
      select 1 from events e
      join teams t on t.id = e.team_id
      where e.id = carpools.event_id
        and is_tenant_admin(t.tenant_id)
    )
  );

alter table carpool_bookings enable row level security;

drop policy if exists "carpool_bookings_select_own_or_driver_or_admin" on carpool_bookings;
create policy "carpool_bookings_select_own_or_driver_or_admin" on carpool_bookings
  for select using (
    passenger_id = auth.uid()
    or exists (
      select 1 from carpools c
      join events e on e.id = c.event_id
      join teams t on t.id = e.team_id
      where c.id = carpool_bookings.carpool_id
        and (c.driver_id = auth.uid() or is_tenant_admin(t.tenant_id))
    )
  );

drop policy if exists "carpool_bookings_insert_own" on carpool_bookings;
create policy "carpool_bookings_insert_own" on carpool_bookings
  for insert with check (passenger_id = auth.uid());

drop policy if exists "carpool_bookings_delete_own_or_driver" on carpool_bookings;
create policy "carpool_bookings_delete_own_or_driver" on carpool_bookings
  for delete using (
    passenger_id = auth.uid()
    or exists (
      select 1 from carpools c
      where c.id = carpool_bookings.carpool_id
        and c.driver_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Chat d'équipe
-- ---------------------------------------------------------------------------

alter table chat_messages enable row level security;

drop policy if exists "chat_messages_select_team_member" on chat_messages;
create policy "chat_messages_select_team_member" on chat_messages
  for select using (
    exists (
      select 1 from team_members tm
      where tm.team_id = chat_messages.team_id
        and tm.user_id = auth.uid()
    )
  );

drop policy if exists "chat_messages_insert_team_member" on chat_messages;
create policy "chat_messages_insert_team_member" on chat_messages
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1 from team_members tm
      where tm.team_id = chat_messages.team_id
        and tm.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Notifications & push
-- ---------------------------------------------------------------------------

alter table push_tokens enable row level security;

drop policy if exists "push_tokens_own" on push_tokens;
create policy "push_tokens_own" on push_tokens
  for all using (user_id = auth.uid());

alter table notifications enable row level security;

drop policy if exists "notifications_select_own" on notifications;
create policy "notifications_select_own" on notifications
  for select using (user_id = auth.uid());

-- Marquage lu uniquement : les notifications sont créées côté serveur
-- (service role, hors RLS), jamais par le client.
drop policy if exists "notifications_update_own_read" on notifications;
create policy "notifications_update_own_read" on notifications
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Licences & connecteurs fédération
-- ---------------------------------------------------------------------------

alter table licenses enable row level security;

drop policy if exists "licenses_select_tenant_member_or_supervisor" on licenses;
create policy "licenses_select_tenant_member_or_supervisor" on licenses
  for select using (
    tenant_id = any(auth_jwt_tenant_ids())
    or is_supervised_tenant(tenant_id)
  );

drop policy if exists "licenses_write_admin" on licenses;
create policy "licenses_write_admin" on licenses
  for all using (is_tenant_admin(tenant_id));

alter table federation_connectors enable row level security;

drop policy if exists "federation_connectors_admin_only" on federation_connectors;
create policy "federation_connectors_admin_only" on federation_connectors
  for all using (is_tenant_admin(tenant_id));

alter table federation_sync_logs enable row level security;

drop policy if exists "federation_sync_logs_admin_only" on federation_sync_logs;
create policy "federation_sync_logs_admin_only" on federation_sync_logs
  for select using (
    exists (
      select 1 from federation_connectors fc
      where fc.id = federation_sync_logs.connector_id
        and is_tenant_admin(fc.tenant_id)
    )
  );

-- ---------------------------------------------------------------------------
-- RGPD
-- ---------------------------------------------------------------------------

alter table consents enable row level security;

drop policy if exists "consents_own" on consents;
create policy "consents_own" on consents
  for all using (user_id = auth.uid());

alter table data_requests enable row level security;

drop policy if exists "data_requests_select_own" on data_requests;
create policy "data_requests_select_own" on data_requests
  for select using (user_id = auth.uid());

drop policy if exists "data_requests_insert_own" on data_requests;
create policy "data_requests_insert_own" on data_requests
  for insert with check (user_id = auth.uid());
