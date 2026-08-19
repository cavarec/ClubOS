import { StatTile } from "@clubos/ui";

// Données de démonstration — à remplacer par une requête Supabase
// (vw_club_dashboard) une fois un projet Supabase connecté. Cf. README racine.
const mockStats = {
  licencies: 187,
  cotisationsAJour: 92,
  alertesCertificats: 3,
  convocationsSemaine: 6,
};

const mockActualites = [
  { id: "1", title: "Reprise des entraînements", date: "2026-08-18" },
  { id: "2", title: "AG 2026 - convocation", date: "2026-08-10" },
];

const mockAlertes = [
  "3 certificats médicaux expirent sous 15 jours",
  "2 familles en retard de paiement",
];

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ clubSlug: string }>;
}) {
  const { clubSlug } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Tableau de bord</h1>
        <p className="text-sm text-slate-500">{clubSlug}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Licenciés actifs" value={mockStats.licencies} />
        <StatTile label="Cotisations à jour" value={`${mockStats.cotisationsAJour}%`} tone="success" />
        <StatTile label="Alertes certificats" value={mockStats.alertesCertificats} tone="warning" />
        <StatTile label="Convocations cette semaine" value={mockStats.convocationsSemaine} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-semibold text-ink">Actualités récentes</h2>
          <ul className="flex flex-col gap-2">
            {mockActualites.map((a) => (
              <li key={a.id} className="text-sm text-slate-700">
                📰 {a.title}
                <span className="ml-2 text-xs text-slate-400">{a.date}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-semibold text-ink">Alertes</h2>
          <ul className="flex flex-col gap-2">
            {mockAlertes.map((alerte, i) => (
              <li key={i} className="text-sm text-amber-700">
                ⚠ {alerte}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
