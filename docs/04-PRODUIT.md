# ClubOS — Produit : user stories, wireframes, arborescences

*Sections 11 à 15 du cahier des charges.*

---

## 11. User Stories (MVP)

### Joueur

- En tant que joueur, je veux recevoir une notification push quand je suis convoqué, pour répondre en un tap sans ouvrir l'app.
- En tant que joueur, je veux consulter mon calendrier (matchs + entraînements) pour m'organiser sur la semaine.
- En tant que joueur, je veux voir l'historique de mes présences pour comprendre mon temps de jeu/participation.
- En tant que joueur majeur, je veux gérer moi-même mes réponses aux convocations sans passer par un parent.

### Parent

- En tant que parent, je veux gérer les convocations de plusieurs enfants depuis un seul compte, pour ne pas jongler entre plusieurs apps.
- En tant que parent, je veux proposer ou réserver une place de covoiturage pour un match extérieur, directement depuis l'événement concerné.
- En tant que parent, je veux payer la cotisation de mon enfant en ligne (carte, éventuellement échelonnée), pour éviter le chèque oublié.
- En tant que parent, je veux être alerté si le certificat médical de mon enfant expire bientôt, pour ne pas bloquer sa participation.

### Entraîneur

- En tant qu'entraîneur, je veux créer une convocation en moins d'une minute avec une liste pré-suggérée par l'IA (basée sur présences/disponibilités), pour gagner du temps chaque semaine.
- En tant qu'entraîneur, je veux voir en temps réel qui a répondu et relancer les silencieux en un clic.
- En tant qu'entraîneur, je veux pointer les présences à l'entraînement depuis mon téléphone, même hors connexion au gymnase.
- En tant qu'entraîneur, je veux voir les statistiques de présence de mon effectif sur la saison pour identifier les décrocheurs.

### Dirigeant / Trésorier

- En tant que dirigeant, je veux avoir une vue consolidée des cotisations payées/en attente/en retard, pour piloter la trésorerie sans tableur.
- En tant que trésorier, je veux proposer un échéancier de paiement à une famille en difficulté, directement dans l'outil.
- En tant que dirigeant, je veux publier une actualité qui apparaît à la fois dans l'app et sur le site public du club, sans double saisie.
- En tant que dirigeant, je veux gérer les partenaires/sponsors et leur visibilité (logo sur le site, mention dans les actus) pour valoriser leur soutien.

### Administrateur Club

- En tant qu'admin club, je veux inviter les autres dirigeants/entraîneurs par lien ou code, sans créer les comptes moi-même.
- En tant qu'admin club, je veux importer les licenciés depuis un export de ma fédération en quelques clics, pour ne pas ressaisir 200 membres.
- En tant qu'admin club, je veux configurer le site public du club (couleurs, logo, sections visibles) sans compétence technique.
- En tant qu'admin club, je veux exporter toutes les données du club à tout moment (portabilité, obligation RGPD).

### Comité / Ligue

- En tant que responsable de comité, je veux voir en un coup d'œil quels clubs de mon territoire sont actifs sur la plateforme et lesquels décrochent, pour cibler mon accompagnement.
- En tant que responsable de ligue, je veux communiquer une information descendante (ex. dates de stage) à tous les clubs rattachés en une seule publication.
- En tant que comité, je veux consulter des statistiques agrégées (nombre de licenciés, taux de présence moyen) sans accéder aux données nominatives détaillées de chaque club.

---

## 12. Wireframes textuels (écrans clés)

### Dashboard club (dirigeant)

```
┌─────────────────────────────────────────────┐
│ ClubOS   [Logo club]  HBC Lesneven      [👤] │
├───────────────┬───────────────────────────────┤
│ Tableau de bord│  Actualités récentes          │
│ Adhérents      │  ─────────────────────────    │
│ Équipes        │  📰 "Reprise des entraînements"│
│ Calendrier     │  📰 "AG 2026 - convocation"    │
│ Convocations   │                                │
│ Présences      │  Indicateurs clés              │
│ Communication  │  ┌────────┬────────┬────────┐  │
│ Paiements      │  │ 187    │ 92%    │ 3      │  │
│ Boutique       │  │ Licen. │ Cotis. │ Alertes│  │
│ Partenaires    │  │ actifs │ à jour │ certif.│  │
│ Documents      │  └────────┴────────┴────────┘  │
│ Paramètres     │  Alertes                       │
│               │  ⚠ 3 certificats médicaux expirent sous 15 jours │
│               │  ⚠ 2 familles en retard de paiement │
└───────────────┴───────────────────────────────┘
```

### Création de convocation (entraîneur, mobile)

```
┌───────────────────────────────┐
│ ← Nouvelle convocation         │
├───────────────────────────────┤
│ Événement : Match U15M vs ...  │
│ Date : Sam 23/08 - 14h00       │
│                                 │
│ Effectif suggéré (IA) ✨       │
│ ☑ Ronan K.   (présent 9/10)    │
│ ☑ Malo P.    (présent 8/10)    │
│ ☐ Erwan L.   (présent 3/10) ⚠  │
│ ...                             │
│                                 │
│ [+ Ajouter un joueur]           │
│                                 │
│      [Envoyer la convocation]   │
└───────────────────────────────┘
```

### Réponse à une convocation (notification push → écran)

