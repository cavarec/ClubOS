-- ClubOS — policies RLS manquantes pour les pages MVP rebranchées sur de
-- vraies données : team_members, presences (RLS activée sans policy dans
-- 001_init.sql → tout accès bloqué), posts, documents (RLS pas activée du
-- tout → aucune isolation multi-tenant, n'importe quel authenticated
-- pouvait lire/écrire les lignes de n'importe quel club).

-- ---------------------------------------------------------------------------
-- RLS : team_members
-- ---------------------------------------------------------------------------

alter table team_members enable row level security;

create policy "team_members_select_tenant_member_or_supervisor" on team_members
  for select using (
    exists (
      select 1 from teams t
      where t.id = team_members.team_id
        and (t.tenant_id = any(auth_jwt_tenant_ids()) or is_supervised_tenant(t.tenant_id))
    )
  );

create policy "team_members_write_coach_or_admin" on team_members
  for all using (
    exists (
      select 1 from teams t
      join memberships m on m.tenant_id = t.tenant_id
      where t.id = team_members.team_id
        and m.user_id = auth.uid()
        and m.role in ('coach', 'director', 'club_admin')
    )
  );

-- ---------------------------------------------------------------------------
-- RLS : presences (table déjà en RLS depuis 001_init.sql, policies manquantes)
-- ---------------------------------------------------------------------------

create policy "presences_select_own_or_coach" on presences
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from events e
      join teams t on t.id = e.team_id
      join memberships m on m.tenant_id = t.tenant_id
      where e.id = presences.event_id
        and m.user_id = auth.uid()
        and m.role in ('coach', 'director', 'club_admin')
    )
  );

create policy "presences_write_coach_or_admin" on presences
  for all using (
    exists (
      select 1 from events e
      join teams t on t.id = e.team_id
      join memberships m on m.tenant_id = t.tenant_id
      where e.id = presences.event_id
        and m.user_id = auth.uid()
        and m.role in ('coach', 'director', 'club_admin')
    )
  );

-- ---------------------------------------------------------------------------
-- RLS : posts (communication)
-- ---------------------------------------------------------------------------

alter table posts enable row level security;

create policy "posts_select_tenant_member_or_supervisor" on posts
  for select using (
    tenant_id = any(auth_jwt_tenant_ids())
    or is_supervised_tenant(tenant_id)
  );

create policy "posts_write_coach_or_admin" on posts
  for all using (
    exists (
      select 1 from memberships m
      where m.tenant_id = posts.tenant_id
        and m.user_id = auth.uid()
        and m.role in ('coach', 'director', 'club_admin')
    )
  );

-- ---------------------------------------------------------------------------
-- RLS : documents
-- ---------------------------------------------------------------------------

alter table documents enable row level security;

create policy "documents_select_owner_or_admin" on documents
  for select using (
    owner_user_id = auth.uid()
    or exists (
      select 1 from memberships m
      where m.tenant_id = documents.tenant_id
        and m.user_id = auth.uid()
        and m.role in ('director', 'club_admin')
    )
  );

create policy "documents_write_admin" on documents
  for all using (
    exists (
      select 1 from memberships m
      where m.tenant_id = documents.tenant_id
        and m.user_id = auth.uid()
        and m.role in ('director', 'club_admin')
    )
  );
