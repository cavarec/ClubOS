"use client";

import { useState } from "react";
import { Button, Badge } from "@clubos/ui";

const roleLabel: Record<string, string> = {
  player: "Joueur",
  parent: "Parent",
  coach: "Entraîneur",
  director: "Dirigeant",
  club_admin: "Admin club",
};

interface Invitation {
  code: string;
  role: string;
  used_count: number;
  max_uses: number | null;
  expires_at: string | null;
  created_at: string;
}

export function InviteGenerator({
  clubSlug,
  initialInvitations,
}: {
  clubSlug: string;
  initialInvitations: Invitation[];
}) {
  const [role, setRole] = useState("player");
  const [invitations, setInvitations] = useState(initialInvitations);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function generate() {
    setStatus("sending");
    setError("");

    const res = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clubSlug, role }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(typeof body.error === "string" ? body.error : "Vous n'avez pas les droits pour inviter des membres.");
      setStatus("idle");
      return;
    }

    const { invitation } = await res.json();
    setInvitations((prev) => [
      { code: invitation.code, role: invitation.role, used_count: 0, max_uses: null, expires_at: null, created_at: invitation.created_at },
      ...prev,
    ]);
    setStatus("idle");
  }

  function copyLink(code: string) {
    const url = `${window.location.origin}/join/${code}`;
    navigator.clipboard?.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="font-medium text-ink">Inviter un membre</p>
      <p className="text-sm text-slate-500">Génère un lien à usage unique pour le rôle choisi.</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          {Object.entries(roleLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button size="sm" onClick={generate} disabled={status === "sending"}>
          {status === "sending" ? "Génération…" : "Générer un lien"}
        </Button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {invitations.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {invitations.map((inv) => (
            <div key={inv.code} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <code className="text-sm font-semibold text-ink">{inv.code}</code>
                <Badge variant="neutral">{roleLabel[inv.role] ?? inv.role}</Badge>
                <span className="text-xs text-slate-400">{inv.used_count} utilisation(s)</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => copyLink(inv.code)}>
                {copiedCode === inv.code ? "Copié ✓" : "Copier le lien"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
