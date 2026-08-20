"use client";

import { useState } from "react";
import { Button } from "@clubos/ui";
import { createClient } from "@/lib/supabase/client";

export function SitePublicForm({
  tenantId,
  clubSlug,
  initialPrimaryColor,
  initialTitle,
  initialBody,
}: {
  tenantId: string;
  clubSlug: string;
  initialPrimaryColor: string;
  initialTitle: string;
  initialBody: string;
}) {
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor);
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");

    const supabase = createClient();
    const [settingsResult, pageResult] = await Promise.all([
      supabase.from("site_settings").upsert({ tenant_id: tenantId, primary_color: primaryColor }, { onConflict: "tenant_id" }),
      supabase
        .from("site_pages")
        .upsert({ tenant_id: tenantId, slug: "accueil", content: { title, body } }, { onConflict: "tenant_id,slug" }),
    ]);

    if (settingsResult.error || pageResult.error) {
      setStatus("error");
      return;
    }

    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6">
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="title">
          Titre d&apos;accueil
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nom du club par défaut si vide"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="body">
          Texte d&apos;accueil
        </label>
        <textarea
          id="body"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="primaryColor">
          Couleur principale
        </label>
        <input
          id="primaryColor"
          type="color"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          className="mt-1 h-10 w-20 rounded-md border border-slate-300"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {status === "saved" && <span className="text-sm text-green-600">Enregistré ✓</span>}
        {status === "error" && <span className="text-sm text-red-600">Vous n&apos;avez pas les droits pour modifier le site public.</span>}
        <a href={`/club/${clubSlug}`} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline">
          Voir le site public →
        </a>
      </div>
    </form>
  );
}
