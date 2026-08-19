import { notFound } from "next/navigation";
import { Badge } from "@clubos/ui";
import { createClient } from "@/lib/supabase/server";
import type { EventType } from "@clubos/database";

const typeLabel: Record<EventType, string> = { match: "Match", training: "Entraînement", other: "Événement" };
const typeVariant: Record<EventType, "brand" | "neutral"> = { match: "brand", training: "neutral", other: "neutral" };

export default async function CalendrierPage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", clubSlug).maybeSingle();
  if (!tenant) notFound();

  const { data: teams } = await supabase.from("teams").select("id, name").eq("tenant_id", tenant.id);
  const teamNameById = new Map((teams ?? []).map((t) => [t.id, t.name]));
  const teamIds = (teams ?? []).map((t) => t.id);

  const { data: events } = teamIds.length
    ? await supabase
        .from("events")
        .select("id, type, title, start_at, location, team_id")
        .in("team_id", teamIds)
        .order("start_at")
    : { data: [] };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Calendrier</h1>
      {events && events.length > 0 ? (
        <div className="flex flex-col divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {events.map((event) => {
            const date = new Date(event.start_at);
            const type = event.type as EventType;
            return (
              <div key={event.id} className="flex items-center gap-4 p-4">
                <div className="flex w-16 flex-col items-center rounded-md bg-slate-50 py-2 text-center">
                  <span className="text-xs uppercase text-slate-500">
                    {date.toLocaleDateString("fr-FR", { month: "short" })}
                  </span>
                  <span className="text-lg font-semibold text-ink">{date.getDate()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{event.title}</p>
                    <Badge variant={typeVariant[type]}>{typeLabel[type]}</Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    {teamNameById.get(event.team_id)} ·{" "}
                    {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-400">Aucun événement à venir.</p>
      )}
    </div>
  );
}
