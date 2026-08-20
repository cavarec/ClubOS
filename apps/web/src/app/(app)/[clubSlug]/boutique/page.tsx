import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BoutiqueClient } from "./BoutiqueClient";

export default async function BoutiquePage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", clubSlug).maybeSingle();
  if (!tenant) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price_cents, active")
    .eq("tenant_id", tenant.id)
    .eq("type", "boutique")
    .order("name", { ascending: true });

  const { data: orders } = user
    ? await supabase
        .from("orders")
        .select("id, status, amount_cents, created_at, product:products(id, name)")
        .eq("tenant_id", tenant.id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Boutique</h1>
        <p className="text-sm text-slate-500">Articles du club et suivi de vos commandes.</p>
      </div>
      <BoutiqueClient tenantId={tenant.id} initialProducts={products ?? []} initialOrders={(orders ?? []) as never} />
    </div>
  );
}
