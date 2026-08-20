"use client";

import { useState } from "react";
import { Avatar, Badge, Button } from "@clubos/ui";
import { createClient } from "@/lib/supabase/client";

const roleLabel: Record<string, string> = { player: "Joueur", coach: "Entraîneur", manager: "Manager" };

interface RosterEntry {
  teamMemberId: string;
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AvailableMember {
  id: string;
  firstName: string;
  lastName: string;
}

export function RosterManager({
  teamId,
  initialRoster,
  availableMembers,
}: {
  teamId: string;
  initialRoster: RosterEntry[];
  availableMembers: AvailableMember[];
}) {
  const [roster, setRoster] = useState(initialRoster);
  const [available, setAvailable] = useState(availableMembers);
  const [selectedId, setSelectedId] = useState(availableMembers[0]?.id ?? "");
  const [role, setRole] = useState("player");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setStatus("saving");

    const supabase = createClient();
    const { data, error } = await supabase
      .from("team_members")
      .insert({ team_id: teamId, user_id: selectedId, role })
      .select("id, role, profile:profiles(id, first_name, last_name)")
      .single();

    if (error || !data) {
      setStatus("error");
      return;
    }

    const profile = data.profile as unknown as { id: string; first_name: string; last_name: string };
    setRoster((prev) => [
      ...prev,
      { teamMemberId: data.id, id: profile.id, firstName: profile.first_name, lastName: profile.last_name, role: data.role },
    ]);
    setAvailable((prev) => prev.filter((m) => m.id !== selectedId));
    setSelectedId((prev) => available.find((m) => m.id !== prev)?.id ?? "");
    setStatus("idle");
  }

  async function handleRemove(entry: RosterEntry) {
    const supabase = createClient();
    const { error } = await supabase.from("team_members").delete().eq("id", entry.teamMemberId);
    if (!error) {
      setRoster((prev) => prev.filter((r) => r.teamMemberId !== entry.teamMemberId));
      setAvailable((prev) => [...prev, { id: entry.id, firstName: entry.firstName, lastName: entry.lastName }]);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {available.length > 0 && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-4">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          >
            {available.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName}
              </option>
            ))}
          </select>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="player">Joueur</option>
            <option value="coach">Entraîneur</option>
            <option value="manager">Manager</option>
          </select>
          <Button type="submit" size="sm" disabled={status === "saving"}>
            {status === "saving" ? "Ajout…" : "Ajouter à l'équipe"}
          </Button>
          {status === "error" && <span className="text-sm text-red-600">Vous n&apos;avez pas les droits pour gérer cette équipe.</span>}
        </form>
      )}

      <div className="rounded-lg border border-slate-200 bg-white">
        {roster.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {roster.map((r) => (
              <li key={r.teamMemberId} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <Avatar firstName={r.firstName} lastName={r.lastName} size="sm" />
                  <p className="text-sm font-medium text-ink">
                    {r.firstName} {r.lastName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {r.role !== "player" && <Badge variant="brand">{roleLabel[r.role] ?? r.role}</Badge>}
                  <button onClick={() => handleRemove(r)} className="text-xs text-red-600 hover:underline">
                    Retirer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 text-sm text-slate-400">Aucun membre dans cette équipe pour l&apos;instant.</p>
        )}
      </div>
    </div>
  );
}
