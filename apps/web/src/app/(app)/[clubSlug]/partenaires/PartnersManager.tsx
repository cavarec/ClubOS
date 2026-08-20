"use client";

import { useState } from "react";
import { Button, Badge } from "@clubos/ui";
import { createClient } from "@/lib/supabase/client";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  tier: string | null;
  visible_from: string | null;
  visible_to: string | null;
}

const tierLabel: Record<string, string> = { or: "Or", argent: "Argent", bronze: "Bronze" };
const tierVariant: Record<string, "brand" | "neutral" | "warning"> = { or: "warning", argent: "neutral", bronze: "brand" };

function isCurrentlyVisible(s: Sponsor): boolean {
  const now = Date.now();
  if (s.visible_from && new Date(s.visible_from).getTime() > now) return false;
  if (s.visible_to && new Date(s.visible_to).getTime() < now) return false;
  return true;
}

export function PartnersManager({ tenantId, initialSponsors }: { tenantId: string; initialSponsors: Sponsor[] }) {
  const [sponsors, setSponsors] = useState(initialSponsors);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [tier, setTier] = useState("bronze");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError("");

    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("sponsors")
      .insert({
        tenant_id: tenantId,
        name,
        logo_url: logoUrl || null,
        website_url: websiteUrl || null,
        tier,
      })
      .select("id, name, logo_url, website_url, tier, visible_from, visible_to")
      .single();

    if (insertError || !data) {
      setError("Vous n'avez pas les droits pour ajouter un partenaire.");
      setStatus("error");
      return;
    }

    setSponsors((prev) => [...prev, data as Sponsor]);
    setName("");
    setLogoUrl("");
    setWebsiteUrl("");
    setTier("bronze");
    setStatus("idle");
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("sponsors").delete().eq("id", id);
    if (!deleteError) {
      setSponsors((prev) => prev.filter((s) => s.id !== id));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleAdd} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <p className="font-medium text-ink">Ajouter un partenaire</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="Nom du partenaire"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="or">Or</option>
            <option value="argent">Argent</option>
            <option value="bronze">Bronze</option>
          </select>
          <input
            placeholder="URL du logo"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <input
            placeholder="Site web"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={status === "saving"}>
            {status === "saving" ? "Ajout…" : "Ajouter"}
          </Button>
          {status === "error" && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>

      {sponsors.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sponsors.map((s) => (
            <div key={s.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {s.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.logo_url} alt={s.name} className="h-8 w-8 rounded object-contain" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-500">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <p className="font-medium text-ink">{s.name}</p>
                </div>
                <Badge variant={tierVariant[s.tier ?? "bronze"] ?? "neutral"}>{tierLabel[s.tier ?? "bronze"] ?? s.tier}</Badge>
              </div>
              {s.website_url && (
                <a href={s.website_url} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline">
                  {s.website_url.replace(/^https?:\/\//, "")}
                </a>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {isCurrentlyVisible(s) ? "Visible sur le site public" : "Masqué (hors période de visibilité)"}
                </span>
                <button onClick={() => handleDelete(s.id)} className="text-xs text-red-600 hover:underline">
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">Aucun partenaire pour l&apos;instant.</p>
      )}
    </div>
  );
}
