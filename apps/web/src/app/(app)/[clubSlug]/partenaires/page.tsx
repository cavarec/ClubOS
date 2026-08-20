import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PartnersManager } from "./PartnersManager";

export default async function PartenairesPage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", clubSlug).maybeSingle();
  if (!tenant) notFound();

  const { data: sponsors } = await supabase
    .from("sponsors")
    .select("id, name, logo_url, website_url, tier, visible_from, visible_to")
    .eq("tenant_id", tenant.id)
    .order("tier", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Partenaires</h1>
        <p className="text-sm text-slate-500">Sponsors et partenaires du club, affichés sur le site public.</p>
      </div>
      <PartnersManager tenantId={tenant.id} initialSponsors={sponsors ?? []} />
    </div>
  );
}
