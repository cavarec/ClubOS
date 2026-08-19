import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CommunicationClient } from "./CommunicationClient";

export default async function CommunicationPage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", clubSlug).maybeSingle();
  if (!tenant) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, scope, title, body, created_at, author:profiles(first_name, last_name)")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  type RawPost = {
    id: string;
    scope: "club" | "team" | "supervision";
    title: string;
    body: string;
    created_at: string;
    author: { first_name: string; last_name: string } | null;
  };

  const initialPosts = ((posts ?? []) as unknown as RawPost[]).map((p) => ({
    id: p.id,
    scope: p.scope,
    title: p.title,
    body: p.body,
    author: p.author ? `${p.author.first_name} ${p.author.last_name}` : "—",
    date: new Date(p.created_at).toLocaleDateString("fr-FR"),
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Communication</h1>
      <CommunicationClient tenantId={tenant.id} initialPosts={initialPosts} canPublish={!!user} />
    </div>
  );
}
