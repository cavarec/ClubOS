import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const tierLabel: Record<string, string> = { or: "Or", argent: "Argent", bronze: "Bronze" };
const tierOrder: Record<string, number> = { or: 0, argent: 1, bronze: 2 };

interface HeroContent {
  title?: string;
  body?: string;
}

// Page vitrine publique du club, sans authentification — cf. middleware.ts
// (exception "/club/") et RLS "site_pages_select_public" / "site_settings_select_public".
export default async function ClubPublicSitePage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants_public")
    .select("id, name, logo_url")
    .eq("slug", clubSlug)
    .maybeSingle();

  if (!tenant) notFound();

  const [{ data: settings }, { data: heroPage }, { data: sponsors }] = await Promise.all([
    supabase.from("site_settings").select("primary_color, secondary_color").eq("tenant_id", tenant.id).maybeSingle(),
    supabase.from("site_pages").select("content").eq("tenant_id", tenant.id).eq("slug", "accueil").maybeSingle(),
    supabase
      .from("sponsors")
      .select("id, name, logo_url, website_url, tier, visible_from, visible_to")
      .eq("tenant_id", tenant.id),
  ]);

  const hero = (heroPage?.content ?? {}) as HeroContent;
  const primaryColor = settings?.primary_color ?? "#2563eb";

  const now = Date.now();
  const visibleSponsors = (sponsors ?? [])
    .filter((s) => {
      if (s.visible_from && new Date(s.visible_from).getTime() > now) return false;
      if (s.visible_to && new Date(s.visible_to).getTime() < now) return false;
      return true;
    })
    .sort((a, b) => (tierOrder[a.tier ?? "bronze"] ?? 3) - (tierOrder[b.tier ?? "bronze"] ?? 3));

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          {tenant.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tenant.logo_url} alt={tenant.name} className="h-10 w-10 rounded object-contain" />
          ) : null}
          <p className="text-lg font-semibold text-ink">{tenant.name}</p>
        </div>
      </header>

      <section className="px-6 py-16 text-center" style={{ background: `linear-gradient(135deg, ${primaryColor}11, transparent)` }}>
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-ink sm:text-4xl">{hero.title || tenant.name}</h1>
          {hero.body && <p className="mt-4 text-slate-500">{hero.body}</p>}
        </div>
      </section>

      {visibleSponsors.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-wide text-slate-400">
            Nos partenaires
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {visibleSponsors.map((s) => (
              <a
                key={s.id}
                href={s.website_url ?? undefined}
                target={s.website_url ? "_blank" : undefined}
                rel="noreferrer"
                className="flex flex-col items-center gap-2"
                title={tierLabel[s.tier ?? "bronze"]}
              >
                {s.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.logo_url} alt={s.name} className="h-12 w-24 object-contain grayscale hover:grayscale-0" />
                ) : (
                  <span className="text-sm font-medium text-slate-600">{s.name}</span>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-slate-100 px-6 py-6 text-center text-xs text-slate-400">
        Propulsé par ClubOS
      </footer>
    </div>
  );
}
