"use client";

import { useState } from "react";
import Link from "next/link";
import { CreateTeamForm } from "./CreateTeamForm";

interface Team {
  id: string;
  name: string;
  category: string;
  sportName: string | null;
  memberCount: number;
}

export function EquipesList({
  clubSlug,
  tenantId,
  defaultSportId,
  sports,
  initialTeams,
}: {
  clubSlug: string;
  tenantId: string;
  defaultSportId: string | null;
  sports: { id: string; name: string }[];
  initialTeams: Team[];
}) {
  const [teams, setTeams] = useState(initialTeams);

  return (
    <div className="flex flex-col gap-6">
      <CreateTeamForm
        tenantId={tenantId}
        defaultSportId={defaultSportId}
        sports={sports}
        onCreated={(team) =>
          setTeams((prev) => [
            ...prev,
            { id: team.id, name: team.name, category: team.category, sportName: null, memberCount: 0 },
          ])
        }
      />

      {teams.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/${clubSlug}/equipes/${team.id}`}
              className="rounded-lg border border-slate-200 bg-white p-4 hover:border-brand-300 hover:shadow-sm"
            >
              <p className="font-semibold text-ink">{team.name}</p>
              <p className="mt-1 text-sm text-slate-500">
                {team.sportName ?? team.category} · {team.memberCount} licenciés
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">Aucune équipe pour l&apos;instant.</p>
      )}
    </div>
  );
}
