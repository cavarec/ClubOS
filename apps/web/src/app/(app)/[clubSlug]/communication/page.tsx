"use client";

import { useState } from "react";
import { Badge, Button } from "@clubos/ui";
import { mockPosts } from "@/lib/mock-data";

const scopeLabel = { club: "Club", team: "Équipe", supervision: "Comité/Ligue" } as const;

export default function CommunicationPage() {
  const [posts, setPosts] = useState(mockPosts);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function publish() {
    if (!title.trim() || !body.trim()) return;
    setPosts((prev) => [
      { id: crypto.randomUUID(), scope: "club", title, body, author: "Vous", date: new Date().toISOString().slice(0, 10) },
      ...prev,
    ]);
    setTitle("");
    setBody("");
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Communication</h1>

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
        <div className="flex justify-end">
          <Button size="sm" onClick={publish}>
            Publier
          </Button>
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
      </div>
    </div>
  );
}
