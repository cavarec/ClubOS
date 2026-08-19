import Link from "next/link";
import Image from "next/image";
import { Button, Logo, Tagline } from "@clubos/ui";

const modules = [
  { title: "Adhérents", desc: "Licenciés, familles, documents et certificats médicaux centralisés." },
  { title: "Convocations", desc: "Sélection assistée par IA, réponse en un tap depuis la notification." },
  { title: "Présences", desc: "Émargement matchs et entraînements, même hors connexion." },
  { title: "Paiements", desc: "Cotisations, boutique et échéanciers via Stripe, sans chèque oublié." },
  { title: "Communication", desc: "Un fil par club, par équipe — fini le bruit du groupe WhatsApp." },
  { title: "Site public", desc: "Généré automatiquement depuis vos données, zéro maintenance." },
];

const sports = [
  "Handball", "Football", "Basketball", "Rugby", "Volleyball",
  "Tennis", "Judo", "Natation", "Athlétisme", "Omnisports",
];

export default function MarketingHome() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <Logo />
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
        <Tagline size="lg" />
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
        <div className="flex items-center gap-3 pt-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
          <span>Clubs</span>
          <span className="h-3 w-px bg-slate-300" />
          <span>Comités</span>
          <span className="h-3 w-px bg-slate-300" />
          <span>Ligues</span>
          <span className="h-3 w-px bg-slate-300" />
          <span>Fédérations</span>
        </div>
      </section>

      <section className="bg-navy px-6 py-16 md:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 md:flex-row md:gap-16">
          <Image
            src="/brand/clubos-mark.png"
            alt="Anneau des sports ClubOS : handball, football, basketball, rugby, volleyball, tennis, judo, natation, athlétisme"
            width={532}
            height={477}
            className="w-56 shrink-0 md:w-72"
          />
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-white md:text-3xl">Un seul cœur technique, tous les sports</h2>
            <p className="mt-3 max-w-md text-slate-300">
              Le vocabulaire, les catégories d&apos;âge et les règles de composition changent selon le sport —
              l&apos;architecture ClubOS, elle, ne change pas. Ajouter une discipline ne demande jamais de refonte.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
              {sports.map((sport) => (
                <span key={sport} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                  {sport}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-6 py-24 sm:grid-cols-2 md:grid-cols-3">
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
