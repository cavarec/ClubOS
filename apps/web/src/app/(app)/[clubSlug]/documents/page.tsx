import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentsClient } from "./DocumentsClient";

export default async function DocumentsPage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", clubSlug).maybeSingle();
  if (!tenant) notFound();

  const { data: documents } = await supabase
    .from("documents")
    .select("id, category, expires_at, file_url, owner:profiles(first_name, last_name)")
    .eq("tenant_id", tenant.id)
    .order("expires_at", { ascending: true, nullsFirst: false });

  type RawDoc = {
    id: string;
    category: string;
    expires_at: string | null;
    file_url: string;
    owner: { first_name: string; last_name: string } | null;
  };

  const docs = (documents ?? []) as unknown as RawDoc[];

  const docsWithUrls = await Promise.all(
    docs.map(async (doc) => {
      const { data: signed } = await supabase.storage.from("documents").createSignedUrl(doc.file_url, 3600);
      return {
        id: doc.id,
        category: doc.category,
        expiresAt: doc.expires_at,
        ownerName: doc.owner ? `${doc.owner.first_name} ${doc.owner.last_name}` : null,
        downloadUrl: signed?.signedUrl ?? null,
      };
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Documents</h1>
      <DocumentsClient tenantId={tenant.id} initialDocs={docsWithUrls} />
    </div>
  );
}
