"use client";

import { useEffect, useState } from "react";
import { PresenceToggle } from "@clubos/ui";
import type { PresenceStatus } from "@clubos/database";
import { createClient } from "@/lib/supabase/client";

interface EventItem {
  id: string;
  title: string;
  start_at: string;
  team_id: string;
}

interface RosterPlayer {
  id: string;
  firstName: string;
  lastName: string;
}

export function PresencesClient({ events }: { events: EventItem[] }) {
  const [eventId, setEventId] = useState(events[0].id);
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [statuses, setStatuses] = useState<Record<string, PresenceStatus>>({});
  const [loading, setLoading] = useState(true);

  const event = events.find((e) => e.id === eventId)!;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      const supabase = createClient();

      const [{ data: members }, { data: presences }] = await Promise.all([
        supabase
          .from("team_members")
          .select("profile:profiles(id, first_name, last_name)")
          .eq("team_id", event.team_id)
          .eq("role", "player"),
        supabase.from("presences").select("user_id, status").eq("event_id", eventId),
      ]);

      if (cancelled) return;

      const players = (members ?? []).map((m) => {
        const p = m.profile as unknown as { id: string; first_name: string; last_name: string };
        return { id: p.id, firstName: p.first_name, lastName: p.last_name };
      });

      const statusMap: Record<string, PresenceStatus> = {};
      for (const p of presences ?? []) {
        statusMap[p.user_id] = p.status as PresenceStatus;
      }

      setRoster(players);
      setStatuses(statusMap);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [eventId, event.team_id]);

  async function handleChange(playerId: string, status: PresenceStatus) {
    setStatuses((prev) => ({ ...prev, [playerId]: status }));

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("presences").upsert(
      {
        event_id: eventId,
        user_id: playerId,
        status,
        recorded_by: user.id,
        recorded_at: new Date().toISOString(),
      },
      { onConflict: "event_id,user_id" }
    );
  }

  const presentCount = roster.filter((p) => statuses[p.id] === "present").length;

  return (
    <>
      <select
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
        className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      >
        {events.map((e) => (
          <option key={e.id} value={e.id}>
            {e.title} — {new Date(e.start_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </option>
        ))}
      </select>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-semibold text-ink">{event.title}</p>
          <p className="text-sm text-slate-500">
            {presentCount}/{roster.length} présents
          </p>
        </div>
        {loading ? (
          <p className="text-sm text-slate-400">Chargement…</p>
        ) : roster.length > 0 ? (
          roster.map((p) => (
            <PresenceToggle
              key={p.id}
              firstName={p.firstName}
              lastName={p.lastName}
              status={statuses[p.id] ?? null}
              onChange={(status) => handleChange(p.id, status)}
            />
          ))
        ) : (
          <p className="text-sm text-slate-400">Aucun joueur dans cette équipe.</p>
        )}
      </div>
    </>
  );
}
