import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PresencesClient } from "./PresencesClient";

export default async function PresencesPage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", clubSlug).maybeSingle();
  if (!tenant) notFound();

  const { data: teams } = await supabase.from("teams").select("id").eq("tenant_id", tenant.id);
  const teamIds = (teams ?? []).map((t) => t.id);

  const { data: events } = teamIds.length
    ? await supabase
        .from("events")
        .select("id, title, start_at, team_id")
        .in("team_id", teamIds)
        .order("start_at", { ascending: false })
    : { data: [] };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Présences</h1>
      {events && events.length > 0 ? (
        <PresencesClient events={events} />
      ) : (
        <p className="text-sm text-slate-400">Aucun événement pour l&apos;instant.</p>
      )}
    </div>
  );
}
