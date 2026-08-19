-- ===========================================================================
-- ClubOS -- ajoute gen_random_uuid() par defaut sur les colonnes id
-- ===========================================================================
--
-- Prisma genere l'UUID cote client (@default(uuid())) mais ce n'est PAS
-- reflete dans le schema DB -- un insert direct via le client Supabase (pas
-- Prisma Client) sans fournir 'id' echoue avec 'null value in column id'.
-- Necessite l'extension pgcrypto (deja activee par 001_init.sql).
--
-- profiles.id est exclue : elle doit rester egale a auth.users.id, jamais
-- aleatoire. convocation_responses/presences/site_settings n'ont pas de
-- colonne id (cle primaire composite ou = tenant_id).
-- ===========================================================================

alter table "public"."sports" alter column "id" set default gen_random_uuid();
alter table "public"."tenants" alter column "id" set default gen_random_uuid();
alter table "public"."seasons" alter column "id" set default gen_random_uuid();
alter table "public"."memberships" alter column "id" set default gen_random_uuid();
alter table "public"."guardianships" alter column "id" set default gen_random_uuid();
alter table "public"."licenses" alter column "id" set default gen_random_uuid();
alter table "public"."federation_connectors" alter column "id" set default gen_random_uuid();
alter table "public"."federation_sync_logs" alter column "id" set default gen_random_uuid();
alter table "public"."teams" alter column "id" set default gen_random_uuid();
alter table "public"."team_members" alter column "id" set default gen_random_uuid();
alter table "public"."events" alter column "id" set default gen_random_uuid();
alter table "public"."convocations" alter column "id" set default gen_random_uuid();
alter table "public"."carpools" alter column "id" set default gen_random_uuid();
alter table "public"."carpool_bookings" alter column "id" set default gen_random_uuid();
alter table "public"."posts" alter column "id" set default gen_random_uuid();
alter table "public"."chat_messages" alter column "id" set default gen_random_uuid();
alter table "public"."notifications" alter column "id" set default gen_random_uuid();
alter table "public"."push_tokens" alter column "id" set default gen_random_uuid();
alter table "public"."documents" alter column "id" set default gen_random_uuid();
alter table "public"."products" alter column "id" set default gen_random_uuid();
alter table "public"."orders" alter column "id" set default gen_random_uuid();
alter table "public"."installments" alter column "id" set default gen_random_uuid();
alter table "public"."sponsors" alter column "id" set default gen_random_uuid();
alter table "public"."volunteer_missions" alter column "id" set default gen_random_uuid();
alter table "public"."volunteer_assignments" alter column "id" set default gen_random_uuid();
alter table "public"."site_pages" alter column "id" set default gen_random_uuid();
alter table "public"."consents" alter column "id" set default gen_random_uuid();
alter table "public"."data_requests" alter column "id" set default gen_random_uuid();
alter table "public"."audit_logs" alter column "id" set default gen_random_uuid();
