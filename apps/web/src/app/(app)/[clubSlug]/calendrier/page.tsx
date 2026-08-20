import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CalendrierClient } from "./CalendrierClient";

export default async function CalendrierPage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", clubSlug).maybeSingle();
  if (!tenant) notFound();

  const { data: teams } = await supabase.from("teams").select("id, name").eq("tenant_id", tenant.id).order("name");
  const teamNameById: Record<string, string> = Object.fromEntries((teams ?? []).map((t) => [t.id, t.name]));
  const teamIds = (teams ?? []).map((t) => t.id);

  const { data: events } = teamIds.length
    ? await supabase
        .from("events")
        .select("id, type, title, start_at, location, team_id")
        .in("team_id", teamIds)
        .order("start_at")
    : { data: [] };

  const eventIds = (events ?? []).map((e) => e.id);
  const { data: convocations } = eventIds.length
    ? await supabase.from("convocations").select("event_id").in("event_id", eventIds)
    : { data: [] };

  const convokedEventIds = (convocations ?? []).map((c) => c.event_id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Calendrier</h1>
      <CalendrierClient
        teams={teams ?? []}
        teamNameById={teamNameById}
        initialEvents={events ?? []}
        convokedEventIds={convokedEventIds}
      />
    </div>
  );
}
