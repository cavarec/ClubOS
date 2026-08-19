-- ClubOS — initialisation : extensions, colonne de hiérarchie, RLS
-- Prérequis : `prisma migrate deploy` a déjà créé les tables (schema.prisma).
-- Ce script ajoute ce que Prisma ne sait pas exprimer : extensions, type ltree,
-- policies RLS. Idempotent (IF NOT EXISTS / OR REPLACE partout).

create extension if not exists pgcrypto;
create extension if not exists ltree;

-- ---------------------------------------------------------------------------
-- Hiérarchie matérialisée des tenants (fédération > ligue > comité > club)
-- ---------------------------------------------------------------------------

alter table tenants add column if not exists path ltree;

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

drop trigger if exists trg_tenants_set_path on tenants;
create trigger trg_tenants_set_path
  before insert or update of parent_id on tenants
  for each row execute function tenants_set_path();

create index if not exists tenants_path_gist_idx on tenants using gist (path);

-- ---------------------------------------------------------------------------
-- Helpers JWT (claims enrichis par le hook custom_access_token, cf. 002_functions.sql)
-- ---------------------------------------------------------------------------

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

-- Vrai si `target_tenant_id` est un descendant (ou soi-même) d'un des tenants supervisés par l'utilisateur
create or replace function is_supervised_tenant(target_tenant_id uuid) returns boolean as $$
  select exists (
    select 1
    from public.tenants supervised
    join public.tenants target on target.id = target_tenant_id
    where supervised.id = any(public.auth_jwt_supervisor_tenant_ids())
      and target.path <@ supervised.path
  );
$$ language sql stable set search_path = public, extensions;

-- ---------------------------------------------------------------------------
-- RLS : tenants
-- ---------------------------------------------------------------------------

alter table tenants enable row level security;

create policy "tenants_select_member_or_supervisor" on tenants
  for select using (
    id = any(auth_jwt_tenant_ids())
    or is_supervised_tenant(id)
    or subdomain is not null -- site public : lecture publique des champs non sensibles via une vue dédiée, pas la table brute
  );

create policy "tenants_update_admin" on tenants
  for update using (
    exists (
      select 1 from memberships m
      where m.tenant_id = tenants.id
        and m.user_id = auth.uid()
        and m.role in ('club_admin', 'committee_admin', 'league_admin', 'federation_admin')
    )
  );

-- ---------------------------------------------------------------------------
-- RLS : memberships
-- ---------------------------------------------------------------------------

alter table memberships enable row level security;

-- SECURITY DEFINER : contourne la RLS pour cette lecture interne. Sans ça,
-- une policy sur `memberships` qui interroge `memberships` pour savoir si
-- l'utilisateur est admin du tenant redéclenche l'évaluation de cette même
-- policy sur la sous-requête -> récursion infinie (erreur Postgres 42P17).
create or replace function is_tenant_admin(target_tenant_id uuid) returns boolean as $$
  select exists (
    select 1 from public.memberships
    where tenant_id = target_tenant_id
      and user_id = auth.uid()
      and role in ('club_admin', 'committee_admin', 'league_admin', 'federation_admin')
  );
$$ language sql stable security definer set search_path = public, extensions;

create policy "memberships_select_own_or_tenant_admin" on memberships
  for select using (
    user_id = auth.uid()
    or tenant_id = any(auth_jwt_tenant_ids())
    or is_supervised_tenant(tenant_id)
  );

create policy "memberships_write_tenant_admin" on memberships
  for all using (is_tenant_admin(tenant_id));

-- ---------------------------------------------------------------------------
-- RLS : teams / events (motif standard, réappliqué à l'identique pour
-- convocations, convocation_responses, presences, posts, documents, orders,
-- products, sponsors, carpools, carpool_bookings — cf. migrations suivantes)
-- ---------------------------------------------------------------------------

alter table teams enable row level security;

create policy "teams_select_tenant_member_or_supervisor" on teams
  for select using (
    tenant_id = any(auth_jwt_tenant_ids())
    or is_supervised_tenant(tenant_id)
  );

create policy "teams_write_coach_or_admin" on teams
  for all using (
    exists (
      select 1 from memberships m
      where m.tenant_id = teams.tenant_id
        and m.user_id = auth.uid()
        and m.role in ('coach', 'director', 'club_admin')
    )
  );

alter table events enable row level security;

create policy "events_select_tenant_member_or_supervisor" on events
  for select using (
    exists (
      select 1 from teams t
      where t.id = events.team_id
        and (t.tenant_id = any(auth_jwt_tenant_ids()) or is_supervised_tenant(t.tenant_id))
    )
  );

create policy "events_write_coach_or_admin" on events
  for all using (
    exists (
      select 1 from teams t
      join memberships m on m.tenant_id = t.tenant_id
      where t.id = events.team_id
        and m.user_id = auth.uid()
        and m.role in ('coach', 'director', 'club_admin')
    )
  );

alter table convocations enable row level security;
alter table convocation_responses enable row level security;
alter table presences enable row level security;

-- SECURITY DEFINER : `convocations` et `convocation_responses` ont chacune
-- une policy qui interroge l'autre table -> sans contourner la RLS pour ces
-- lectures internes, chaque evaluation redeclenche l'evaluation de l'autre,
-- a l'infini (meme classe de bug que is_tenant_admin plus haut).
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

create policy "convocations_select_event_participants" on convocations
  for select using (
    is_convocation_participant(id) or is_convocation_manager(id)
  );

create policy "convocation_responses_select_own_or_coach" on convocation_responses
  for select using (
    user_id = auth.uid() or is_convocation_manager(convocation_id)
  );

create policy "convocation_responses_update_own" on convocation_responses
  for update using (user_id = auth.uid());

-- Journalisation : lecture réservée à l'admin du tenant concerné
alter table audit_logs enable row level security;

create policy "audit_logs_select_tenant_admin" on audit_logs
  for select using (
    tenant_id = any(auth_jwt_tenant_ids())
    and exists (
      select 1 from memberships m
      where m.tenant_id = audit_logs.tenant_id
        and m.user_id = auth.uid()
        and m.role in ('club_admin', 'committee_admin', 'league_admin', 'federation_admin')
    )
  );
