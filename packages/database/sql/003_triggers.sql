-- ClubOS — triggers métier : revalidation du site public, relance de convocations

-- Revalidation du site public : notifie l'Edge Function `public-site-revalidate`
-- via pg_net à chaque changement de posts/teams/events pertinent pour un club.
create or replace function notify_public_site_revalidate() returns trigger as $$
declare
  target_tenant_id uuid;
begin
  target_tenant_id := coalesce(new.tenant_id, old.tenant_id);

  perform net.http_post(
    url := current_setting('app.settings.edge_function_url') || '/public-site-revalidate',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('tenant_id', target_tenant_id)
  );

  return coalesce(new, old);
end;
$$ language plpgsql;

drop trigger if exists trg_posts_revalidate on posts;
create trigger trg_posts_revalidate
  after insert or update or delete on posts
  for each row execute function notify_public_site_revalidate();

drop trigger if exists trg_sponsors_revalidate on sponsors;
create trigger trg_sponsors_revalidate
  after insert or update or delete on sponsors
  for each row execute function notify_public_site_revalidate();

-- Relance automatique des convocations sans réponse (pg_cron, toutes les heures)
-- Sélectionne les convocations liées à un événement dans 24-48h avec des réponses 'pending'
-- et déclenche l'Edge Function `convocation-remind`.
select cron.schedule(
  'convocation-remind-hourly',
  '0 * * * *',
  $$
  select net.http_post(
    url := current_setting('app.settings.edge_function_url') || '/convocation-remind',
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
  $$
);

-- Alerte quotidienne d'expiration de certificat médical (30/15/7 jours avant échéance)
select cron.schedule(
  'document-expiry-check-daily',
  '0 7 * * *',
  $$
  select net.http_post(
    url := current_setting('app.settings.edge_function_url') || '/document-expiry-check',
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
  $$
);
