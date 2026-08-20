"use client";

import { useState } from "react";
import { Badge } from "@clubos/ui";
import { CreateEventForm } from "./CreateEventForm";
import type { EventType } from "@clubos/database";

const typeLabel: Record<EventType, string> = { match: "Match", training: "Entraînement", other: "Événement" };
const typeVariant: Record<EventType, "brand" | "neutral"> = { match: "brand", training: "neutral", other: "neutral" };

interface EventItem {
  id: string;
  type: string;
  title: string;
  start_at: string;
  location: string | null;
  team_id: string;
}

export function CalendrierClient({
  teams,
  teamNameById,
  initialEvents,
  convokedEventIds,
}: {
  teams: { id: string; name: string }[];
  teamNameById: Record<string, string>;
  initialEvents: EventItem[];
  convokedEventIds: string[];
}) {
  const [events, setEvents] = useState(initialEvents);
  const [convoked, setConvoked] = useState(new Set(convokedEventIds));
  const [convokingId, setConvokingId] = useState<string | null>(null);

  async function handleConvoke(event: EventItem) {
    setConvokingId(event.id);

    const res = await fetch("/api/convocations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: event.id }),
    });

    if (!res.ok) {
      setConvokingId(null);
      return;
    }

    setConvoked((prev) => new Set(prev).add(event.id));
    setConvokingId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <CreateEventForm teams={teams} onCreated={(event) => setEvents((prev) => [...prev, event as EventItem])} />

      {events.length > 0 ? (
        <div className="flex flex-col divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {events.map((event) => {
            const date = new Date(event.start_at);
            const type = event.type as EventType;
            const isConvoked = convoked.has(event.id);
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
                    {teamNameById[event.team_id]} ·{" "}
                    {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                </div>
                {isConvoked ? (
                  <Badge variant="success">Convoqué</Badge>
                ) : (
                  <button
                    onClick={() => handleConvoke(event)}
                    disabled={convokingId === event.id}
                    className="text-sm text-brand-600 hover:underline disabled:opacity-50"
                  >
                    {convokingId === event.id ? "Envoi…" : "Convoquer les joueurs"}
                  </button>
                )}
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
