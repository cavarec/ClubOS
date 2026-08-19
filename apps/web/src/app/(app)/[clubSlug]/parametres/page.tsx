import Link from "next/link";

const sections = [
  { href: "membres", title: "Membres", desc: "Inviter des membres, gérer les rôles du club." },
  { href: "general", title: "Général", desc: "Nom, logo, coordonnées, saison en cours." },
  { href: "site-public", title: "Site public", desc: "Personnalisation du site public généré." },
  { href: "integrations", title: "Intégrations", desc: "Connecteurs fédération, Stripe, notifications." },
];

export default async function ParametresPage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Paramètres</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={`/${clubSlug}/parametres/${s.href}`}
            className="rounded-lg border border-slate-200 bg-white p-4 hover:border-brand-300 hover:shadow-sm"
          >
            <p className="font-semibold text-ink">{s.title}</p>
            <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
