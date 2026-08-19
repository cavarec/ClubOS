import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function EquipesPage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", clubSlug).maybeSingle();
  if (!tenant) notFound();

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, category, sport:sports(name), team_members(count)")
    .eq("tenant_id", tenant.id)
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Équipes</h1>
      {teams && teams.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/${clubSlug}/equipes/${team.id}`}
              className="rounded-lg border border-slate-200 bg-white p-4 hover:border-brand-300 hover:shadow-sm"
            >
              <p className="font-semibold text-ink">{team.name}</p>
              <p className="mt-1 text-sm text-slate-500">
                {(team.sport as unknown as { name: string } | null)?.name ?? team.category} ·{" "}
                {(team.team_members as unknown as { count: number }[])[0]?.count ?? 0} licenciés
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">Aucune équipe pour l&apos;instant.</p>
      )}
    </div>
  );
}
