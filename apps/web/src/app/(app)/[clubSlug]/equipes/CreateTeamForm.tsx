"use client";

import { useState } from "react";
import { Button } from "@clubos/ui";
import { createClient } from "@/lib/supabase/client";
import { currentSeasonLabel } from "@/lib/season";

interface Sport {
  id: string;
  name: string;
}

export function CreateTeamForm({
  tenantId,
  defaultSportId,
  sports,
  onCreated,
}: {
  tenantId: string;
  defaultSportId: string | null;
  sports: Sport[];
  onCreated: (team: { id: string; name: string; category: string }) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [sportId, setSportId] = useState(defaultSportId ?? sports[0]?.id ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError("");

    const supabase = createClient();
    const season = currentSeasonLabel();

    let { data: seasonRow } = await supabase
      .from("seasons")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("label", season.label)
      .maybeSingle();

    if (!seasonRow) {
      const { data: newSeason, error: seasonError } = await supabase
        .from("seasons")
        .insert({ tenant_id: tenantId, label: season.label, start_date: season.startDate, end_date: season.endDate })
        .select("id")
        .single();
      if (seasonError || !newSeason) {
        setError("Impossible de créer la saison courante.");
        setStatus("error");
        return;
      }
      seasonRow = newSeason;
    }

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({ tenant_id: tenantId, sport_id: sportId, season_id: seasonRow.id, name, category })
      .select("id, name, category")
      .single();

    if (teamError || !team) {
      setError("Vous n'avez pas les droits pour créer une équipe.");
      setStatus("error");
      return;
    }

    onCreated(team);
    setName("");
    setCategory("");
    setStatus("idle");
  }

  return (
    <details className="rounded-lg border border-slate-200 bg-white p-4">
      <summary className="cursor-pointer text-sm font-medium text-ink">Créer une équipe</summary>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            required
            placeholder="Nom (ex: Seniors A)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <input
            required
            placeholder="Catégorie (ex: U15 M)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <select
            value={sportId}
            onChange={(e) => setSportId(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          >
            {sports.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={status === "saving"}>
            {status === "saving" ? "Création…" : "Créer"}
          </Button>
          {status === "error" && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
    </details>
  );
}
