import { createClient } from "@/lib/supabase/server";
import { ConvocationsList } from "./ConvocationsList";

export default async function ConvocationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p className="text-sm text-slate-400">Non authentifié.</p>;
  }

  const { data: responses } = await supabase
    .from("convocation_responses")
    .select(
      `status, responded_at,
       convocation:convocations(
         id,
         event:events(id, title, start_at, location)
       )`
    )
    .eq("user_id", user.id);

  type RawResponse = {
    status: "pending" | "present" | "absent" | "maybe";
    convocation: { id: string; event: { id: string; title: string; start_at: string; location: string | null } } | null;
  };

  const rows = (responses ?? []) as unknown as RawResponse[];
  const eventIds = rows.map((r) => r.convocation?.event.id).filter((id): id is string => !!id);

  const { data: carpools } = eventIds.length
    ? await supabase.from("carpools").select("id, event_id, seats_total").in("event_id", eventIds)
    : { data: [] };

  const carpoolIds = (carpools ?? []).map((c) => c.id);
  const { data: bookings } = carpoolIds.length
    ? await supabase.from("carpool_bookings").select("carpool_id, seats_booked").in("carpool_id", carpoolIds)
    : { data: [] };

  const bookedByCarpool = new Map<string, number>();
  for (const b of bookings ?? []) {
    bookedByCarpool.set(b.carpool_id, (bookedByCarpool.get(b.carpool_id) ?? 0) + b.seats_booked);
  }
  const seatsAvailableByEvent = new Map<string, number>();
  for (const c of carpools ?? []) {
    const available = c.seats_total - (bookedByCarpool.get(c.id) ?? 0);
    seatsAvailableByEvent.set(c.event_id, (seatsAvailableByEvent.get(c.event_id) ?? 0) + Math.max(0, available));
  }

  const convocations = rows
    .filter((r) => r.convocation)
    .map((r) => ({
      convocationId: r.convocation!.id,
      eventTitle: r.convocation!.event.title,
      eventLocation: r.convocation!.event.location,
      startAt: r.convocation!.event.start_at,
      status: r.status,
      carpoolSeatsAvailable: seatsAvailableByEvent.get(r.convocation!.event.id),
    }))
    .sort((a, b) => a.startAt.localeCompare(b.startAt));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Convocations</h1>
      {convocations.length > 0 ? (
        <ConvocationsList initialConvocations={convocations} userId={user.id} />
      ) : (
        <p className="text-sm text-slate-400">Aucune convocation pour l&apos;instant.</p>
      )}
    </div>
  );
}
