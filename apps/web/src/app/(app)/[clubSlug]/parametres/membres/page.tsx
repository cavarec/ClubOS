"use client";

import { useState } from "react";
import { Avatar, Badge, Button } from "@clubos/ui";
import { mockMembers } from "@/lib/mock-data";

const roleLabel: Record<string, string> = {
  player: "Joueur",
  parent: "Parent",
  coach: "Entraîneur",
  director: "Dirigeant",
  club_admin: "Admin club",
};

export default function MembresPage() {
  const inviteCode = "HBCL-7F2K";
  const [copied, setCopied] = useState(false);

  function copyInvite() {
    navigator.clipboard?.writeText(`https://clubos.fr/join/${inviteCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Membres du club</h1>

      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <p className="font-medium text-ink">Inviter un membre</p>
          <p className="text-sm text-slate-500">
            Code d&apos;invitation : <code className="rounded bg-slate-100 px-1.5 py-0.5">{inviteCode}</code>
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={copyInvite}>
          {copied ? "Lien copié ✓" : "Copier le lien"}
        </Button>
      </div>

      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {mockMembers.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <Avatar firstName={m.firstName} lastName={m.lastName} size="md" />
              <p className="font-medium text-ink">
                {m.firstName} {m.lastName}
              </p>
            </div>
            <Badge variant="brand">{roleLabel[m.role] ?? m.role}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
