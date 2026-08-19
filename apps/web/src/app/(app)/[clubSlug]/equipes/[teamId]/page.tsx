import { notFound } from "next/navigation";
import { PlayerRoster } from "@clubos/ui";
import { mockTeams, mockRosterByTeam } from "@/lib/mock-data";

export default async function EquipeDetailPage({
  params,
}: {
  params: Promise<{ clubSlug: string; teamId: string }>;
}) {
  const { teamId } = await params;
  const team = mockTeams.find((t) => t.id === teamId);
  const roster = mockRosterByTeam[teamId] ?? [];

  if (!team) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{team.name}</h1>
        <p className="text-sm text-slate-500">
          {team.sport} · {roster.length} membres
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <PlayerRoster players={roster} />
      </div>
    </div>
  );
}
