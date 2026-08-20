import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SitePublicForm } from "./SitePublicForm";

interface HeroContent {
  title?: string;
  body?: string;
}

export default async function SitePublicSettingsPage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase.from("tenants").select("id, slug").eq("slug", clubSlug).maybeSingle();
  if (!tenant) notFound();

  const [{ data: settings }, { data: heroPage }] = await Promise.all([
    supabase.from("site_settings").select("primary_color").eq("tenant_id", tenant.id).maybeSingle(),
    supabase.from("site_pages").select("content").eq("tenant_id", tenant.id).eq("slug", "accueil").maybeSingle(),
  ]);

  const hero = (heroPage?.content ?? {}) as HeroContent;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Site public</h1>
        <p className="text-sm text-slate-500">
          Visible sans connexion sur <code>/club/{tenant.slug}</code>.
        </p>
      </div>
      <SitePublicForm
        tenantId={tenant.id}
        clubSlug={tenant.slug}
        initialPrimaryColor={settings?.primary_color ?? "#2563eb"}
        initialTitle={hero.title ?? ""}
        initialBody={hero.body ?? ""}
      />
    </div>
  );
}
