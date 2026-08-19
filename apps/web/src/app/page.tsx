import Link from "next/link";
import { Button } from "@clubos/ui";

const modules = [
  { title: "Adhérents", desc: "Licenciés, familles, documents et certificats médicaux centralisés." },
  { title: "Convocations", desc: "Sélection assistée par IA, réponse en un tap depuis la notification." },
  { title: "Présences", desc: "Émargement matchs et entraînements, même hors connexion." },
  { title: "Paiements", desc: "Cotisations, boutique et échéanciers via Stripe, sans chèque oublié." },
  { title: "Communication", desc: "Un fil par club, par équipe — fini le bruit du groupe WhatsApp." },
  { title: "Site public", desc: "Généré automatiquement depuis vos données, zéro maintenance." },
];

export default function MarketingHome() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <span className="text-lg font-bold text-ink">ClubOS</span>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-ink">
            Se connecter
          </Link>
          <Link href="/login">
            <Button size="sm">Essayer gratuitement</Button>
          </Link>
        </nav>
      </header>

      <section className="flex flex-col items-center gap-6 px-6 py-20 text-center md:py-32">
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
          Handball · Football · Basketball · Rugby · Volleyball · Tennis · Judo · Natation · Athlétisme
        </span>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-ink md:text-6xl">
          Un club. Une plateforme.
        </h1>
        <p className="max-w-xl text-lg text-slate-600">
          ClubOS remplace Kalisport, WhatsApp, Excel et vos outils de paiement dispersés par un seul système
          d&apos;exploitation numérique pour votre club sportif.
        </p>
        <div className="flex gap-3">
          <Link href="/login">
            <Button size="lg">Créer mon club</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Voir une démo
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-2 md:grid-cols-3">
        {modules.map((m) => (
          <div key={m.title} className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-ink">{m.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{m.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