```
┌───────────────────────────────┐
│ Convocation — Match samedi 23/08│
├───────────────────────────────┤
│ 🏐 U15M vs AL Landerneau        │
│ 📍 Gymnase Kervao, Lesneven     │
│ 🕑 Rdv 13h15 - Match 14h00      │
│                                 │
│  [ Présent ]  [ Absent ]  [?]   │
│                                 │
│ 🚗 Covoiturage : 2 places dispo │
│    [Réserver une place]         │
└───────────────────────────────┘
```

### Espace paiement (parent)

```
┌───────────────────────────────┐
│ Paiements — Léa K.              │
├───────────────────────────────┤
│ Cotisation saison 2026-27       │
│ 180,00 €           [Payer]      │
│                                 │
│ Ou en 3 fois sans frais :       │
│ 60 € le 01/09, 01/11, 01/01     │
│           [Choisir l'échéancier]│
│                                 │
│ Historique                      │
│ ✔ Cotisation 2025-26 — payée    │
│ ✔ Maillot boutique — payé       │
└───────────────────────────────┘
```

### Vue superviseur (comité)

```
┌─────────────────────────────────────────────┐
│ Comité Handball Finistère           [👤]     │
├───────────────┬───────────────────────────────┤
│ Vue d'ensemble │ Clubs rattachés (24)           │
│ Clubs          │ ────────────────────────────── │
│ Communication  │ HBC Lesneven      312 lic. 🟢  │
│ Statistiques   │ HBC Landerneau    198 lic. 🟢  │
│               │ ASPTT Brest       450 lic. 🟢  │
│               │ HB Crozon          64 lic. 🟠 (baisse activité) │
│               │                                │
│               │ [Publier une communication descendante] │
└───────────────┴───────────────────────────────┘
```

---

## 13. Arborescence application web

```
apps/web/
  src/
    app/
      (marketing)/                # site vitrine clubos.fr
        page.tsx  tarifs/  contact/
      (auth)/
        login/page.tsx
        signup/page.tsx
        join/[code]/page.tsx
      (app)/[clubSlug]/
        layout.tsx                 # sidebar + garde d'accès par rôle
        dashboard/page.tsx
        adherents/page.tsx
        adherents/[id]/page.tsx
        equipes/page.tsx
        equipes/[teamId]/page.tsx
        calendrier/page.tsx
        convocations/page.tsx
        convocations/[id]/page.tsx
        presences/page.tsx
        communication/page.tsx
        paiements/page.tsx
        boutique/page.tsx
        partenaires/page.tsx
        documents/page.tsx
        parametres/
          general/page.tsx
          membres/page.tsx
          site-public/page.tsx
          integrations/page.tsx
      (comite)/[tenantSlug]/dashboard/page.tsx
      (ligue)/[tenantSlug]/dashboard/page.tsx
      (public-club)/[clubSlug]/
        page.tsx                   # accueil site public
        actualites/  equipes/  resultats/  calendrier/  contact/  boutique/  partenaires/
      api/
        webhooks/stripe/route.ts
        webhooks/federation/route.ts
    components/                    # UI spécifique à l'app (au-delà de packages/ui)
    features/
      convocations/  presences/  paiements/  communication/  adherents/
    lib/
      supabase/  stripe/  posthog/  utils.ts
    middleware.ts                  # résolution multi-tenant par domaine/sous-domaine
```

## 14. Arborescence application mobile

```
apps/mobile/
  app/
    (auth)/login.tsx  signup.tsx  join.tsx
    (tabs)/
      _layout.tsx                  # onglets recomposés selon le rôle
      index.tsx                    # accueil / actualités
      calendrier.tsx
      convocations.tsx
      presences.tsx                 # visible entraîneur/admin uniquement
      profil.tsx
    convocation/[id].tsx
    covoiturage/[eventId].tsx
    paiement/[orderId].tsx
    _layout.tsx                    # root layout, providers (auth, notifications)
  components/
  features/
    convocations/  presences/  covoiturage/  paiements/
  lib/
    supabase.ts
    notifications.ts               # enregistrement token FCM, gestion permissions
    offline-cache.ts               # cache convocations/calendrier
  app.config.ts                    # config Expo (EAS, icônes, deep links)
```

## 15. Arborescence backend / infrastructure

```
packages/database/
  prisma/
    schema.prisma
  sql/
    001_init.sql                   # tables + RLS
    002_functions.sql              # fonctions (jwt_tenant_ids, is_ancestor_of, ...)
    003_triggers.sql               # tenants.path, revalidation site public
  src/
    index.ts                       # exports des types générés

packages/connectors/                # moteur d'intégration fédérations
  src/
    types.ts
    registry.ts
    ffhb.ts  fff.ts  ffbb.ts  fftennis.ts

packages/ui/                        # design system partagé (web, via React Native Web pour mobile si besoin)
packages/config/                    # tsconfig, eslint, tailwind partagés

supabase/
  functions/
    convocation-create/
    convocation-remind/
    stripe-webhook/
    federation-sync/
    public-site-revalidate/
    ai-assist/
  migrations/                       # miroir versionné de packages/database/sql
```

---

*Suite : [`05-API-PERMISSIONS.md`](05-API-PERMISSIONS.md) — types partagés, API REST, endpoints, permissions.*
