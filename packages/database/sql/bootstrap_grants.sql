-- ===========================================================================
-- ClubOS — privileges manquants suite au reset (DROP SCHEMA public CASCADE)
-- ===========================================================================
--
-- A executer APRES bootstrap_reset.sql, dans le meme SQL Editor.
--
-- Constat : `GRANT ... ON SCHEMA public` (deja fait dans bootstrap_reset.sql)
-- donne seulement le droit de "voir" le schema, pas d'agir sur les tables
-- qu'il contient. Sans ce script, PostgREST renvoie 401/42501 "permission
-- denied" sur toutes les tables, meme avec RLS correctement configuree —
-- RLS ne s'evalue qu'apres que le GRANT de base autorise l'acces a la table.
-- ===========================================================================

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant all on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to authenticated, anon, service_role;
grant execute on all functions in schema public to authenticated, anon, service_role;

-- Pour que les tables/fonctions creees plus tard (futures migrations) heritent
-- automatiquement des memes droits, sans avoir a repeter ce script a chaque fois.
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to authenticated, anon, service_role;
alter default privileges in schema public grant execute on functions to authenticated, anon, service_role;
