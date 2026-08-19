-- ===========================================================================
-- ClubOS — corrige la recursion infinie RLS croisee convocations <-> convocation_responses (42P17)
-- ===========================================================================
--
-- La policy de convocation_responses interrogeait convocations, dont la
-- policy interrogeait a son tour convocation_responses -> boucle infinie.
-- Fix : sous-requetes deplacees dans des fonctions SECURITY DEFINER
-- (contournent la RLS pour ces lectures internes), meme pattern que
-- is_tenant_admin.
-- ===========================================================================

create or replace function is_convocation_participant(target_convocation_id uuid) returns boolean as $$
  select exists (
    select 1 from public.convocation_responses
    where convocation_id = target_convocation_id and user_id = auth.uid()
  );
$$ language sql stable security definer set search_path = public, extensions;

create or replace function is_convocation_manager(target_convocation_id uuid) returns boolean as $$
  select exists (
    select 1
    from public.convocations c
    join public.events e on e.id = c.event_id
    join public.teams t on t.id = e.team_id
    join public.memberships m on m.tenant_id = t.tenant_id
    where c.id = target_convocation_id
      and m.user_id = auth.uid()
      and m.role in ('coach', 'director', 'club_admin')
  );
$$ language sql stable security definer set search_path = public, extensions;

drop policy if exists "convocations_select_event_participants" on convocations;
create policy "convocations_select_event_participants" on convocations
  for select using (
    is_convocation_participant(id) or is_convocation_manager(id)
  );

drop policy if exists "convocation_responses_select_own_or_coach" on convocation_responses;
create policy "convocation_responses_select_own_or_coach" on convocation_responses
  for select using (
    user_id = auth.uid() or is_convocation_manager(convocation_id)
  );
