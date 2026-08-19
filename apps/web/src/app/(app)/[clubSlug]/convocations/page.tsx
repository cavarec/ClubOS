"use client";

import { useState } from "react";
import { ConvocationCard } from "@clubos/ui";
import type { ConvocationResponseStatus } from "@clubos/database";

// Données de démonstration — à remplacer par une requête Supabase
// (`convocations` + `convocation_responses` filtrées par RLS) une fois
// un projet Supabase connecté.
const mockConvocations = [
  {
    id: "1",
    eventTitle: "U15M vs AL Landerneau",
    eventLocation: "Gymnase Kervao, Lesneven",
    startAt: "2026-08-23T14:00:00",
    meetTime: "13h15",
    status: "pending" as ConvocationResponseStatus,
    carpoolSeatsAvailable: 2,
  },
  {
    id: "2",
    eventTitle: "Entraînement U15M",
    eventLocation: "Gymnase Kervao",
    startAt: "2026-08-20T18:30:00",
    status: "present" as ConvocationResponseStatus,
  },
];

export default function ConvocationsPage() {
  const [convocations, setConvocations] = useState(mockConvocations);

  function respond(id: string, status: "present" | "absent" | "maybe") {
    setConvocations((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Convocations</h1>
      <div className="flex flex-col gap-4">
        {convocations.map((c) => (
          <ConvocationCard
            key={c.id}
            eventTitle={c.eventTitle}
            eventLocation={c.eventLocation}
            startAt={c.startAt}
            meetTime={c.meetTime}
            myStatus={c.status}
            carpoolSeatsAvailable={c.carpoolSeatsAvailable}
            onRespond={(status) => respond(c.id, status)}
          />
        ))}
      </div>
    </div>
  );
}
