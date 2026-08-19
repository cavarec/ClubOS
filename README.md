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

# Appliquer le schéma (une fois un projet Supabase créé) :
#   1. `prisma migrate deploy` (ou `supabase db push`) pour les tables
#   2. Coller packages/database/sql/001_init.sql, 002_functions.sql,
#      003_triggers.sql dans le SQL editor Supabase (extensions, RLS, hook JWT)
#   3. Enregistrer 002_functions.sql::custom_access_token_hook comme
#      "Custom Access Token Hook" dans Authentication > Hooks

pnpm --filter @clubos/web dev         # web sur http://localhost:3000
pnpm --filter @clubos/mobile start    # mobile via Expo Go / simulateur
```

## État du scaffold

Ce dépôt est un **point de départ architecturé**, pas un MVP terminé.

**Fait et vérifié** (`pnpm install`, `prisma generate`, `tsc --noEmit`, `next build`, démarrage du
serveur de dev, navigation testée dans le navigateur) :

- Schéma de données complet (33 modèles Prisma : organisation multi-tenant hiérarchique via
  `ltree`, identité/RBAC, licences fédérales, équipes/calendrier, convocations/présences,
  covoiturage, communication, documents, paiements, partenaires, bénévolat, site public, RGPD)
- RLS multi-tenant et hook JWT `custom_access_token` (`packages/database/sql/`)
- Design system web complet (`packages/ui`) : tokens, `Button`, `Card`, `Badge`, `Avatar` (badges
  d'initiales), `StatTile`, `ConvocationCard`, `PresenceToggle`, `PlayerRoster`, `PaymentCard`
- App web : landing marketing, connexion par lien magique, dashboard club, page convocations
  (interactive, réponses en un clic) — toutes rendues et vérifiées dans le navigateur
- 2 endpoints métier implémentés (`/api/onboarding/club`, `/api/webhooks/stripe`) illustrant le
  pattern décrit pour l'ensemble des endpoints (`docs/05-API-PERMISSIONS.md`)
- App mobile : structure Expo Router complète (onglets recomposables par rôle, écran convocations
  fonctionnel avec covoiturage, connexion par lien magique), typecheck propre

**Manquants pour un premier MVP utilisable** (voir `docs/08-ROADMAP-BACKLOG.md` pour l'ordre de
priorité recommandé) :

- Connexion à un vrai projet Supabase (le round-trip auth → onboarding → données réelles n'a pu
  être testé qu'en logique, faute de projet connecté dans cet environnement)
- Pages restantes de l'arborescence documentée (adhérents, équipes, présences, paiements,
  boutique, documents, paramètres, sites publics des clubs, espaces comité/ligue)
- Import CSV fédération (niveau 1), Edge Functions (`convocation-create`, `stripe-webhook` complet
  avec Stripe Connect onboarding, `federation-sync`, `public-site-revalidate`)
- Notifications push réelles (Firebase Cloud Messaging), icônes/splash de production
- Tests automatisés (Vitest, Playwright) et pipeline CI/CD (`docs/07-CONFORMITE-DEVOPS.md`)

## Handeo

Ce projet est distinct du travail existant sur **Handeo** (`../handeo`), plateforme dédiée au
handball construite précédemment sur la même problématique. ClubOS en reprend la vision en
l'élargissant à l'omnisport et au multi-niveau (club/comité/ligue/fédération) — les deux dépôts
restent indépendants.
