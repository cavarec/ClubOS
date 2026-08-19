"use client";

import { useState } from "react";
import { ConvocationCard } from "@clubos/ui";
import type { ConvocationResponseStatus } from "@clubos/database";
import { createClient } from "@/lib/supabase/client";

interface ConvocationItem {
  convocationId: string;
  eventTitle: string;
  eventLocation: string | null;
  startAt: string;
  status: ConvocationResponseStatus;
  carpoolSeatsAvailable?: number;
}

export function ConvocationsList({
  initialConvocations,
  userId,
}: {
  initialConvocations: ConvocationItem[];
  userId: string;
}) {
  const [convocations, setConvocations] = useState(initialConvocations);

  async function respond(convocationId: string, status: "present" | "absent" | "maybe") {
    setConvocations((prev) => prev.map((c) => (c.convocationId === convocationId ? { ...c, status } : c)));

    const supabase = createClient();
    const { error } = await supabase
      .from("convocation_responses")
      .update({ status, responded_at: new Date().toISOString() })
      .eq("convocation_id", convocationId)
      .eq("user_id", userId);

    if (error) {
      // rollback en cas d'échec réseau/RLS
      setConvocations(initialConvocations);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {convocations.map((c) => (
        <ConvocationCard
          key={c.convocationId}
          eventTitle={c.eventTitle}
          eventLocation={c.eventLocation}
          startAt={c.startAt}
          myStatus={c.status}
          carpoolSeatsAvailable={c.carpoolSeatsAvailable}
          onRespond={(status) => respond(c.convocationId, status)}
        />
      ))}
    </div>
  );
}
