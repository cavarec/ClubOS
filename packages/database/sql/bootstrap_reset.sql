-- ===========================================================================
-- ClubOS — reset complet du schema public (remplace Handeo) + schema ClubOS
-- ===========================================================================
--
-- A COLLER TEL QUEL dans Supabase Dashboard > SQL Editor > New query, pour le
-- projet "handeo" (ref nvafpiypyfvxgunyyyuo), puis cliquer "Run".
--
-- ATTENTION : ce script commence par un DROP SCHEMA public CASCADE, qui
-- supprime DEFINITIVEMENT toutes les tables/données actuelles du projet
-- (celles de Handeo). Irreversible. Ne pas executer si des donnees Handeo
-- doivent etre conservees.
--
-- Genere le 2026-08-19 a partir de :
--   - packages/database/prisma/schema.prisma (via `prisma migrate diff --from-empty`)
--   - packages/database/sql/001_init.sql (extensions, hierarchie ltree, RLS)
--   - packages/database/sql/002_functions.sql (hook JWT custom_access_token)
-- Ne contient PAS 003_triggers.sql (depend d'Edge Functions pas encore
-- deployees) — a appliquer separement une fois ces fonctions ecrites.
--
-- Etape suivante apres ce script : enregistrer custom_access_token_hook comme
-- "Custom Access Token Hook" dans Authentication > Hooks (le SQL seul ne
-- suffit pas, cette activation se fait dans l'UI).
-- ===========================================================================

drop schema if exists public cascade;
create schema public;
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres;

-- Droits par defaut sur les objets qui seront crees juste apres (tables du
-- schema ClubOS) : GRANT ... ON SCHEMA seul ne donne que le droit de "voir"
-- le schema, pas d'agir sur son contenu — sans ceci, PostgREST renvoie
-- 401/42501 "permission denied" sur toutes les tables, meme avec RLS.
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to authenticated, anon, service_role;
alter default privileges in schema public grant execute on functions to authenticated, anon, service_role;

-- ===========================================================================
-- Schema ClubOS (genere depuis prisma/schema.prisma)
-- ===========================================================================

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."TenantType" AS ENUM ('federation', 'league', 'committee', 'club');

-- CreateEnum
CREATE TYPE "public"."MemberRole" AS ENUM ('player', 'parent', 'coach', 'director', 'club_admin', 'committee_admin', 'league_admin', 'federation_admin');

-- CreateEnum
CREATE TYPE "public"."TeamMemberRole" AS ENUM ('player', 'coach', 'manager');

-- CreateEnum
CREATE TYPE "public"."EventType" AS ENUM ('match', 'training', 'other');

-- CreateEnum
CREATE TYPE "public"."ConvocationResponseStatus" AS ENUM ('pending', 'present', 'absent', 'maybe');

-- CreateEnum
CREATE TYPE "public"."PresenceStatus" AS ENUM ('present', 'absent', 'excused');

-- CreateEnum
CREATE TYPE "public"."PostScope" AS ENUM ('club', 'team', 'supervision');

-- CreateEnum
CREATE TYPE "public"."NotificationChannel" AS ENUM ('push', 'email', 'sms');

-- CreateEnum
CREATE TYPE "public"."ProductType" AS ENUM ('cotisation', 'boutique', 'billetterie');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "public"."DataRequestType" AS ENUM ('export', 'deletion', 'rectification');

-- CreateEnum
CREATE TYPE "public"."DataRequestStatus" AS ENUM ('pending', 'processing', 'completed', 'rejected');

-- auth.users existe déjà (géré par Supabase Auth) : pas de CREATE TABLE ici,
-- seulement la FK plus bas qui la référence.

-- CreateTable
CREATE TABLE "public"."sports" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tenants" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "type" "public"."TenantType" NOT NULL,
    "sport_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subdomain" TEXT,
    "custom_domain" TEXT,
    "logo_url" TEXT,
    "address" JSONB,
    "siret" TEXT,
    "stripe_account_id" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seasons" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar_url" TEXT,
    "birth_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."memberships" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "public"."MemberRole" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."guardianships" (
    "id" UUID NOT NULL,
    "guardian_id" UUID NOT NULL,
    "child_id" UUID NOT NULL,

    CONSTRAINT "guardianships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."licenses" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "profile_id" UUID,
    "license_number" TEXT NOT NULL,
    "category" TEXT,
    "federation_code" TEXT NOT NULL,
    "medical_certificate_exp" DATE,
    "source" TEXT NOT NULL DEFAULT 'csv_import',
    "synced_at" TIMESTAMP(3),

    CONSTRAINT "licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."federation_connectors" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "federation_code" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "credentials_encrypted" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "last_synced_at" TIMESTAMP(3),

    CONSTRAINT "federation_connectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."federation_sync_logs" (
    "id" UUID NOT NULL,
    "connector_id" UUID NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "records_imported" INTEGER NOT NULL DEFAULT 0,
    "records_updated" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,

    CONSTRAINT "federation_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teams" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sport_id" UUID NOT NULL,
    "season_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."team_members" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "public"."TeamMemberRole" NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "type" "public"."EventType" NOT NULL,
    "title" TEXT NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "opponent" TEXT,
    "is_home" BOOLEAN,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."convocations" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "ai_suggested" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "convocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."convocation_responses" (
    "convocation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "public"."ConvocationResponseStatus" NOT NULL DEFAULT 'pending',
    "responded_at" TIMESTAMP(3),

    CONSTRAINT "convocation_responses_pkey" PRIMARY KEY ("convocation_id","user_id")
);

