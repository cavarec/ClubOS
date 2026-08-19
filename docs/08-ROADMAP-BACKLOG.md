# ClubOS — Roadmap et backlog

*Sections 24 à 27 du cahier des charges.*

---

## Modèle économique (détail des paliers)

| Palier | Cible | Prix indicatif | Inclus |
|---|---|---|---|
| **Essentiel (gratuit)** | Tout club | 0 € | Adhérents, équipes, calendrier, convocations, présences, communication, jusqu'à 150 licenciés |
| **Club** | Club > 150 licenciés ou besoin paiement | 29-49 €/mois | + Paiements Stripe, boutique, site public personnalisé, documents illimités |
| **Club Premium** | Club structuré | 79-129 €/mois | + Assistant IA, statistiques avancées, covoiturage avancé, gestion bénévoles |
| **Comité / Ligue** | Supervision multi-club | Sur devis (au nombre de clubs rattachés) | Dashboard agrégé, communication descendante, statistiques territoriales |
| **Add-on Billetterie** | Tout palier payant | Commission à la vente | Billets événements, QR code, contrôle d'accès |
| **Commission paiement en ligne** | Tout palier avec Stripe activé | ~1-1,5 % + frais Stripe | Prélevée via `application_fee_amount` |

---

## 24. Roadmap MVP — 3 mois

**Objectif** : un club pilote (grounding PLHB-like) peut quitter Excel/WhatsApp pour les convocations, présences et communication de base.

