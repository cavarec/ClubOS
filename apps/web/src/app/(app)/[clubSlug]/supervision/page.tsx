import { notFound } from "next/navigation";
import Link from "next/link";
import { StatTile } from "@clubos/ui";
import { createClient } from "@/lib/supabase/server";

// Vue d'ensemble pour les tenants de type committee/league/federation : liste
// des clubs rattachés directement (parent_id), avec quelques compteurs par
// club. RLS (is_supervised_tenant) donne déjà l'accès en lecture aux données
// de ces clubs pour un committee_admin/league_admin/federation_admin.
export default async function SupervisionPage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase.from("tenants").select("id, name, type").eq("slug", clubSlug).maybeSingle();
  if (!tenant) notFound();

  if (tenant.type === "club") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-ink">Supervision</h1>
        <p className="text-sm text-slate-500">
          Cette vue est réservée aux comités, ligues et fédérations qui supervisent plusieurs clubs.
        </p>
      </div>
    );
  }

  const { data: children } = await supabase
    .from("tenants")
    .select("id, name, slug")
    .eq("parent_id", tenant.id)
    .order("name", { ascending: true });

  const clubs = children ?? [];

  const stats = await Promise.all(
    clubs.map(async (club) => {
      const [{ count: membres }, { count: equipes }] = await Promise.all([
        supabase.from("memberships").select("*", { count: "exact", head: true }).eq("tenant_id", club.id).eq("status", "active"),
        supabase.from("teams").select("*", { count: "exact", head: true }).eq("tenant_id", club.id),
      ]);
      return { ...club, membres: membres ?? 0, equipes: equipes ?? 0 };
    })
  );

  const totalMembres = stats.reduce((sum, c) => sum + c.membres, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Supervision</h1>
        <p className="text-sm text-slate-500">{tenant.name} — clubs rattachés</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Clubs rattachés" value={clubs.length} />
        <StatTile label="Licenciés cumulés" value={totalMembres} />
      </div>

      {stats.length > 0 ? (
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {stats.map((club) => (
            <Link
              key={club.id}
              href={`/${club.slug}/dashboard`}
              className="flex items-center justify-between p-4 hover:bg-slate-50"
            >
              <p className="font-medium text-ink">{club.name}</p>
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <span>{club.membres} licenciés</span>
                <span>{club.equipes} équipes</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">Aucun club rattaché pour l&apos;instant.</p>
      )}
    </div>
  );
}
