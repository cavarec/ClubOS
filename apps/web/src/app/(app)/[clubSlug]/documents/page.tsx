import { notFound } from "next/navigation";
import { Badge } from "@clubos/ui";
import { createClient } from "@/lib/supabase/server";

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

export default async function DocumentsPage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", clubSlug).maybeSingle();
  if (!tenant) notFound();

  const { data: documents } = await supabase
    .from("documents")
    .select("id, category, expires_at, owner:profiles(first_name, last_name)")
    .eq("tenant_id", tenant.id)
    .order("expires_at", { ascending: true, nullsFirst: false });

  type RawDoc = {
    id: string;
    category: string;
    expires_at: string | null;
    owner: { first_name: string; last_name: string } | null;
  };

  const docs = (documents ?? []) as unknown as RawDoc[];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Documents</h1>

      {docs.length > 0 ? (
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {docs.map((doc) => {
            const badge = expiryBadge(doc.expires_at);
            return (
              <div key={doc.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-ink">{categoryLabel[doc.category] ?? doc.category}</p>
                  <p className="text-xs text-slate-500">
                    {doc.owner ? `${doc.owner.first_name} ${doc.owner.last_name}` : "Club"}
                  </p>
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
