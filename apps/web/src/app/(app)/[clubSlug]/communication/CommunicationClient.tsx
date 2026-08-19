"use client";

import { useState } from "react";
import { Badge, Button } from "@clubos/ui";
import { createClient } from "@/lib/supabase/client";

const scopeLabel = { club: "Club", team: "Équipe", supervision: "Comité/Ligue" } as const;

interface Post {
  id: string;
  scope: "club" | "team" | "supervision";
  title: string;
  body: string;
  author: string;
  date: string;
}

export function CommunicationClient({
  tenantId,
  initialPosts,
}: {
  tenantId: string;
  initialPosts: Post[];
  canPublish: boolean;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  async function publish() {
    if (!title.trim() || !body.trim()) return;
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error: insertError } = await supabase
      .from("posts")
      .insert({ tenant_id: tenantId, author_id: user.id, scope: "club", title, body, published_at: new Date().toISOString() })
      .select("id, created_at")
      .single();

    if (insertError) {
      setError("Vous n'avez pas les droits pour publier une actualité.");
      return;
    }

    setPosts((prev) => [
      { id: data.id, scope: "club", title, body, author: "Vous", date: new Date(data.created_at).toLocaleDateString("fr-FR") },
      ...prev,
    ]);
    setTitle("");
    setBody("");
  }

  return (
    <>
      <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de l'actualité"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Contenu…"
          rows={3}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <div className="flex items-center justify-between">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="ml-auto">
            <Button size="sm" onClick={publish}>
              Publier
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <div key={post.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-ink">{post.title}</p>
              <Badge variant={post.scope === "club" ? "brand" : "neutral"}>{scopeLabel[post.scope]}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-600">{post.body}</p>
            <p className="mt-2 text-xs text-slate-400">
              {post.author} · {post.date}
            </p>
          </div>
        ))}
        {posts.length === 0 && <p className="text-sm text-slate-400">Aucune actualité pour l&apos;instant.</p>}
      </div>
    </>
  );
}
