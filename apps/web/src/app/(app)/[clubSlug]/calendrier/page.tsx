import { Badge } from "@clubos/ui";
import { mockEvents } from "@/lib/mock-data";

const typeLabel = { match: "Match", training: "Entraînement", other: "Événement" } as const;
const typeVariant = { match: "brand", training: "neutral", other: "neutral" } as const;

export default async function CalendrierPage() {
  const sorted = [...mockEvents].sort((a, b) => a.startAt.localeCompare(b.startAt));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Calendrier</h1>
      <div className="flex flex-col divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {sorted.map((event) => {
          const date = new Date(event.startAt);
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
                  <Badge variant={typeVariant[event.type]}>{typeLabel[event.type]}</Badge>
                </div>
                <p className="text-sm text-slate-500">
                  {event.teamName} · {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} ·{" "}
                  {event.location}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
