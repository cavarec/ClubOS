"use client";

import { useState } from "react";
import { Button } from "@clubos/ui";
import { createClient } from "@/lib/supabase/client";

interface TenantSettings {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  siret: string | null;
}

export function GeneralSettingsForm({ tenant }: { tenant: TenantSettings }) {
  const [name, setName] = useState(tenant.name);
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url ?? "");
  const [siret, setSiret] = useState(tenant.siret ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError("");

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("tenants")
      .update({ name, logo_url: logoUrl || null, siret: siret || null })
      .eq("id", tenant.id);

    if (updateError) {
      setError("Vous n'avez pas les droits pour modifier les paramètres du club.");
      setStatus("error");
      return;
    }

    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6">
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="name">
          Nom du club
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="slug">
          Identifiant (URL)
        </label>
        <input
          id="slug"
          value={tenant.slug}
          disabled
          className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
        />
        <p className="mt-1 text-xs text-slate-400">L&apos;identifiant ne peut pas être modifié pour l&apos;instant.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="logoUrl">
          URL du logo
        </label>
        <input
          id="logoUrl"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://…"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="siret">
          SIRET
        </label>
        <input
          id="siret"
          value={siret}
          onChange={(e) => setSiret(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {status === "saved" && <span className="text-sm text-green-600">Enregistré ✓</span>}
        {status === "error" && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
