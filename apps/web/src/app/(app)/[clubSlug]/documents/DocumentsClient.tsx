"use client";

import { useState } from "react";
import { Badge, Button } from "@clubos/ui";
import { createClient } from "@/lib/supabase/client";

const categoryLabel: Record<string, string> = {
  certificat_medical: "Certificat médical",
  reglement: "Règlement",
  autre: "Autre",
};

function expiryBadge(expiresAt: string | null): { label: string; variant: "success" | "warning" | "danger" | "neutral" } {
  if (!expiresAt) return { label: "Permanent", variant: "neutral" };
  const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Expiré", variant: "danger" };
  if (days <= 30) return { label: `Expire dans ${days} j`, variant: "warning" };
  return { label: `Valide jusqu'au ${new Date(expiresAt).toLocaleDateString("fr-FR")}`, variant: "success" };
}

interface DocItem {
  id: string;
  category: string;
  expiresAt: string | null;
  ownerName: string | null;
  downloadUrl: string | null;
}

export function DocumentsClient({ tenantId, initialDocs }: { tenantId: string; initialDocs: DocItem[] }) {
  const [docs, setDocs] = useState(initialDocs);
  const [category, setCategory] = useState("reglement");
  const [expiresAt, setExpiresAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setStatus("saving");
    setError("");

    const supabase = createClient();
    const path = `${tenantId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
    if (uploadError) {
      setError("Vous n'avez pas les droits pour déposer un document.");
      setStatus("error");
      return;
    }

    const { data: doc, error: insertError } = await supabase
      .from("documents")
      .insert({ tenant_id: tenantId, category, file_url: path, expires_at: expiresAt || null })
      .select("id, category, expires_at")
      .single();

    if (insertError || !doc) {
      setError("Fichier déposé mais l'enregistrement a échoué.");
      setStatus("error");
      return;
    }

    const { data: signed } = await supabase.storage.from("documents").createSignedUrl(path, 3600);

    setDocs((prev) => [
      { id: doc.id, category: doc.category, expiresAt: doc.expires_at, ownerName: "Club", downloadUrl: signed?.signedUrl ?? null },
      ...prev,
    ]);
    setFile(null);
    setExpiresAt("");
    setStatus("idle");
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleUpload} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <p className="font-medium text-ink">Déposer un document</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            type="file"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm file:mr-2 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="reglement">Règlement</option>
            <option value="certificat_medical">Certificat médical</option>
            <option value="autre">Autre</option>
          </select>
          <input
            type="date"
            placeholder="Date d'expiration (optionnel)"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={status === "saving" || !file}>
            {status === "saving" ? "Envoi…" : "Déposer"}
          </Button>
          {status === "error" && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>

      {docs.length > 0 ? (
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {docs.map((doc) => {
            const badge = expiryBadge(doc.expiresAt);
            return (
              <div key={doc.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-ink">
                    {doc.downloadUrl ? (
                      <a href={doc.downloadUrl} target="_blank" rel="noreferrer" className="hover:underline">
                        {categoryLabel[doc.category] ?? doc.category}
                      </a>
                    ) : (
                      categoryLabel[doc.category] ?? doc.category
                    )}
                  </p>
                  <p className="text-xs text-slate-500">{doc.ownerName ?? "Club"}</p>
                </div>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-400">Aucun document pour l&apos;instant.</p>
      )}
    </div>
  );
}
