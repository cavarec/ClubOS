import Link from "next/link";
import { mockTeams } from "@/lib/mock-data";

export default async function EquipesPage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Équipes</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {mockTeams.map((team) => (
          <Link
            key={team.id}
            href={`/${clubSlug}/equipes/${team.id}`}
            className="rounded-lg border border-slate-200 bg-white p-4 hover:border-brand-300 hover:shadow-sm"
          >
            <p className="font-semibold text-ink">{team.name}</p>
            <p className="mt-1 text-sm text-slate-500">
              {team.sport} · {team.memberCount} licenciés
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
