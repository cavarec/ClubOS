"use client";

import { useMemo, useState } from "react";
import { PresenceToggle } from "@clubos/ui";
import type { PresenceStatus } from "@clubos/database";
import { mockEvents, mockRosterByTeam } from "@/lib/mock-data";

export default function PresencesPage() {
  const [eventId, setEventId] = useState(mockEvents[0].id);
  const [statuses, setStatuses] = useState<Record<string, PresenceStatus>>({});

  const event = mockEvents.find((e) => e.id === eventId)!;
  const roster = useMemo(() => mockRosterByTeam[event.teamId] ?? [], [event.teamId]);

  const presentCount = roster.filter((p) => statuses[p.id] === "present").length;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Présences</h1>

      <select
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
        className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      >
        {mockEvents.map((e) => (
          <option key={e.id} value={e.id}>
            {e.title} — {new Date(e.startAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
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
        {roster.map((p) => (
          <PresenceToggle
            key={p.id}
            firstName={p.firstName}
            lastName={p.lastName}
            status={statuses[p.id] ?? null}
            onChange={(status) => setStatuses((prev) => ({ ...prev, [p.id]: status }))}
          />
        ))}
      </div>
    </div>
  );
}
