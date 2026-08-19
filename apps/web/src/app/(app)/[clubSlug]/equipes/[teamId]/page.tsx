import { notFound } from "next/navigation";
import { PlayerRoster } from "@clubos/ui";
import { createClient } from "@/lib/supabase/server";
import type { TeamMemberRole } from "@clubos/database";

export default async function EquipeDetailPage({
  params,
}: {
  params: Promise<{ clubSlug: string; teamId: string }>;
}) {
  const { teamId } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("id, name, category, sport:sports(name)")
    .eq("id", teamId)
    .maybeSingle();

  if (!team) notFound();

  const { data: members } = await supabase
    .from("team_members")
    .select("role, profile:profiles(id, first_name, last_name, avatar_url)")
    .eq("team_id", teamId);

  const roster = (members ?? []).map((m) => {
    const profile = m.profile as unknown as {
      id: string;
      first_name: string;
      last_name: string;
      avatar_url: string | null;
    };
    return {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      avatarUrl: profile.avatar_url,
      role: m.role as TeamMemberRole,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{team.name}</h1>
        <p className="text-sm text-slate-500">
          {(team.sport as unknown as { name: string } | null)?.name} · {roster.length} membres
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        {roster.length > 0 ? (
          <PlayerRoster players={roster} />
        ) : (
          <p className="text-sm text-slate-400">Aucun membre dans cette équipe pour l&apos;instant.</p>
        )}
      </div>
    </div>
  );
}