-- CreateTable
CREATE TABLE "public"."presences" (
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "public"."PresenceStatus" NOT NULL,
    "recorded_by" UUID NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presences_pkey" PRIMARY KEY ("event_id","user_id")
);

-- CreateTable
CREATE TABLE "public"."carpools" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "driver_id" UUID NOT NULL,
    "seats_total" INTEGER NOT NULL,
    "departure_point" TEXT,
    "departure_time" TIMESTAMP(3),

    CONSTRAINT "carpools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."carpool_bookings" (
    "id" UUID NOT NULL,
    "carpool_id" UUID NOT NULL,
    "passenger_id" UUID NOT NULL,
    "seats_booked" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "carpool_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."posts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "team_id" UUID,
    "scope" "public"."PostScope" NOT NULL DEFAULT 'club',
    "author_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_messages" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tenant_id" UUID,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "deep_link" TEXT,
    "channel" "public"."NotificationChannel" NOT NULL,
    "read_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."push_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "owner_user_id" UUID,
    "category" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "type" "public"."ProductType" NOT NULL,
    "name" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'pending',
    "amount_cents" INTEGER NOT NULL,
    "stripe_checkout_session_id" TEXT,
    "stripe_payment_intent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."installments" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "due_date" DATE NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sponsors" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "logo_url" TEXT,
    "website_url" TEXT,
    "tier" TEXT,
    "visible_from" DATE,
    "visible_to" DATE,

    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."volunteer_missions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_id" UUID,
    "slots_needed" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "volunteer_missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."volunteer_assignments" (
    "id" UUID NOT NULL,
    "mission_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "hours_logged" DECIMAL(5,2),

    CONSTRAINT "volunteer_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."site_pages" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."site_settings" (
    "tenant_id" UUID NOT NULL,
    "primary_color" TEXT,
    "secondary_color" TEXT,
    "sections_visible" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("tenant_id")
);

-- CreateTable
CREATE TABLE "public"."consents" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "consent_type" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "granted_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."data_requests" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "public"."DataRequestType" NOT NULL,
    "status" "public"."DataRequestStatus" NOT NULL DEFAULT 'pending',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "export_url" TEXT,

    CONSTRAINT "data_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID,
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "target_table" TEXT,
    "target_id" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sports_slug_key" ON "public"."sports"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "public"."tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_subdomain_key" ON "public"."tenants"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_custom_domain_key" ON "public"."tenants"("custom_domain");

