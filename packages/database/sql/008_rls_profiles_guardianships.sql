-- ClubOS — RLS manquante sur profiles et guardianships. Aucune des deux
-- tables n'avait de policy : n'importe quel utilisateur authentifié pouvait
-- lire/modifier le nom, téléphone, date de naissance de n'importe quel
-- profil, tous clubs confondus (données personnelles, dont celles de
-- mineurs). Idempotent (drop policy if exists avant chaque create).

alter table profiles enable row level security;

drop policy if exists "profiles_select_shared_tenant_or_self" on profiles;
create policy "profiles_select_shared_tenant_or_self" on profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1 from memberships m1
      join memberships m2 on m2.tenant_id = m1.tenant_id
      where m1.user_id = auth.uid() and m2.user_id = profiles.id
    )
    or exists (
      select 1 from memberships m
      where m.user_id = profiles.id and is_supervised_tenant(m.tenant_id)
    )
  );

drop policy if exists "profiles_update_self_or_tenant_admin" on profiles;
create policy "profiles_update_self_or_tenant_admin" on profiles
  for update using (
    id = auth.uid()
    or exists (
      select 1 from memberships m
      where m.user_id = profiles.id
        and is_tenant_admin(m.tenant_id)
    )
  );

alter table guardianships enable row level security;

drop policy if exists "guardianships_select_own_or_admin" on guardianships;
create policy "guardianships_select_own_or_admin" on guardianships
  for select using (
    guardian_id = auth.uid()
    or child_id = auth.uid()
    or exists (
      select 1 from memberships m
      where m.user_id = guardianships.child_id
        and is_tenant_admin(m.tenant_id)
    )
  );

drop policy if exists "guardianships_write_tenant_admin" on guardianships;
create policy "guardianships_write_tenant_admin" on guardianships
  for all using (
    exists (
      select 1 from memberships m
      where m.user_id = guardianships.child_id
        and is_tenant_admin(m.tenant_id)
    )
  );
