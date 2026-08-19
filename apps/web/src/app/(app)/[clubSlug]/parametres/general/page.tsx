import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GeneralSettingsForm } from "./GeneralSettingsForm";

export default async function GeneralSettingsPage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug, logo_url, siret")
    .eq("slug", clubSlug)
    .maybeSingle();

  if (!tenant) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Paramètres généraux</h1>
      <GeneralSettingsForm tenant={tenant} />
    </div>
  );
}