-- CreateIndex
CREATE INDEX "tenants_parent_id_idx" ON "public"."tenants"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_tenant_id_user_id_role_key" ON "public"."memberships"("tenant_id", "user_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "guardianships_guardian_id_child_id_key" ON "public"."guardianships"("guardian_id", "child_id");

-- CreateIndex
CREATE UNIQUE INDEX "licenses_tenant_id_license_number_key" ON "public"."licenses"("tenant_id", "license_number");

-- CreateIndex
CREATE UNIQUE INDEX "federation_connectors_tenant_id_federation_code_key" ON "public"."federation_connectors"("tenant_id", "federation_code");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_team_id_user_id_role_key" ON "public"."team_members"("team_id", "user_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "carpool_bookings_carpool_id_passenger_id_key" ON "public"."carpool_bookings"("carpool_id", "passenger_id");

-- CreateIndex
CREATE UNIQUE INDEX "push_tokens_token_key" ON "public"."push_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "site_pages_tenant_id_slug_key" ON "public"."site_pages"("tenant_id", "slug");

-- AddForeignKey
ALTER TABLE "public"."tenants" ADD CONSTRAINT "tenants_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tenants" ADD CONSTRAINT "tenants_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seasons" ADD CONSTRAINT "seasons_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."memberships" ADD CONSTRAINT "memberships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."guardianships" ADD CONSTRAINT "guardianships_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."guardianships" ADD CONSTRAINT "guardianships_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."licenses" ADD CONSTRAINT "licenses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."federation_connectors" ADD CONSTRAINT "federation_connectors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."federation_sync_logs" ADD CONSTRAINT "federation_sync_logs_connector_id_fkey" FOREIGN KEY ("connector_id") REFERENCES "public"."federation_connectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teams" ADD CONSTRAINT "teams_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teams" ADD CONSTRAINT "teams_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teams" ADD CONSTRAINT "teams_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."convocations" ADD CONSTRAINT "convocations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."convocations" ADD CONSTRAINT "convocations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."convocation_responses" ADD CONSTRAINT "convocation_responses_convocation_id_fkey" FOREIGN KEY ("convocation_id") REFERENCES "public"."convocations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."convocation_responses" ADD CONSTRAINT "convocation_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."presences" ADD CONSTRAINT "presences_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."presences" ADD CONSTRAINT "presences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."carpools" ADD CONSTRAINT "carpools_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."carpools" ADD CONSTRAINT "carpools_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."carpool_bookings" ADD CONSTRAINT "carpool_bookings_carpool_id_fkey" FOREIGN KEY ("carpool_id") REFERENCES "public"."carpools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."carpool_bookings" ADD CONSTRAINT "carpool_bookings_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_messages" ADD CONSTRAINT "chat_messages_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."push_tokens" ADD CONSTRAINT "push_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."installments" ADD CONSTRAINT "installments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sponsors" ADD CONSTRAINT "sponsors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."volunteer_missions" ADD CONSTRAINT "volunteer_missions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."volunteer_assignments" ADD CONSTRAINT "volunteer_assignments_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "public"."volunteer_missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."volunteer_assignments" ADD CONSTRAINT "volunteer_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."site_pages" ADD CONSTRAINT "site_pages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."site_settings" ADD CONSTRAINT "site_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consents" ADD CONSTRAINT "consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."data_requests" ADD CONSTRAINT "data_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ===========================================================================
-- Extensions, hierarchie tenants (ltree), helpers JWT, RLS
-- ===========================================================================

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
    select path into parent_path from tenants where id = new.parent_id;
    new.path := parent_path || text2ltree(replace(new.id::text, '-', '_'));
  end if;
  return new;
