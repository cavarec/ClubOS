# ClubOS — Vision, marché et stratégie

*Document de référence CTO — v1.0*
*Nom de travail : **ClubOS**. À valider/déposer avant tout lancement public (INPI, .fr/.com/.app).*
*Slogan : « Un club. Une plateforme. »*

---

## 1. Vision produit détaillée

### Le problème

Un club sportif amateur — quel que soit le sport — gère aujourd'hui sa saison avec un empilement d'outils qui ne se parlent pas :

- un **outil fédéral obligatoire** pour les licences et les résultats officiels (Gest'Hand pour la FFHB, FFF Compet pour le foot, etc.) ;
- un **logiciel de gestion associative payant et daté** (Kalisport, Sportsregions, TeamPulse selon le sport et la région) pour les adhérents, les finances, la communication ;
- **WhatsApp** pour la communication réelle du quotidien, non structurée, non archivée utilement ;
- **Excel et Google Forms** pour les convocations, les présences, le covoiturage — bricolés par des bénévoles ;
- **des solutions de paiement dispersées** (virements, chèques, Lyf, Helloasso, PayPal) sans centralisation ni suivi.

Le bénévole moyen (trésorier, entraîneur, dirigeant) perd plusieurs heures par semaine à faire circuler la même information sur quatre ou cinq canaux différents, dans un club qui n'a — par nature — ni salarié dédié ni budget IT.

Ce problème n'est pas spécifique au handball : il est **structurellement identique dans tous les sports collectifs et individuels amateurs** — seuls le vocabulaire (catégories d'âge, types de compétition), les fédérations et les outils imposés changent. C'est ce constat qui justifie une architecture unique, multi-sport dès le premier jour, plutôt qu'un produit mono-sport qu'il faudrait refondre pour changer de discipline.

### Le positionnement ClubOS

ClubOS ne remplace pas les outils fédéraux (impossible et non souhaitable : ce sont les systèmes de référence légaux pour les licences et les compétitions officielles). ClubOS se positionne **par-dessus**, comme la couche quotidienne :

- vie de club, communication, organisation ;
- convocations et présences ;
- paiements et cotisations ;
- covoiturage, boutique, partenaires, documents ;
- site public du club, généré automatiquement ;

avec les outils fédéraux comme **source de vérité** pour les licenciés et les résultats officiels, connectés via le moteur d'intégration (voir `03-DONNEES.md` §Connecteurs fédérations).

ClubOS se distingue de Kalisport et des logiciels historiques sur un pari simple : **ces outils ont gagné le marché sur la largeur fonctionnelle, pas sur l'expérience.** Leur UI n'a pas évolué depuis dix ans, leurs apps mobiles sont un point faible connu de tous les clubs qui les utilisent, et leur tarification par club ne s'adresse jamais directement à l'usage quotidien des parents et des joueurs. Une plateforme mobile-first, avec de vraies notifications push et une UX pensée pour un parent qui répond à une convocation entre deux portes, est un différenciateur suffisant pour prendre des parts de marché — à condition de rester **radicalement simple** et de ne jamais retomber dans le piège du « logiciel qui fait tout, mal ».

### Les trois surfaces produit

1. **Plateforme Web SaaS** (Next.js) — l'outil de gestion quotidienne pour dirigeants, entraîneurs, parents et joueurs.
2. **Applications mobiles iOS/Android** (React Native Expo) — l'usage quotidien réel : convocations, présences, notifications, covoiturage.
3. **Site internet public**, généré automatiquement pour chaque club à partir des données du SaaS — zéro compétence technique requise, zéro double saisie.

### La hiérarchie multi-tenant

```
Fédération
   └── Ligue régionale
          └── Comité départemental
                 └── Club
                        └── Équipe (catégorie)
                               └── Licencié (joueur / encadrant / arbitre / dirigeant)
```

Chaque niveau a son propre espace, ses propres utilisateurs, et une vision agrégée en lecture sur les niveaux qu'il supervise (un comité voit ses clubs, une ligue voit ses comités), sans jamais avoir accès en écriture aux données opérationnelles d'un club — cf. `05-API-PERMISSIONS.md`.

