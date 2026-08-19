"use client";

import { useState } from "react";
import { Avatar, Badge } from "@clubos/ui";
import { mockMembers } from "@/lib/mock-data";

const roleLabel: Record<string, string> = {
  player: "Joueur",
  parent: "Parent",
  coach: "Entraîneur",
  director: "Dirigeant",
  club_admin: "Admin club",
};

const certificateBadge = {
  ok: { label: "Certificat à jour", variant: "success" as const },
  expiring: { label: "Certificat expire bientôt", variant: "warning" as const },
  expired: { label: "Certificat expiré", variant: "danger" as const },
};

export default function AdherentsPage() {
  const [query, setQuery] = useState("");

  const filtered = mockMembers.filter((m) =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Adhérents</h1>
        <span className="text-sm text-slate-500">{mockMembers.length} licenciés</span>
      </div>

      <input
        type="search"
        placeholder="Rechercher un adhérent…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      />

      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {filtered.map((m) => {
          const cert = certificateBadge[m.certificateStatus];
          return (
            <div key={m.id} className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <Avatar firstName={m.firstName} lastName={m.lastName} size="md" />
                <div>
                  <p className="font-medium text-ink">
                    {m.firstName} {m.lastName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {roleLabel[m.role] ?? m.role} · {m.team}
                  </p>
                </div>
              </div>
              <Badge variant={cert.variant}>{cert.label}</Badge>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="p-4 text-sm text-slate-500">Aucun adhérent trouvé.</p>}
      </div>
    </div>
  );
}