end;
$$ language plpgsql;

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
$$ language sql stable;

create or replace function auth_jwt_supervisor_tenant_ids() returns uuid[] as $$
  select coalesce(
    array(select jsonb_array_elements_text(auth.jwt() -> 'app_metadata' -> 'supervisor_tenant_ids'))::uuid[],
    '{}'::uuid[]
  );
$$ language sql stable;

-- Vrai si `target_tenant_id` est un descendant (ou soi-même) d'un des tenants supervisés par l'utilisateur
create or replace function is_supervised_tenant(target_tenant_id uuid) returns boolean as $$
  select exists (
    select 1
    from tenants supervised
    join tenants target on target.id = target_tenant_id
    where supervised.id = any(auth_jwt_supervisor_tenant_ids())
      and target.path <@ supervised.path
  );
$$ language sql stable;

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

create policy "memberships_select_own_or_tenant_admin" on memberships
  for select using (
    user_id = auth.uid()
    or tenant_id = any(auth_jwt_tenant_ids())
    or is_supervised_tenant(tenant_id)
  );

create policy "memberships_write_tenant_admin" on memberships
  for all using (
    exists (
      select 1 from memberships admin
      where admin.tenant_id = memberships.tenant_id
        and admin.user_id = auth.uid()
        and admin.role in ('club_admin', 'committee_admin', 'league_admin', 'federation_admin')
    )
  );

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

create policy "convocations_select_event_participants" on convocations
  for select using (
    exists (
      select 1 from convocation_responses cr
      where cr.convocation_id = convocations.id and cr.user_id = auth.uid()
    )
    or exists (
      select 1 from events e
      join teams t on t.id = e.team_id
      join memberships m on m.tenant_id = t.tenant_id
      where e.id = convocations.event_id
        and m.user_id = auth.uid()
        and m.role in ('coach', 'director', 'club_admin')
    )
  );

create policy "convocation_responses_select_own_or_coach" on convocation_responses
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from convocations c
      join events e on e.id = c.event_id
      join teams t on t.id = e.team_id
      join memberships m on m.tenant_id = t.tenant_id
      where c.id = convocation_responses.convocation_id
        and m.user_id = auth.uid()
        and m.role in ('coach', 'director', 'club_admin')
    )
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

-- ===========================================================================
-- Hook JWT custom_access_token
-- ===========================================================================

-- ClubOS — hook Supabase Auth : enrichit le JWT avec tenant_ids / supervisor_tenant_ids / roles
-- À enregistrer comme "Custom Access Token Hook" dans Supabase Dashboard > Authentication > Hooks.

create or replace function custom_access_token_hook(event jsonb) returns jsonb as $$
declare
  claims jsonb;
  uid uuid := (event ->> 'user_id')::uuid;
  tenant_ids uuid[];
  supervisor_tenant_ids uuid[];
begin
  select coalesce(array_agg(m.tenant_id), '{}') into tenant_ids
  from memberships m
  where m.user_id = uid and m.status = 'active';

  select coalesce(array_agg(m.tenant_id), '{}') into supervisor_tenant_ids
  from memberships m
  where m.user_id = uid
    and m.status = 'active'
    and m.role in ('committee_admin', 'league_admin', 'federation_admin');

  claims := event -> 'claims';
  claims := jsonb_set(claims, '{app_metadata,tenant_ids}', to_jsonb(tenant_ids));
  claims := jsonb_set(claims, '{app_metadata,supervisor_tenant_ids}', to_jsonb(supervisor_tenant_ids));

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$ language plpgsql stable;

-- Le rôle `supabase_auth_admin` doit pouvoir exécuter ce hook (requis par Supabase)
grant execute on function custom_access_token_hook(jsonb) to supabase_auth_admin;
grant usage on schema public to supabase_auth_admin;
revoke execute on function custom_access_token_hook(jsonb) from authenticated, anon, public;
