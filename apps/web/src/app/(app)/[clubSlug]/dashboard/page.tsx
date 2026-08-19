import { notFound } from "next/navigation";
import { StatTile } from "@clubos/ui";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ clubSlug: string }>;
}) {
  const { clubSlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("slug", clubSlug)
    .maybeSingle();

  if (!tenant) notFound();

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [
    { count: licencies },
    { data: teamIds },
    { data: posts },
    { data: expiringDocs },
    { count: totalOrders },
    { count: paidOrders },
  ] = await Promise.all([
    supabase
      .from("memberships")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenant.id)
      .eq("status", "active"),
    supabase.from("teams").select("id").eq("tenant_id", tenant.id),
    supabase
      .from("posts")
      .select("id, title, created_at")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("documents")
      .select("id, owner_user_id, expires_at")
      .eq("tenant_id", tenant.id)
      .eq("category", "certificat_medical")
      .not("expires_at", "is", null)
      .lte("expires_at", in30Days),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenant.id),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenant.id)
      .eq("status", "paid"),
  ]);

  const ids = (teamIds ?? []).map((t) => t.id);
  const { count: convocationsSemaine } = ids.length
    ? await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .in("team_id", ids)
        .gte("start_at", now.toISOString())
        .lte("start_at", in7Days)
    : { count: 0 };

  const cotisationsAJour =
    totalOrders && totalOrders > 0 ? Math.round(((paidOrders ?? 0) / totalOrders) * 100) : null;

  const alertes = [
    ...(expiringDocs ?? []).map(
      (d) => `Un certificat médical expire avant le ${new Date(d.expires_at!).toLocaleDateString("fr-FR")}`
    ),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Tableau de bord</h1>
        <p className="text-sm text-slate-500">{tenant.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Licenciés actifs" value={licencies ?? 0} />
        <StatTile
          label="Cotisations à jour"
          value={cotisationsAJour === null ? "—" : `${cotisationsAJour}%`}
          tone="success"
        />
        <StatTile label="Alertes certificats" value={expiringDocs?.length ?? 0} tone="warning" />
        <StatTile label="Convocations cette semaine" value={convocationsSemaine ?? 0} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-semibold text-ink">Actualités récentes</h2>
          {posts && posts.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {posts.map((a) => (
                <li key={a.id} className="text-sm text-slate-700">
                  📰 {a.title}
                  <span className="ml-2 text-xs text-slate-400">
                    {new Date(a.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Aucune actualité publiée pour l&apos;instant.</p>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-semibold text-ink">Alertes</h2>
          {alertes.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {alertes.map((alerte, i) => (
                <li key={i} className="text-sm text-amber-700">
                  ⚠ {alerte}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Aucune alerte.</p>
          )}
        </section>
      </div>
    </div>
  );
}