| Mois | Livrables |
|---|---|
| **Mois 1** | Monorepo, auth + onboarding club (création, invitation, rôles), schéma de données + RLS, design system de base, dashboard club minimal |
| **Mois 2** | Équipes, calendrier, convocations (création + réponse), présences, communication (actualités + fil équipe), app mobile V0 (auth, convocations, calendrier, présences) |
| **Mois 3** | Notifications push (FCM), import CSV licenciés (niveau 1 fédération), documents (certificats médicaux + alertes d'expiration), site public V0 (accueil, équipes, calendrier), recette avec le club pilote, correctifs |

**Hors périmètre MVP explicite** : paiements Stripe, boutique, IA, covoiturage, billetterie, bénévolat, comité/ligue — tout ce qui n'est pas nécessaire pour remplacer l'usage quotidien Excel/WhatsApp d'un club pilote.

---

## 25. Roadmap V1 — 6 mois

**Objectif** : produit commercialisable en autonomie (self-service), premiers clubs payants.

- Paiements Stripe Connect (cotisations + échéanciers), boutique en ligne.
- Site public complet (partenaires, boutique publique, personnalisation avancée, domaine personnalisé).
- Covoiturage natif (web + mobile).
- Synchronisation fédération niveau 2 pour au moins une fédération pilote (Gest'Hand).
- Espace comité (dashboard agrégé, communication descendante) — premier client comité pilote.
- Onboarding self-service complet (essai gratuit → club payant sans intervention manuelle).
- Facturation et gestion d'abonnement club (Stripe Billing côté plateforme, distinct du Connect club).
- Observabilité complète (Sentry, PostHog, alerting) et durcissement RGPD (export/suppression self-service).

---

## 26. Roadmap V2 — 12 mois

**Objectif** : différenciation forte, expansion multi-sport et multi-fédération.

- Assistant IA (suggestion d'effectif, rédaction d'actualités, résumé de match, détection de décrochage).
- Statistiques avancées (engagement, fréquentation, comparatif inter-équipes).
- Billetterie événementielle avec contrôle d'accès (scan QR code).
- Gestion des bénévoles (missions, affectations, heures).
- Connecteurs fédération niveau 3 (API) pour 2-3 fédérations supplémentaires (FFF, FFBB).
- Ouverture à un deuxième et troisième sport en production (au-delà du pilote handball) — validation concrète de l'architecture omnisport.
- Espace ligue (agrégation multi-comités) et premiers clients ligue.
- Marque blanche partielle pour les fédérations souhaitant proposer ClubOS à leurs clubs affiliés.

---

## 27. Backlog (structuré par epics, format Jira-ready)

> Format : `Epic > Story` avec estimation en points (Fibonacci) et priorité (P0 critique MVP, P1 V1, P2 V2). Importable dans Jira via CSV (colonnes : Epic, Summary, Story Points, Priority, Labels).

### EPIC: Fondations & Auth
- Auth email/mot de passe + lien magique (P0, 5)
- Onboarding création de club (P0, 5)
- Onboarding rejoindre un club par code d'invitation (P0, 3)
- Gestion des rôles et invitations membres (P0, 5)
- Custom claims JWT (tenant_ids, rôles) (P0, 3)

### EPIC: Adhérents & Équipes
- CRUD équipes/catégories (P0, 3)
- Import CSV licenciés (mapping configurable) (P0, 8)
- Fiche adhérent (profil, licence, documents) (P0, 5)
- Gestion multi-équipe d'un même joueur (surclassement) (P1, 5)

### EPIC: Calendrier & Convocations
- CRUD événements (match/entraînement) (P0, 3)
- Création de convocation manuelle (P0, 5)
- Réponse à une convocation (web + mobile) (P0, 5)
- Suggestion IA d'effectif (P2, 8)
- Relance automatique des non-répondants (P1, 3)

### EPIC: Présences
- Pointage présence entraînement (P0, 3)
- Pointage présence match (P0, 3)
- Statistiques de présence par joueur/équipe (P1, 5)

### EPIC: Communication
- Fil d'actualités club (P0, 3)
- Fil d'actualités équipe (P0, 3)
- Chat d'équipe basique (P1, 5)
- Communication descendante comité/ligue (P2, 5)

### EPIC: Paiements
- Intégration Stripe Connect onboarding club (P1, 8)
- Paiement cotisation en un versement (P1, 5)
- Échéancier de paiement (P1, 8)
- Boutique en ligne (catalogue + commande) (P1, 8)
- Billetterie événementielle (P2, 8)

### EPIC: Covoiturage
- Création de trajet lié à un événement (P1, 5)
- Réservation de place (P1, 3)
- Notifications covoiturage (P1, 2)

### EPIC: Documents & Conformité
- Upload et partage de documents (P0, 3)
- Alertes d'expiration certificat médical (P1, 3)
- Export de données RGPD (P1, 5)
- Suppression de compte RGPD (P1, 5)
- Journalisation des actions sensibles (P1, 3)

### EPIC: Site public
- Génération site public V0 (accueil, équipes, calendrier) (P0, 8)
- Personnalisation (couleurs, logo, sections) (P1, 5)
- Domaine personnalisé (P1, 5)
- Page boutique/partenaires publique (P1, 3)

### EPIC: Fédérations
- Import CSV niveau 1 (générique + Gest'Hand) (P0, 5)
- Synchronisation niveau 2 (Gest'Hand) (P1, 8)
- Connecteur API niveau 3 (FFF) (P2, 13)
- Connecteur API niveau 3 (FFBB) (P2, 13)

### EPIC: Supervision (Comité/Ligue)
- Dashboard agrégé comité (P1, 8)
- Dashboard agrégé ligue (P2, 8)
- Statistiques territoriales anonymisées (P2, 5)

### EPIC: IA & Premium
- Assistant rédaction d'actualités (P2, 5)
- Détection de décrochage/absentéisme (P2, 5)
- Gestion des bénévoles (P2, 8)

### EPIC: Plateforme & DevOps
- CI/CD GitHub Actions + Vercel (P0, 5)
- Monitoring Sentry + PostHog (P0, 3)
- Migrations DB versionnées (P0, 3)
- Sauvegardes et plan de continuité (P1, 3)

---

*Retour à l'index : [`README.md`](README.md).*
