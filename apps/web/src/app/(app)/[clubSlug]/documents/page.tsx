import { Badge } from "@clubos/ui";
import { mockDocuments } from "@/lib/mock-data";

const categoryLabel = { certificat_medical: "Certificat médical", reglement: "Règlement", autre: "Autre" } as const;

function expiryBadge(expiresAt: string | null): { label: string; variant: "success" | "warning" | "danger" | "neutral" } {
  if (!expiresAt) return { label: "Permanent", variant: "neutral" };
  const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Expiré", variant: "danger" };
  if (days <= 30) return { label: `Expire dans ${days} j`, variant: "warning" };
  return { label: `Valide jusqu'au ${expiresAt}`, variant: "success" };
}

export default function DocumentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Documents</h1>

      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {mockDocuments.map((doc) => {
          const badge = expiryBadge(doc.expiresAt);
          return (
            <div key={doc.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-ink">{categoryLabel[doc.category]}</p>
                <p className="text-xs text-slate-500">{doc.owner}</p>
              </div>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