### North star metric

**Nombre de convocations envoyées et honorées (réponse + présence enregistrée) par semaine, par club actif.** C'est l'usage le plus fréquent, le plus douloureux à la main, et celui qui crée l'habitude qui ancre ClubOS dans le quotidien du club — la porte d'entrée vers tous les autres modules.

### Modèle économique (vue d'ensemble)

- **Freemium par club** : un premier niveau gratuit réellement utilisable (pas un piège commercial) — convocations, présences, communication, calendrier, jusqu'à N licenciés.
- **Abonnement club payant** : au-delà du seuil gratuit, ou pour débloquer paiements Stripe, boutique, site public personnalisé, IA, statistiques avancées.
- **Add-ons** : billetterie, gestion bénévoles, covoiturage avancé, connecteurs fédération niveau 2/3.
- **Offre Comité/Ligue/Fédération** : licence de supervision multi-club, tarification au nombre de clubs rattachés.
- **Commission sur les paiements en ligne** (Stripe Connect) en complément de l'abonnement, alignée sur l'usage réel (cotisations, boutique, billetterie).

Détail des paliers et des prix : voir `08-ROADMAP-BACKLOG.md` §Modèle économique.

---

## 2. Analyse concurrentielle

### Panorama des outils en place

| Outil | Rôle réel | Sport(s) | Statut pour le club |
|---|---|---|---|
| **Gest'Hand** | Licences, engagements, résultats officiels | Handball | Obligatoire FFHB, UX datée, incontournable |
| **FFF Compet / FootClubs** | Licences, résultats officiels | Football | Obligatoire FFF |
| **FFBB Basketfrance** | Licences, résultats officiels | Basketball | Obligatoire FFBB |
| **Kalisport** | Gestion associative généraliste (adhérents, finances, communication) | Multi-sport | Payant (~300-800 €/an), leader historique du marché associatif |
| **Sportsregions** | Gestion associative + billetterie régionale | Multi-sport | Fort en Bretagne/Grand Ouest, UX vieillissante, modules dispersés |
| **TeamPulse** | Communication et organisation d'équipe | Multi-sport | Plus récent, plus mobile, mais fonctionnellement étroit (pas de gestion financière/adhérents complète) |
| **WhatsApp** | Communication d'équipe informelle | Tous | Gratuit, universel, aucune structure |
| **Excel / Google Forms** | Convocations, disponibilités, présences | Tous | Bricolage bénévole, source d'erreurs |
| **Helloasso / Lyf / virements** | Paiement cotisations | Tous | Dispersé, aucune vue consolidée trésorerie |

### Comparables indirects

**Spond** (Norvège, forte présence Europe du Nord) et **SportEasy** (France) montrent qu'un outil de communication/organisation d'équipe simple capte vite l'adhésion des familles, même sans intégration fédérale profonde — mais restent **faibles ou absents** sur la gestion associative complète (finances, adhérents, site public) et sur l'intégration fédérale française. ClubOS se différencie en visant les deux à la fois : la simplicité d'usage de Spond/SportEasy **et** la profondeur de gestion associative de Kalisport, avec en plus une intégration fédérale native.

### Comparatif détaillé ClubOS vs Kalisport (acteur de référence à battre)

