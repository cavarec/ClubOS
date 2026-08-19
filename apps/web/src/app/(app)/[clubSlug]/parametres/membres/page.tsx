import { notFound } from "next/navigation";
import { Avatar, Badge } from "@clubos/ui";
import { createClient } from "@/lib/supabase/server";

const roleLabel: Record<string, string> = {
  player: "Joueur",
  parent: "Parent",
  coach: "Entraîneur",
  director: "Dirigeant",
  club_admin: "Admin club",
  committee_admin: "Admin comité",
  league_admin: "Admin ligue",
  federation_admin: "Admin fédération",
};

export default async function MembresPage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", clubSlug).maybeSingle();
  if (!tenant) notFound();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("role, profile:profiles(id, first_name, last_name, avatar_url)")
    .eq("tenant_id", tenant.id)
    .eq("status", "active");

  type RawMembership = {
    role: string;
    profile: { id: string; first_name: string; last_name: string; avatar_url: string | null } | null;
  };

  const members = ((memberships ?? []) as unknown as RawMembership[]).filter((m) => m.profile);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Membres du club</h1>

      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="text-sm text-slate-500">
          L&apos;invitation par code n&apos;est pas encore implémentée (nécessite une table
          d&apos;invitations dédiée) — pour l&apos;instant, les membres doivent être créés via
          l&apos;onboarding ou directement en base.
        </p>
      </div>

      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {members.map((m) => (
          <div key={m.profile!.id} className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <Avatar firstName={m.profile!.first_name} lastName={m.profile!.last_name} avatarUrl={m.profile!.avatar_url} size="md" />
              <p className="font-medium text-ink">
                {m.profile!.first_name} {m.profile!.last_name}
              </p>
            </div>
            <Badge variant="brand">{roleLabel[m.role] ?? m.role}</Badge>
          </div>
        ))}
        {members.length === 0 && <p className="p-4 text-sm text-slate-500">Aucun membre pour l&apos;instant.</p>}
      </div>
    </div>
  );
}
