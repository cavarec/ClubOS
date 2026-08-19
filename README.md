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
- App web, **toutes les pages branchées sur de vraies requêtes Supabase** (plus de mock data) :
  landing marketing, connexion par lien magique, onboarding de club, dashboard, équipes (liste +
  fiche effectif), calendrier, convocations (réponse écrite en direct), présences (pointage écrit
  en direct), adhérents (recherche + certificats via `licenses`), communication (fil + publication
  écrite en direct), documents (alertes d'expiration), paramètres > membres. Chaque page + chaque
  écriture (réponse convocation, pointage présence, publication) vérifiée avec une vraie session
  utilisateur contre le vrai projet Supabase, données de test nettoyées après coup.
- 2 endpoints métier implémentés (`/api/onboarding/club`, `/api/webhooks/stripe`) illustrant le
  pattern décrit pour l'ensemble des endpoints (`docs/05-API-PERMISSIONS.md`)
- App mobile : structure Expo Router complète (onglets recomposables par rôle, écran convocations
  fonctionnel avec covoiturage, connexion par lien magique), typecheck propre
- **Parcours réel bout en bout vérifié contre le vrai Supabase** : inscription → création de
  profil automatique → création de club (fonction atomique) → JWT rafraîchi avec les bons
  `tenant_ids` → dashboard et toutes les pages affichant de vraies données lues/écrites via RLS
  (`middleware.ts`, `/auth/callback`, `/onboarding/club-setup`).

**Manquants pour un premier MVP utilisable** (voir `docs/08-ROADMAP-BACKLOG.md` pour l'ordre de
priorité recommandé) :

- Pages restantes de l'arborescence documentée (paiements, boutique, partenaires, paramètres >
  général/site-public/intégrations, sites publics des clubs, espaces comité/ligue)
- Système d'invitation par code (table dédiée — la page Membres a un placeholder explicite)
- Import CSV fédération (niveau 1), Edge Functions (`convocation-create`, `stripe-webhook` complet
  avec Stripe Connect onboarding, `federation-sync`, `public-site-revalidate`)
- Notifications push réelles (Firebase Cloud Messaging), icônes/splash de production
- Tests automatisés (Vitest, Playwright) et pipeline CI/CD (`docs/07-CONFORMITE-DEVOPS.md`)

## Notes techniques

- **Tailwind v4 et monorepo** : `apps/web/src/app/globals.css` déclare `@source "../../../../packages/ui/src/**/*.{ts,tsx}";` — sans cette ligne, la détection de contenu automatique de Tailwind v4 ne scanne pas `packages/ui` (hors de l'arborescence `apps/web`), et les classes utilisées uniquement dans ses composants (`bg-brand-600`, `text-white`, ...) ne sont jamais générées, silencieusement (pas d'erreur de build, juste des éléments non stylés). Si un nouveau package partagé avec des classes Tailwind est ajouté, il faut lui ajouter sa propre ligne `@source`.
- **Server/Client Components** : tout composant de `packages/ui` qui attache lui-même un gestionnaire d'événement (`onClick`, ...) doit porter `"use client"` — sinon il casse silencieusement dès qu'il est rendu depuis une page Server Component, avec l'erreur "Event handlers cannot be passed to Client Components".
- **Reset de schéma Supabase** : après un `DROP SCHEMA public CASCADE`, penser à regranter les droits de table à `anon`/`authenticated`/`service_role` (`GRANT ... ON SCHEMA` seul ne suffit pas — PostgREST renvoie 401/42501 sur toutes les tables sinon, même avec RLS correcte). `bootstrap_reset.sql` le fait via `ALTER DEFAULT PRIVILEGES` avant de créer les tables.
- **Hook JWT `custom_access_token_hook`** : doit être `SECURITY DEFINER` (+ `set search_path = ''` et tables qualifiées `public.xxx`). Sans ça, la fonction tourne avec les droits de `supabase_auth_admin`, qui n'a ni accès direct aux tables ni de quoi passer la RLS dessus — le login échoue avec `500 unexpected_failure` / "Error running hook", sans autre détail côté client.
- **`search_path` en cascade** : une fonction PL/pgSQL sans son propre `SET search_path` hérite du search_path *actif au moment de l'appel* — donc, appelée depuis une fonction `SECURITY DEFINER search_path = ''` (comme `create_club_with_admin`), elle hérite de ce search_path vide et ne résout plus les types d'extension (`ltree` → "type does not exist"). Toute fonction/trigger susceptible d'être appelée depuis un contexte à search_path restreint doit fixer le sien explicitement, indépendamment de l'appelant.
- **Récursion RLS (erreur Postgres 42P17)** : une policy sur une table qui interroge cette même table dans sa sous-requête (ex. "suis-je admin de ce tenant ?" vérifié en relisant `memberships` depuis une policy sur `memberships`) redéclenche l'évaluation de cette policy à l'infini. Fix : déplacer la sous-requête dans une fonction `SECURITY DEFINER` (contourne la RLS pour cette lecture interne, comme le propriétaire de la table le ferait).
- **Colonnes `id` sans défaut DB** : Prisma génère l'UUID côté client (`@default(uuid())`), ce qui n'est reflété nulle part dans le schéma DB réel — un insert via le client Supabase direct (hors Prisma Client, donc tout le runtime de l'app) échoue avec `null value in column "id"`. Fix : `@default(dbgenerated("gen_random_uuid()"))` dans `schema.prisma`, qui se traduit en `DEFAULT gen_random_uuid()` dans le DDL généré.
- **Pas de profil = pas de membership possible** : rien ne crée automatiquement une ligne `profiles` à l'inscription (`auth.users` → `public.profiles`), alors que `memberships.user_id` référence `profiles.id`. Sans le trigger `on_auth_user_created` (`004_onboarding.sql`), le tout premier insert dans `memberships` d'un nouvel utilisateur échoue par violation de clé étrangère.
- **Écriture non atomique = tenant orphelin** : créer un club en deux inserts séparés depuis l'API (tenant, puis membership admin) laisse un tenant sans admin si le second échoue — et bloque définitivement son `slug` pour toute nouvelle tentative. Fix : fonction SQL unique `create_club_with_admin` (transaction implicite d'une fonction PL/pgSQL), appelée via `.rpc()`.
- **JWT figé à l'émission** : les claims custom (`tenant_ids`, ...) sont injectés une seule fois, à l'émission du token — créer un club en cours de session ne met pas à jour le token courant. Sans `supabase.auth.refreshSession()` après la création, les policies RLS basées sur `tenant_ids` ne voient pas encore le nouveau club tant que l'utilisateur n'obtient pas un token frais (`ClubSetupForm.tsx`).
- **Récursion RLS croisée entre deux tables** : pas seulement le cas d'une table qui s'auto-référence (`memberships`, ci-dessus) — `convocations` et `convocation_responses` avaient chacune une policy qui interrogeait l'autre table, créant un cycle A→B→A→B... à l'infini. Même symptôme (`42P17`), même fix (fonctions `SECURITY DEFINER` : `is_convocation_participant`, `is_convocation_manager`). Réflexe à avoir : dès qu'une policy RLS contient un `exists (select ... from <une autre table avec RLS>)`, vérifier que cette autre table ne referme pas la boucle vers la première.

## Handeo

Ce projet est distinct du travail existant sur **Handeo** (`../handeo`), plateforme dédiée au
handball construite précédemment sur la même problématique. ClubOS en reprend la vision en
l'élargissant à l'omnisport et au multi-niveau (club/comité/ligue/fédération) — les deux dépôts
restent indépendants.
