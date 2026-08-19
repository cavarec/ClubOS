import Link from "next/link";
import { Logo } from "@clubos/ui";

const navItems = [
  { href: "dashboard", label: "Tableau de bord" },
  { href: "adherents", label: "Adhérents" },
  { href: "equipes", label: "Équipes" },
  { href: "calendrier", label: "Calendrier" },
  { href: "convocations", label: "Convocations" },
  { href: "presences", label: "Présences" },
  { href: "communication", label: "Communication" },
  { href: "paiements", label: "Paiements" },
  { href: "boutique", label: "Boutique" },
  { href: "partenaires", label: "Partenaires" },
  { href: "documents", label: "Documents" },
  { href: "parametres", label: "Paramètres" },
];

export default async function ClubLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clubSlug: string }>;
}) {
  const { clubSlug } = await params;

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
        <div className="mb-4 px-2">
          <Logo size="sm" />
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={`/${clubSlug}/${item.href}`}
              className="rounded-md px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 bg-slate-50 p-6">{children}</div>
    </div>
  );
}
