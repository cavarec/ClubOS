// Données de démonstration partagées entre les pages du dashboard club.
// À remplacer par des requêtes Supabase (RLS multi-tenant) une fois un
// projet connecté — cf. README racine et docs/03-DONNEES.md pour le schéma
// réel que ces objets miment.

export const mockTeams = [
  { id: "t1", name: "U15 M", category: "U15 M", sport: "Handball", memberCount: 14 },
  { id: "t2", name: "Seniors F", category: "Seniors F", sport: "Handball", memberCount: 16 },
  { id: "t3", name: "U11 Mixte", category: "U11 Mixte", sport: "Handball", memberCount: 18 },
];

export const mockRosterByTeam: Record<
  string,
  { id: string; firstName: string; lastName: string; role: "player" | "coach" | "manager"; presenceRate: number }[]
> = {
  t1: [
    { id: "p1", firstName: "Ronan", lastName: "Kervella", role: "player", presenceRate: 90 },
    { id: "p2", firstName: "Malo", lastName: "Perrot", role: "player", presenceRate: 80 },
    { id: "p3", firstName: "Erwan", lastName: "Le Goff", role: "player", presenceRate: 30 },
    { id: "p4", firstName: "Yann", lastName: "Guichaoua", role: "player", presenceRate: 75 },
    { id: "p5", firstName: "Loïc", lastName: "Tanguy", role: "coach", presenceRate: 100 },
  ],
  t2: [
    { id: "p6", firstName: "Anna", lastName: "Le Roux", role: "player", presenceRate: 95 },
    { id: "p7", firstName: "Léa", lastName: "Kerdal", role: "player", presenceRate: 88 },
  ],
  t3: [{ id: "p8", firstName: "Tom", lastName: "Abgrall", role: "player", presenceRate: 60 }],
};

export const mockEvents = [
  { id: "e1", teamId: "t1", teamName: "U15 M", type: "match" as const, title: "U15M vs AL Landerneau", startAt: "2026-08-23T14:00:00", location: "Gymnase Kervao, Lesneven" },
  { id: "e2", teamId: "t1", teamName: "U15 M", type: "training" as const, title: "Entraînement U15M", startAt: "2026-08-20T18:30:00", location: "Gymnase Kervao" },
  { id: "e3", teamId: "t2", teamName: "Seniors F", type: "training" as const, title: "Entraînement Seniors F", startAt: "2026-08-21T20:00:00", location: "Gymnase Kervao" },
  { id: "e4", teamId: "t2", teamName: "Seniors F", type: "match" as const, title: "Seniors F vs HBC Landerneau", startAt: "2026-08-24T16:00:00", location: "Extérieur — Landerneau" },
];

export const mockMembers = [
  { id: "p1", firstName: "Ronan", lastName: "Kervella", role: "player", team: "U15 M", certificateStatus: "ok" as const },
  { id: "p2", firstName: "Malo", lastName: "Perrot", role: "player", team: "U15 M", certificateStatus: "expiring" as const },
  { id: "p3", firstName: "Erwan", lastName: "Le Goff", role: "player", team: "U15 M", certificateStatus: "ok" as const },
  { id: "p5", firstName: "Loïc", lastName: "Tanguy", role: "coach", team: "U15 M", certificateStatus: "ok" as const },
  { id: "p6", firstName: "Anna", lastName: "Le Roux", role: "player", team: "Seniors F", certificateStatus: "expired" as const },
  { id: "director1", firstName: "Sophie", lastName: "Cadiou", role: "director", team: "—", certificateStatus: "ok" as const },
];

export const mockDocuments = [
  { id: "d1", owner: "Malo Perrot", category: "certificat_medical" as const, expiresAt: "2026-09-02" },
  { id: "d2", owner: "Anna Le Roux", category: "certificat_medical" as const, expiresAt: "2026-08-10" },
  { id: "d3", owner: "Club", category: "reglement" as const, expiresAt: null },
];

export const mockPosts = [
  { id: "post1", scope: "club" as const, title: "Reprise des entraînements", body: "Les entraînements reprennent le 20 août pour toutes les catégories.", author: "Sophie Cadiou", date: "2026-08-18" },
  { id: "post2", scope: "club" as const, title: "AG 2026 - convocation", body: "L'assemblée générale se tiendra le 12 septembre à 19h, salle du club.", author: "Sophie Cadiou", date: "2026-08-10" },
  { id: "post3", scope: "team" as const, title: "Feuille de match ce week-end", body: "Rdv 13h15 pour le match contre Landerneau.", author: "Loïc Tanguy", date: "2026-08-19" },
];
