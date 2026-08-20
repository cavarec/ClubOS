"use client";

import { useState } from "react";
import { Button } from "@clubos/ui";
import { createClient } from "@/lib/supabase/client";

interface TeamOption {
  id: string;
  name: string;
}

const inputClass = "rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

export function CreateEventForm({
  teams,
  onCreated,
}: {
  teams: TeamOption[];
  onCreated: (event: {
    id: string;
    type: string;
    title: string;
    start_at: string;
    location: string | null;
    team_id: string;
  }) => void;
}) {
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
  const [type, setType] = useState("training");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:30");
  const [location, setLocation] = useState("");
  const [opponent, setOpponent] = useState("");
  const [isHome, setIsHome] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId || !date) return;
    setStatus("saving");

    const supabase = createClient();
    const startAt = new Date(`${date}T${startTime}`).toISOString();
    const endAt = new Date(`${date}T${endTime}`).toISOString();

    const { data, error } = await supabase
      .from("events")
      .insert({
        team_id: teamId,
        type,
        title: title || (type === "match" ? `Match vs ${opponent || "?"}` : type === "training" ? "Entraînement" : "Événement"),
        start_at: startAt,
        end_at: endAt,
        location: location || null,
        opponent: type === "match" ? opponent || null : null,
        is_home: type === "match" ? isHome : null,
      })
      .select("id, type, title, start_at, location, team_id")
      .single();

    if (error || !data) {
      setStatus("error");
      return;
    }

    onCreated(data);
    setTitle("");
    setDate("");
    setLocation("");
    setOpponent("");
    setStatus("idle");
  }

  return (
    <details className="rounded-lg border border-slate-200 bg-white p-4">
      <summary className="cursor-pointer text-sm font-medium text-ink">Créer un événement</summary>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className={inputClass}>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            <option value="training">Entraînement</option>
            <option value="match">Match</option>
            <option value="other">Autre</option>
          </select>
          <input
            placeholder="Titre (optionnel)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
          <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass} />
          <input
            placeholder="Lieu"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass}
          />
          {type === "match" && (
            <>
              <input
                placeholder="Adversaire"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                className={inputClass}
              />
              <select value={isHome ? "home" : "away"} onChange={(e) => setIsHome(e.target.value === "home")} className={inputClass}>
                <option value="home">Domicile</option>
                <option value="away">Extérieur</option>
              </select>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={status === "saving" || !teamId}>
            {status === "saving" ? "Création…" : "Créer"}
          </Button>
          {status === "error" && <span className="text-sm text-red-600">Vous n&apos;avez pas les droits pour créer un événement.</span>}
          {teams.length === 0 && <span className="text-sm text-slate-400">Crée d&apos;abord une équipe.</span>}
        </div>
      </form>
    </details>
  );
}