| Critère | Kalisport | ClubOS |
|---|---|---|
| Plateforme | Site responsive + app mobile jugée datée/peu fiable | Web + apps natives iOS/Android + site public auto-généré |
| Onboarding club | Long, souvent via prestataire | Auto-service en < 30 min, import CSV fédération guidé |
| Multi-sport | Oui mais générique, peu spécialisé par discipline | Oui, avec vocabulaire/catégories/règles adaptés par sport dès la config |
| Multi-tenant hiérarchique | Non (club isolé) | Oui : club → comité → ligue → fédération, supervision native |
| Convocations | Fonctionnel mais formulaire lourd, peu mobile | Sélection en 3 taps, réponse en 1 tap depuis la notification push |
| Notifications | Email principalement, push limité | Push natif (FCM) sur tous les événements clés |
| Communication | Fil d'actu basique | Fil club + fil équipe + chat équipe + messages privés |
| Covoiturage | Absent / bricolage externe | Natif, lié à l'événement, places en temps réel |
| Paiement | Module propriétaire, peu flexible | Stripe Connect, cotisations + boutique + billetterie unifiés |
| Site public | Souvent un module séparé, payant, peu personnalisable | Généré automatiquement depuis les données du SaaS, inclus |
| Intégration fédérale | Non documentée pour l'utilisateur final | Moteur de connecteurs 3 niveaux (CSV → sync auto → API), extensible sans refonte |
| IA | Absente | Assistant convocations, suggestions effectifs, analyse participation, rédaction actus |
| Tarification | Abonnement club, souvent opaque | Freemium + add-ons, transparent, sans engagement long |
| Design/UX | Perçu comme daté par les clubs (retours terrain constants) | Design system moderne, testé mobile-first |

**Verdict stratégique** : Kalisport et Sportsregions gagnent encore sur la largeur fonctionnelle « gestion associative avancée » (comptabilité fine, historique multi-saison profond). ClubOS ne doit **pas** essayer de rattraper cette largeur dès le MVP — il doit gagner sur la **profondeur de l'usage quotidien** (convocations/présences/communication/paiement) où ces outils sont faibles, sur la **couverture multi-sport et multi-niveau** qu'aucun concurrent ne propose nativement, et laisser la comptabilité fine à une intégration future (export vers outils comptables tiers), pas un objectif MVP.

---

## 3. Différenciateurs ClubOS

1. **Omnisport par architecture, pas par façade.** Le modèle de données sépare le cœur générique (club, membre, équipe, événement, paiement) des attributs spécifiques au sport (catégories d'âge, types de compétition, règles de composition) portés par une couche de configuration par sport — ajouter un sport ne nécessite pas de refonte, cf. `03-DONNEES.md`.
2. **Hiérarchie multi-tenant native.** Aucun concurrent direct ne propose une supervision native club → comité → ligue → fédération avec agrégation de données en lecture. C'est un axe de vente direct vers les comités et ligues, pas seulement vers les clubs.
3. **Site public généré automatiquement.** Le club n'a rien à maintenir : le site (actualités, équipes, résultats, calendrier, boutique, partenaires) se met à jour tout seul quand les données changent dans le SaaS.
4. **Mobile-first réel.** Applications natives Expo, notifications push natives, offline pour la consultation (convocations, calendrier). Un parent doit pouvoir répondre à une convocation en 5 secondes depuis l'écran de verrouillage.
5. **Une seule vérité par donnée.** Fédération = licences/résultats officiels. ClubOS = tout le reste. Pas de double saisie au-delà du MVP : import puis synchronisation, jamais de ressaisie manuelle en V2+.
6. **IA au service du bénévole, pas gadget.** Suggestion automatique de convocation basée sur les présences aux entraînements et les disponibilités déclarées ; détection d'absences récurrentes ; rédaction assistée d'actualités.
7. **Communication unifiée et contextualisée.** Un message est toujours attaché à une équipe ou un événement — fini le bruit d'un groupe WhatsApp de 40 parents où se mélangent logistique, vie de club et blagues.
8. **Continuité documentaire inter-saison.** Les données appartiennent au club (tenant), pas à la personne qui a créé le compte — conçu pour survivre aux changements de bureau bénévole.
9. **Moteur de connecteurs fédération extensible.** Trois niveaux (import CSV, synchronisation automatisée, API fédération) permettant d'ajouter Gest'Hand, FFF, FFBB, FFTennis ou toute autre fédération sans réécrire le cœur du produit.
10. **Tarification transparente et progressive**, pensée pour un budget associatif, avec un vrai niveau gratuit utilisable.

---

*Suite : [`02-ARCHITECTURE.md`](02-ARCHITECTURE.md) — architecture globale, backend, frontend, mobile, diagrammes.*
