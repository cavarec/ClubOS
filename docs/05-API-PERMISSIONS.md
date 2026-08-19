# ClubOS — Types, API, permissions

*Sections 16 à 19 du cahier des charges.*
*Types exécutables : [`packages/database/src/types.ts`](../packages/database/src/types.ts) (générés depuis Prisma + affinés à la main pour les DTO d'API).*

---

## 16. Types TypeScript (extrait des types partagés)

```ts
// packages/database/src/types.ts

export type TenantType = 'federation' | 'league' | 'committee' | 'club';

export interface Tenant {
  id: string;
  parentId: string | null;
  type: TenantType;
  sportId: string | null;
  name: string;
  slug: string;
  subdomain: string | null;
  customDomain: string | null;
  logoUrl: string | null;
  settings: Record<string, unknown>;
  createdAt: string;
}

export type MemberRole =
  | 'player' | 'parent' | 'coach' | 'director'
  | 'club_admin' | 'committee_admin' | 'league_admin' | 'federation_admin';

export interface Membership {
  id: string;
  tenantId: string;
  userId: string;
  role: MemberRole;
  status: 'active' | 'pending' | 'archived';
  joinedAt: string;
}

export interface Profile {
  id: string;               // = auth.users.id
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  birthDate: string | null;
}

export interface Team {
  id: string;
  tenantId: string;
  sportId: string;
  seasonId: string;
  name: string;
  category: string;          // ex. "U15 M", "Seniors F"
}

export type EventType = 'match' | 'training' | 'other';

export interface ClubEvent {
  id: string;
  teamId: string;
  type: EventType;
  title: string;
  startAt: string;
  endAt: string;
  location: string | null;
  opponent: string | null;
  isHome: boolean | null;
}

export type ConvocationResponseStatus = 'pending' | 'present' | 'absent' | 'maybe';

export interface Convocation {
  id: string;
  eventId: string;
  createdBy: string;
  aiSuggested: boolean;
  createdAt: string;
}

export interface ConvocationResponse {
  convocationId: string;
  userId: string;
  status: ConvocationResponseStatus;
  respondedAt: string | null;
}

export interface Presence {
  eventId: string;
  userId: string;
  status: 'present' | 'absent' | 'excused';
  recordedBy: string;
  recordedAt: string;
}

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Product {
  id: string;
  tenantId: string;
  type: 'cotisation' | 'boutique' | 'billetterie';
  name: string;
  priceCents: number;
}

export interface Order {
  id: string;
  tenantId: string;
  userId: string;
  productId: string;
  status: OrderStatus;
  amountCents: number;
  stripePaymentIntentId: string | null;
  createdAt: string;
}
```

---

## 17-18. Schéma API REST et endpoints complets

ClubOS expose deux couches d'API :

1. **PostgREST auto-généré par Supabase** pour tout le CRUD standard filtré par RLS — pas de code serveur à écrire ni maintenir pour ces cas.
2. **Edge Functions / Route Handlers Next.js** pour la logique métier qui dépasse le CRUD (IA, paiements, notifications, synchronisation fédération).

### Ressources PostgREST (CRUD standard, RLS-filtré)

| Ressource | Endpoint | Opérations |
|---|---|---|
| Tenants | `/rest/v1/tenants` | GET, PATCH (admin) |
| Memberships | `/rest/v1/memberships` | GET, POST, PATCH, DELETE |
| Teams | `/rest/v1/teams` | GET, POST, PATCH, DELETE |
| Events | `/rest/v1/events` | GET, POST, PATCH, DELETE |
| Convocations | `/rest/v1/convocations` | GET, POST |
| Convocation responses | `/rest/v1/convocation_responses` | GET, PATCH |
| Presences | `/rest/v1/presences` | GET, POST, PATCH |
| Carpools | `/rest/v1/carpools` | GET, POST, PATCH |
| Carpool bookings | `/rest/v1/carpool_bookings` | GET, POST, DELETE |
| Posts (actualités) | `/rest/v1/posts` | GET, POST, PATCH, DELETE |
| Documents | `/rest/v1/documents` | GET, POST, DELETE |
| Products | `/rest/v1/products` | GET, POST, PATCH |
| Orders | `/rest/v1/orders` | GET, POST |
| Sponsors | `/rest/v1/sponsors` | GET, POST, PATCH, DELETE |

### Endpoints métier (Edge Functions & Route Handlers)

| Méthode | Endpoint | Fonction | Auth requise |
|---|---|---|---|
| `POST` | `/functions/v1/convocation-create` | Crée une convocation + suggestion IA d'effectif | coach, director, club_admin |
| `POST` | `/functions/v1/convocation-remind` | Relance des non-répondants (déclenché par pg_cron, ou manuel) | coach, director |
| `POST` | `/functions/v1/ai-assist` | Point d'entrée IA (rédaction actu, résumé match, suggestion effectif) | coach, director, club_admin (plan Premium) |
| `POST` | `/api/webhooks/stripe` | Traite les événements Stripe (paiement réussi/échoué) | signature Stripe |
| `POST` | `/api/webhooks/federation` | Réception de callbacks fédération niveau 3 | secret partagé fédération |
| `POST` | `/functions/v1/federation-sync` | Lance une synchronisation niveau 2 pour un tenant | club_admin |
| `POST` | `/functions/v1/public-site-revalidate` | Revalide l'ISR du site public d'un club (déclenché par trigger DB) | interne (service role) |
| `GET` | `/api/tenants/[slug]/public-site` | Données agrégées pour le rendu du site public | public |
| `POST` | `/api/orders/[id]/checkout` | Crée une session Stripe Checkout pour une commande | authentifié, propriétaire de la commande |
| `POST` | `/api/data-requests` | Enregistre une demande RGPD (export ou suppression) | authentifié |
| `POST` | `/api/onboarding/club` | Crée un nouveau tenant club + membership `club_admin` pour le créateur (service role, RLS contournée à la création) | authentifié |
| `POST` | `/api/onboarding/join/[code]` | Rejoint un tenant via code d'invitation | authentifié |

---

## 19. Modèle de permissions (RBAC)

### Rôles

`player` · `parent` · `coach` · `director` · `club_admin` · `committee_admin` · `league_admin` · `federation_admin`

### Matrice des droits (par module, écriture = create/update/delete, lecture = read)

| Module | player | parent | coach | director | club_admin | committee/league/federation admin |
|---|---|---|---|---|---|---|
| Profil personnel | R/W (soi) | R/W (enfants) | R/W (soi) | R/W (soi) | R/W (soi) | R/W (soi) |
| Adhérents du club | — | — | Lecture équipe | Lecture club | R/W club | Lecture agrégée (descendants) |
| Équipes | Lecture | Lecture (enfants) | R/W (ses équipes) | R/W club | R/W club | Lecture agrégée |
| Calendrier / Événements | Lecture | Lecture | R/W (ses équipes) | R/W club | R/W club | Lecture agrégée |
| Convocations | Répondre | Répondre (enfants) | Créer/gérer (ses équipes) | R/W club | R/W club | — |
| Présences | Lecture (soi) | Lecture (enfants) | R/W (ses équipes) | Lecture club | R/W club | Lecture agrégée |
| Communication | Lecture | Lecture | Publier (équipe) | Publier (club) | Publier (club) | Publier (descendants, diffusion) |
| Paiements | Lecture (soi) | R/W (enfants, payer) | — | R/W club (config) | R/W club | Lecture agrégée (stats, pas nominatif) |
| Boutique | Acheter | Acheter (enfants) | — | R/W club | R/W club | — |
| Partenaires | Lecture | Lecture | — | R/W club | R/W club | — |
| Documents | Lecture (siens) | R/W (enfants) | Lecture équipe | R/W club | R/W club | — |
| Paramètres club / site public | — | — | — | Lecture | R/W | — |
| Intégrations fédération | — | — | — | Lecture | R/W | Lecture statut (descendants) |
| Membres & rôles du club | — | — | — | Lecture | R/W (inviter, changer rôle) | — |

**Règles transverses :**

- Un `parent` n'agit jamais directement sur les données d'un enfant mineur sans passer par la relation `guardianships` explicite — pas d'accès par simple appartenance au même tenant.
- Les rôles de supervision (`committee_admin`, `league_admin`, `federation_admin`) n'ont **jamais** d'accès en écriture aux données opérationnelles d'un tenant descendant — uniquement lecture agrégée (statistiques, statut d'activité) et publication de communications descendantes, cf. `03-DONNEES.md` §RLS.
- Toute action de type suppression définitive (compte, club) est journalisée dans `audit_logs` et soumise à confirmation explicite — cf. `07-CONFORMITE-DEVOPS.md` §RGPD.

---

*Suite : [`06-PAIEMENTS-NOTIFICATIONS.md`](06-PAIEMENTS-NOTIFICATIONS.md) — schéma Stripe, schéma notifications.*
