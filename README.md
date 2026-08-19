# ClubOS

**Un club. Une plateforme.**

La plateforme tout-en-un des clubs sportifs (handball, football, basketball, rugby, volleyball,
tennis, judo, natation, athlétisme, omnisports) — adhérents, équipes, convocations, présences,
paiements, communication, covoiturage et site public généré automatiquement, pour les clubs,
comités, ligues et fédérations.

Le dossier stratégique et technique complet (vision, marché, architecture, schéma de données,
user stories, API, RGPD, DevOps, roadmap, backlog) est dans [`docs/`](docs/README.md).

## Structure du monorepo

```
apps/
  web/            SaaS Next.js 15 (App Router, TypeScript, Tailwind v4)
  mobile/         App React Native Expo (Expo Router, TypeScript)
packages/
  database/       Schéma Prisma + migrations SQL (RLS multi-tenant) + types partagés
  ui/             Design system web (tokens + composants React)
docs/             Dossier stratégique et technique (27 sections du cahier des charges)
```

## Démarrer en local

Prérequis : Node 20+, [pnpm](https://pnpm.io) (`corepack enable` ou `npx pnpm`), un projet
[Supabase](https://supabase.com) (gratuit).

```bash
pnpm install
pnpm db:generate                     # génère le client Prisma

cp apps/web/.env.local.example apps/web/.env.local
# renseigner NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY /
# SUPABASE_SERVICE_ROLE_KEY (Project Settings > API), puis Stripe/Resend/PostHog
# si ces modules sont testés.

pnpm --filter @clubos/web dev         # web sur http://localhost:3000
pnpm --filter @clubos/mobile start    # mobile via Expo Go / simulateur
```

**Projet Supabase actuel** : ClubOS est connecté au projet réel `nvafpiypyfvxgunyyyuo`
(réutilisation du projet précédemment utilisé par Handeo, reset et redéployé pour ClubOS le
2026-08-19 — voir §Handeo ci-dessous). Pour redéployer le schéma sur un **nouveau** projet
Supabase vide :

1. Coller `packages/database/sql/bootstrap_reset.sql` dans le SQL Editor du dashboard Supabase et
   `Run` (crée tout : extensions, tables, RLS, droits, fonctions)
2. Coller `packages/database/sql/002_functions.sql` (le hook, déjà inclus dans bootstrap_reset.sql
   mais présent aussi séparément si besoin de le rejouer seul)
3. Dashboard > Authentication > Hooks > **Custom Access Token** → activer, choisir
   `public.custom_access_token_hook`
4. Renseigner `apps/web/.env.local` avec l'URL/clés du nouveau projet (Project Settings > API)

`packages/database/sql/001_init.sql`/`002_functions.sql`/`003_triggers.sql` restent la source de
vérité versionnée ; `bootstrap_*.sql` sont des scripts d'assemblage ponctuels pour un déploiement
initial complet en une fois (généré via `prisma migrate diff --from-empty`).

## État du scaffold

Ce dépôt est un **point de départ architecturé**, pas un MVP terminé.

**Fait et vérifié** (`pnpm install`, `prisma generate`, `tsc --noEmit`, `next build`, démarrage du
serveur de dev, navigation testée dans le navigateur) :

- Schéma de données complet (33 modèles Prisma : organisation multi-tenant hiérarchique via
  `ltree`, identité/RBAC, licences fédérales, équipes/calendrier, convocations/présences,
  covoiturage, communication, documents, paiements, partenaires, bénévolat, site public, RGPD)
- RLS multi-tenant et hook JWT `custom_access_token` (`packages/database/sql/`)
- Design system web complet (`packages/ui`) : tokens (dont la palette de marque navy/dégradé bleu
  et la palette par sport), `Logo`/`Tagline`, `Button`, `Card`, `Badge`, `Avatar` (badges
  d'initiales), `StatTile`, `ConvocationCard`, `PresenceToggle`, `PlayerRoster`, `PaymentCard`
- Identité de marque appliquée (header marketing, sidebar app, écran de connexion, favicon) —
  recréée en code à partir de l'asset logo fourni (navy `#0B1E39` + dégradé bleu `#38BDF8→#1D4ED8`)
- App web : landing marketing, connexion par lien magique, dashboard club, équipes (liste + fiche
  effectif), calendrier, convocations (interactif), présences (pointage), adhérents (recherche +
  alertes certificat), communication (fil + publication), documents (alertes d'expiration),
  paramètres > membres (invitation) — toutes rendues et vérifiées dans le navigateur, zéro erreur
  console
- 2 endpoints métier implémentés (`/api/onboarding/club`, `/api/webhooks/stripe`) illustrant le
  pattern décrit pour l'ensemble des endpoints (`docs/05-API-PERMISSIONS.md`)
- App mobile : structure Expo Router complète (onglets recomposables par rôle, écran convocations
  fonctionnel avec covoiturage, connexion par lien magique), typecheck propre
- **Connexion à un vrai projet Supabase** : schéma déployé, RLS + droits par rôle + hook JWT
  `custom_access_token_hook` vérifiés de bout en bout (auth par mot de passe, JWT décodé,
  `tenant_ids`/`supervisor_tenant_ids` correctement injectés). Les pages listées ci-dessus
  utilisent encore des données de démonstration (`apps/web/src/lib/mock-data.ts`) — la connexion
  au backend réel est validée, mais les pages n'ont pas encore été rebranchées dessus (prochaine
  étape logique).

**Manquants pour un premier MVP utilisable** (voir `docs/08-ROADMAP-BACKLOG.md` pour l'ordre de
priorité recommandé) :

- Rebrancher les pages sur les vraies requêtes Supabase (actuellement sur `mock-data.ts`)
- Pages restantes de l'arborescence documentée (paiements, boutique, partenaires, paramètres >
  général/site-public/intégrations, sites publics des clubs, espaces comité/ligue)
- Import CSV fédération (niveau 1), Edge Functions (`convocation-create`, `stripe-webhook` complet
  avec Stripe Connect onboarding, `federation-sync`, `public-site-revalidate`)
- Notifications push réelles (Firebase Cloud Messaging), icônes/splash de production
- Tests automatisés (Vitest, Playwright) et pipeline CI/CD (`docs/07-CONFORMITE-DEVOPS.md`)

## Notes techniques

- **Tailwind v4 et monorepo** : `apps/web/src/app/globals.css` déclare `@source "../../../../packages/ui/src/**/*.{ts,tsx}";` — sans cette ligne, la détection de contenu automatique de Tailwind v4 ne scanne pas `packages/ui` (hors de l'arborescence `apps/web`), et les classes utilisées uniquement dans ses composants (`bg-brand-600`, `text-white`, ...) ne sont jamais générées, silencieusement (pas d'erreur de build, juste des éléments non stylés). Si un nouveau package partagé avec des classes Tailwind est ajouté, il faut lui ajouter sa propre ligne `@source`.
- **Server/Client Components** : tout composant de `packages/ui` qui attache lui-même un gestionnaire d'événement (`onClick`, ...) doit porter `"use client"` — sinon il casse silencieusement dès qu'il est rendu depuis une page Server Component, avec l'erreur "Event handlers cannot be passed to Client Components".
- **Reset de schéma Supabase** : après un `DROP SCHEMA public CASCADE`, penser à regranter les droits de table à `anon`/`authenticated`/`service_role` (`GRANT ... ON SCHEMA` seul ne suffit pas — PostgREST renvoie 401/42501 sur toutes les tables sinon, même avec RLS correcte). `bootstrap_reset.sql` le fait via `ALTER DEFAULT PRIVILEGES` avant de créer les tables.
- **Hook JWT `custom_access_token_hook`** : doit être `SECURITY DEFINER` (+ `set search_path = ''` et tables qualifiées `public.xxx`). Sans ça, la fonction tourne avec les droits de `supabase_auth_admin`, qui n'a ni accès direct aux tables ni de quoi passer la RLS dessus — le login échoue avec `500 unexpected_failure` / "Error running hook", sans autre détail côté client.

## Handeo

Ce projet est distinct du travail existant sur **Handeo** (`../handeo`), plateforme dédiée au
handball construite précédemment sur la même problématique. ClubOS en reprend la vision en
l'élargissant à l'omnisport et au multi-niveau (club/comité/ligue/fédération) — les deux dépôts
restent indépendants.
