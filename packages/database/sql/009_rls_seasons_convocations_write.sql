-- ClubOS — deux trous RLS qui bloquaient toute la chaîne de création
-- (équipe → événement → convocation) :
-- 1. "seasons" n'avait aucune policy (RLS pas activée du tout).
-- 2. "convocations"/"convocation_responses" n'avaient que des policies de
--    lecture — même un coach/admin ne pouvait pas créer de convocation,
--    ce qui explique qu'aucune UI de convocation n'ait jamais pu écrire.
-- Idempotent (drop policy if exists avant chaque create).

alter table seasons enable row level security;

drop policy if exists "seasons_select_tenant_member_or_supervisor" on seasons;
create policy "seasons_select_tenant_member_or_supervisor" on seasons
  for select using (
    tenant_id = any(auth_jwt_tenant_ids())
    or is_supervised_tenant(tenant_id)
  );

drop policy if exists "seasons_write_admin" on seasons;
create policy "seasons_write_admin" on seasons
  for all using (is_tenant_admin(tenant_id));

-- is_convocation_manager() (001_init.sql) suppose une convocation déjà
-- existante (jointure depuis convocations.id) — inutilisable pour le WITH
-- CHECK d'un insert où la ligne n'existe pas encore. Variante basée sur
-- event_id, présent dès l'insert.
create or replace function is_event_manager(target_event_id uuid) returns boolean as $$
  select exists (
    select 1
    from public.events e
    join public.teams t on t.id = e.team_id
    join public.memberships m on m.tenant_id = t.tenant_id
    where e.id = target_event_id
      and m.user_id = auth.uid()
      and m.role in ('coach', 'director', 'club_admin')
  );
$$ language sql stable security definer set search_path = public, extensions;

drop policy if exists "convocations_write_manager" on convocations;
create policy "convocations_write_manager" on convocations
  for all using (is_event_manager(event_id))
  with check (is_event_manager(event_id));

drop policy if exists "convocation_responses_insert_manager" on convocation_responses;
create policy "convocation_responses_insert_manager" on convocation_responses
  for insert with check (is_convocation_manager(convocation_id));

drop policy if exists "convocation_responses_delete_manager" on convocation_responses;
create policy "convocation_responses_delete_manager" on convocation_responses
  for delete using (is_convocation_manager(convocation_id));
