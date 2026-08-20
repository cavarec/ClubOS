-- ClubOS — policies RLS pour le bucket Storage "documents" (créé via l'API
-- Storage, cf. commande séparée — pas exprimable en SQL pur). Convention de
-- chemin : {tenant_id}/{fichier}, même modèle de droits que la table
-- documents (documents_write_admin, 005_rls_extended.sql) : lecture pour
-- les membres/supervisés du tenant, écriture réservée aux admins.
-- Idempotent (drop policy if exists avant chaque create).

drop policy if exists "documents_storage_select_tenant_member_or_supervisor" on storage.objects;
create policy "documents_storage_select_tenant_member_or_supervisor" on storage.objects
  for select using (
    bucket_id = 'documents'
    and (
      (storage.foldername(name))[1]::uuid = any(auth_jwt_tenant_ids())
      or is_supervised_tenant((storage.foldername(name))[1]::uuid)
    )
  );

-- Même périmètre que "documents_write_admin" (005_rls_extended.sql) :
-- director + club_admin uniquement, pas is_tenant_admin() (qui inclut aussi
-- committee/league/federation_admin) — on garde exactement le même
-- ensemble de rôles que celui déjà appliqué à la table documents.
drop policy if exists "documents_storage_write_admin" on storage.objects;
create policy "documents_storage_write_admin" on storage.objects
  for all using (
    bucket_id = 'documents'
    and exists (
      select 1 from public.memberships m
      where m.tenant_id = (storage.foldername(name))[1]::uuid
        and m.user_id = auth.uid()
        and m.role in ('director', 'club_admin')
    )
  )
  with check (
    bucket_id = 'documents'
    and exists (
      select 1 from public.memberships m
      where m.tenant_id = (storage.foldername(name))[1]::uuid
        and m.user_id = auth.uid()
        and m.role in ('director', 'club_admin')
    )
  );
