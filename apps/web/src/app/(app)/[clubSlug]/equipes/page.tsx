import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EquipesList } from "./EquipesList";

export default async function EquipesPage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase.from("tenants").select("id, sport_id").eq("slug", clubSlug).maybeSingle();
  if (!tenant) notFound();

  const [{ data: teams }, { data: sports }] = await Promise.all([
    supabase
      .from("teams")
      .select("id, name, category, sport:sports(name), team_members(count)")
      .eq("tenant_id", tenant.id)
      .order("name"),
    supabase.from("sports").select("id, name").order("name"),
  ]);

  const initialTeams = (teams ?? []).map((team) => ({
    id: team.id,
    name: team.name,
    category: team.category,
    sportName: (team.sport as unknown as { name: string } | null)?.name ?? null,
    memberCount: (team.team_members as unknown as { count: number }[])[0]?.count ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Équipes</h1>
      <EquipesList
        clubSlug={clubSlug}
        tenantId={tenant.id}
        defaultSportId={tenant.sport_id}
        sports={sports ?? []}
        initialTeams={initialTeams}
      />
    </div>
  );
}
