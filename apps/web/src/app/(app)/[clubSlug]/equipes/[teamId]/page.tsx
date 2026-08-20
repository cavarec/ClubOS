import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RosterManager } from "./RosterManager";

export default async function EquipeDetailPage({
  params,
}: {
  params: Promise<{ clubSlug: string; teamId: string }>;
}) {
  const { teamId } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("id, name, category, tenant_id, sport:sports(name)")
    .eq("id", teamId)
    .maybeSingle();

  if (!team) notFound();

  const [{ data: members }, { data: clubMembers }] = await Promise.all([
    supabase
      .from("team_members")
      .select("id, role, profile:profiles(id, first_name, last_name, avatar_url)")
      .eq("team_id", teamId),
    supabase
      .from("memberships")
      .select("profile:profiles(id, first_name, last_name)")
      .eq("tenant_id", team.tenant_id)
      .eq("status", "active")
      .in("role", ["player", "coach"]),
  ]);

  type RawTeamMember = {
    id: string;
    role: string;
    profile: { id: string; first_name: string; last_name: string; avatar_url: string | null } | null;
  };
  type RawMembership = { profile: { id: string; first_name: string; last_name: string } | null };

  const roster = ((members ?? []) as unknown as RawTeamMember[])
    .filter((m) => m.profile)
    .map((m) => ({
      teamMemberId: m.id,
      id: m.profile!.id,
      firstName: m.profile!.first_name,
      lastName: m.profile!.last_name,
      role: m.role,
    }));

  const rosterProfileIds = new Set(roster.map((r) => r.id));
  const availableMembers = ((clubMembers ?? []) as unknown as RawMembership[])
    .filter((m) => m.profile && !rosterProfileIds.has(m.profile.id))
    .map((m) => ({ id: m.profile!.id, firstName: m.profile!.first_name, lastName: m.profile!.last_name }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{team.name}</h1>
        <p className="text-sm text-slate-500">
          {(team.sport as unknown as { name: string } | null)?.name} · {roster.length} membres
        </p>
      </div>

      <RosterManager teamId={team.id} initialRoster={roster} availableMembers={availableMembers} />
    </div>
  );
}
